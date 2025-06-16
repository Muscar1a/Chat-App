"use client"

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import { useAuth } from "../context/AuthContext";
import { useE2E } from "../context/E2EContext";
import { useWebSocket } from "../hooks/useWebSocket";
import axios from "axios";
import { getDisplayName } from "../utils/userUtils";
import { generateAESKeyAndIV, encryptMessageWithAES, encryptAESKeyWithRSA } from "../utils/Encryption";
import { decryptPrivateKey, decryptAESKeyWithPrivateKey, decryptMessageWithAES } from "../utils/Decryption";
import forge from "node-forge";

interface Message {
  id: string
  message: string
  created_at: string
  created_by: string
};

interface ChatWindowProps {
  chatId: string | null
};

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatInfo, setChatInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { isE2EReady, EE2EInput } = useE2E()
  const token = localStorage.getItem('token')

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMessageReceived = (newMessage: Message) => {
    // Check if this message is from current user and was just sent
    // (to avoid duplicates since we already add it immediately when sending)
    const isOwnMessage = newMessage.created_by === user?.id;
    const isRecentMessage = Date.now() - new Date(newMessage.created_at).getTime() < 5000; // Within 5 seconds
    
    if (isOwnMessage && isRecentMessage) {
      // Update the temporary message with the real server data
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.created_by === user?.id && 
            Math.abs(Date.now() - new Date(lastMessage.created_at).getTime()) < 10000) {
          // Replace the last message with server version (keeping plaintext display)
          return [...prev.slice(0, -1), {
            ...newMessage,
            message: lastMessage.message // Keep the plaintext we displayed
          }];
        }
        return prev; // Don't add if no matching temp message found
      });
    } else {
      // Add new message from other users normally
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const handleOldMessagesLoaded = (oldMessages: Message[]) => {
    setMessages(oldMessages);
  };

  const { isConnected, connectionError, sendMessage } = useWebSocket({
    chatId,
    token,
    user,
    EE2EInput,
    decryptPrivateKey,
    decryptAESKeyWithPrivateKey,
    decryptMessageWithAES,
    onMessageReceived: handleMessageReceived,
    onOldMessagesLoaded: handleOldMessagesLoaded,
  });

  // Load chat info when chatId changes
  useEffect(() => {
    const loadChatInfo = async () => {
      if (!chatId || !isE2EReady) {
        setChatInfo(null);
        return;
      }

      console.log("Loading chat info for chat:", chatId, "with E2E ready");

      try {
        const response = await axios.get(`http://localhost:8000/chat/private/info/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setChatInfo(response.data);
        console.log("Chat info loaded:", response.data);
      } catch (error) {
        console.error("Error loading chat info:", error);
        setChatInfo(null);
      }
    };

    loadChatInfo();
  }, [chatId, token, isE2EReady]);

  // Helper function to get display name for the chat recipient
  const getChatRecipientName = () => {
    if (!chatInfo?.recipient_profile) {
      return "Unknown User";
    }
    
    return getDisplayName(chatInfo.recipient_profile);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      setMessages([]);
    }
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !isConnected) return;

    setIsLoading(true);
    const originalMessage = messageText; // Store original message for display
    
    try {
      // Check if we have everything needed for encryption
      if (!isE2EReady || !EE2EInput || !user || !chatInfo?.recipient_profile) {
        console.warn("Missing encryption requirements, sending plain message");
        // Fallback: send plain message with required server fields
        const plainMessagePayload = {
          message: messageText,
          encrypted_key_sender: "",
          encrypted_key_receiver: "",
          iv: "",
          created_by: user?.id || "",
          id: chatId,
        };
        
        // Add message to UI immediately with plaintext
        const immediateMessage = {
          id: Date.now().toString(), // Temporary ID
          message: originalMessage, // Show plaintext in UI
          created_by: user?.id || "",
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, immediateMessage]);
        
        sendMessage(JSON.stringify(plainMessagePayload));
        setMessageText("");
        return;
      }

      const messageContent = messageText;

      // Generate AES key and IV for encryption
      const { key: aesKey, iv } = generateAESKeyAndIV();

      // Get keys
      const receiverPublicKeyPem = chatInfo.recipient_profile.public_key_pem;
      const myPublicKeyPem = user.public_key_pem;
      const myEncryptedPrivateKeyPem = user.private_key_pem;

      if (!receiverPublicKeyPem || !myEncryptedPrivateKeyPem || !myPublicKeyPem) {
        console.error("Missing keys for encryption");
        return;
      }

      // Verify we can decrypt private key (for validation)
      try {
        decryptPrivateKey(myEncryptedPrivateKeyPem, EE2EInput);
      } catch (error) {
        console.error("Failed to decrypt private key:", error);
        return;
      }

      // Encrypt message with AES
      const cipherText = encryptMessageWithAES(messageContent, aesKey, iv);
      
      // Encrypt AES key with RSA public keys
      const encryptedKeyForReceiver = encryptAESKeyWithRSA(aesKey, receiverPublicKeyPem);
      const encryptedKeyForSender = encryptAESKeyWithRSA(aesKey, myPublicKeyPem);

      // Add message to UI immediately with plaintext (before sending to server)
      const immediateMessage = {
        id: Date.now().toString(), // Temporary ID until server responds
        message: originalMessage, // Show plaintext in UI
        created_by: user.id,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, immediateMessage]);

      // Create encrypted message payload for server
      const messagePayload = {
        message: cipherText, // Send ciphertext to server
        encrypted_key_sender: encryptedKeyForSender,
        encrypted_key_receiver: encryptedKeyForReceiver,
        iv: forge.util.bytesToHex(iv),
        created_by: user.id,
        id: chatId,
      };

      console.log("Sending encrypted message payload:", messagePayload);
      // Send through WebSocket
      sendMessage(JSON.stringify(messagePayload));
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  };

  if (!chatId) {
    return (
      <div className="chat-window-empty">
        <div className="empty-state">
          <h2>Welcome to Chat App</h2>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    )
  };

  return (
    <div className="chat-window">
      <ChatHeader
        name={getChatRecipientName()}
        status={
          chatInfo?.recipient_profile?.is_online 
            ? "Online" 
            : isConnected 
              ? "Offline" 
              : connectionError || "Connecting..."
        }
        avatar={chatInfo?.recipient_profile?.avatar || "/original_user_image.jpg?height=40&width=40"}
      />
      <div className="messages-container">
        {!isE2EReady && (
          <div className="e2e-loading-notice">
            <div className="e2e-loading-content">
              <div className="e2e-loading-spinner"></div>
              <p>Setting up end-to-end encryption...</p>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          // Convert API message format to component expected format
          const messageForComponent = {
            id: msg.id,
            text: msg.message,
            sender: msg.created_by === user?.id ? "You" : "Other",
            timestamp: formatTimestamp(msg.created_at),
            isOwn: msg.created_by === user?.id,
          }
          return <MessageBubble key={msg.id} message={messageForComponent} />
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <div className="message-input-wrapper">
          <button type="button" className="attachment-button" disabled={!isE2EReady}>
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isE2EReady ? "Type a message..." : "Setting up encryption..."}
            className="message-input"
            disabled={!isConnected || isLoading || !isE2EReady}
          />
          <button type="button" className="emoji-button" disabled={!isE2EReady}>
            <Smile size={20} />
          </button>
          <button
            type="submit"
            className="send-button"
            disabled={!messageText.trim() || !isConnected || isLoading || !isE2EReady}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}