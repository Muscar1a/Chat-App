"use client"

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useChat } from "../context/ChatContext";

interface Message {
  id: string;
  message: string;
  created_by: string;
  created_at: string;
  encrypted_key_sender?: string;
  encrypted_key_receiver?: string;
  iv?: string;
};

interface UseWebSocketProps {
  chatId: string | null;
  token: string | null;
  user: any; // Add user object
  EE2EInput: string; // Add E2E encryption input
  decryptPrivateKey: (encryptedKey: string, password: string) => string; // Add decrypt functions
  decryptAESKeyWithPrivateKey: (encryptedKey: string, privateKey: string) => string;
  decryptMessageWithAES: (encryptedMessage: string, aesKey: string, iv: string) => string;
  onMessageReceived: (message: Message) => void;
  onOldMessagesLoaded?: (messages: Message[]) => void;
};

export const useWebSocket = ({ 
  chatId, 
  token, 
  user, 
  EE2EInput, 
  decryptPrivateKey, 
  decryptAESKeyWithPrivateKey, 
  decryptMessageWithAES, 
  onMessageReceived, 
  onOldMessagesLoaded 
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { updateLastMessage } = useChat();

  const loadOldMessages = async (currentChatId: string) => {
    if (!currentChatId || !token || !user || !EE2EInput) return;

    setIsLoadingMessages(true);
    try {
      const response = await axios.get(`http://localhost:8000/chat/private/messages/${currentChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Validate encryption data before attempting to decrypt
      if (!user.private_key_pem) {
        console.warn("User private key not available");
        if (onOldMessagesLoaded) {
          onOldMessagesLoaded([]);
        }
        return;
      }

      // Decrypt private key with error handling
      let myPrivateKeyPem: string;
      try {
        const myEncryptedPrivateKeyPem = user.private_key_pem;
        myPrivateKeyPem = decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);
      } catch (decryptError) {
        console.error("Failed to decrypt private key - incorrect password?", decryptError);
        // Return empty messages if we can't decrypt the private key
        if (onOldMessagesLoaded) {
          onOldMessagesLoaded([]);
        }
        return;
      }

      // Decrypt messages
      const decryptedMessages = await Promise.all(
        response.data.map(async (msg: Message) => {
          try {
            const encryptedKey = msg.created_by === user.id
              ? msg.encrypted_key_sender
              : msg.encrypted_key_receiver;

            if (!encryptedKey || !msg.iv) {
              throw new Error("Missing encryption data");
            }

            const aesKey = decryptAESKeyWithPrivateKey(encryptedKey, myPrivateKeyPem);
            const plaintext = decryptMessageWithAES(msg.message, aesKey, msg.iv);

            return {
              ...msg,
              message: plaintext,
              created_at: new Date(msg.created_at).toISOString() // Ensure consistent format
            };
          } catch (error) {
            console.error("Error decrypting message:", error);
            return {
              ...msg,
              created_at: new Date(msg.created_at).toISOString()
            }; // Return the original message if decryption fails
          }
        })
      );

      // Sort messages by creation time
      const sortedMessages = decryptedMessages.sort((a: Message, b: Message) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Call the callback to update messages in the parent component
      if (onOldMessagesLoaded) {
        onOldMessagesLoaded(sortedMessages);
      }

      console.log(`Loaded and decrypted ${sortedMessages.length} old messages for chat ${currentChatId}`);
    } catch (error) {
      console.error("Error fetching old messages:", error);
      if (onOldMessagesLoaded) {
        onOldMessagesLoaded([]);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const connect = () => {
    if (!chatId || !token) return;

    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      const wsUrl = `ws://localhost:8000/ws/chat/private/${chatId}?token=${token}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log(`WebSocket connection opened for chat ID: ${chatId}`);
        setIsConnected(true);
        setConnectionError(null);

        loadOldMessages(chatId);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Decrypt the incoming message
          if (!user?.private_key_pem || !EE2EInput) {
            console.warn("Missing encryption data for incoming message");
            const fallbackMessage = {
              ...data,
              created_at: new Date(data.created_at).toISOString(),
            };
            
            onMessageReceived(fallbackMessage);
            
            // Update last message in context
            updateLastMessage(chatId, {
              message: data.message,
              timestamp: new Date(data.created_at).toLocaleTimeString(),
              created_at: new Date(data.created_at).toISOString(),
            });
            return;
          }

          try {
            const myEncryptedPrivateKeyPem = user.private_key_pem;
            const myPrivateKeyPem = decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);

            const encryptedAESKey = (data.created_by === user.id)
              ? data.encrypted_key_sender
              : data.encrypted_key_receiver;

            if (!encryptedAESKey || !data.iv) {
              throw new Error("Missing encryption data for incoming message");
            }

            const aesKey = decryptAESKeyWithPrivateKey(encryptedAESKey, myPrivateKeyPem);
            const plaintext = decryptMessageWithAES(data.message, aesKey, data.iv);
            
            const decryptedMessage = {
              ...data,
              message: plaintext,
              created_at: new Date(data.created_at).toISOString(),
            };
            
            // Call callback with decrypted message
            onMessageReceived(decryptedMessage);
            
            // Update last message in context
            updateLastMessage(chatId, {
              message: plaintext,
              timestamp: new Date(data.created_at).toLocaleTimeString(),
              created_at: new Date(data.created_at).toISOString(),
            });
          } catch (decryptError) {
            console.error("Error decrypting incoming message:", decryptError);
            const fallbackMessage = {
              ...data,
              created_at: new Date(data.created_at).toISOString(),
            };
            
            // Pass original message if decryption fails
            onMessageReceived(fallbackMessage);
            
            // Update last message in context with encrypted message
            updateLastMessage(chatId, {
              message: data.message,
              timestamp: new Date(data.created_at).toLocaleTimeString(),
              created_at: new Date(data.created_at).toISOString(),
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Connection failed");
        setIsConnected(false);
      };

      wsRef.current = websocket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionError('Failed to connect')
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const sendMessage = (message: string) => {
    if (wsRef.current && isConnected) {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(message);
        console.log("Sending message:", parsed);
        wsRef.current.send(message);
      } catch (parseError) {
        // If not valid JSON, create proper message structure
        console.log("Sending plain text message:", message);
        const messageData = {
          message: message,
          encrypted_key_sender: "",
          encrypted_key_receiver: "",
          iv: "",
        };
        wsRef.current.send(JSON.stringify(messageData));
      }
    }
  };

  useEffect(() => {
    if (chatId && token && EE2EInput) {
      console.log("Connecting to WebSocket with E2E ready");
      connect();
    } else {
      console.log("Not connecting to WebSocket - missing requirements:", {
        chatId: !!chatId,
        token: !!token,
        EE2EInput: !!EE2EInput
      });
    }
    return () => {
      disconnect();
    };
  }, [chatId, token, EE2EInput]);

  return {
    isConnected,
    connectionError,
    isLoadingMessages,
    sendMessage,
    connect,
    disconnect,
    loadOldMessages: () => chatId && loadOldMessages(chatId),
  }
}