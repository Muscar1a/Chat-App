"use client"

import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Message {
  id: string;
  message: string;
  created_by: string;
  created_at: string;
};

interface UseWebSocketProps {
  chatId: string | null;
  token: string | null;
  onMessageReceived: (message: Message) => void;
  onOldMessagesLoaded?: (messages: Message[]) => void;
};

export const useWebSocket = ({ chatId, token, onMessageReceived, onOldMessagesLoaded }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const loadOldMessages = async (currentChatId: string) => {
    if (!currentChatId || !token) return;

    setIsLoadingMessages(true);
    try {
      const response = await axios.get(`http://localhost:8000/chat/private/messages/${currentChatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const processedMessages = response.data.map((msg: Message) => ({
        ...msg,
        created_at: new Date(msg.created_at).toISOString() // Ensure consistent format
      }));

      // Sort messages by creation time
      const sortedMessages = processedMessages.sort((a: Message, b: Message) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Call the callback to update messages in the parent component
      if (onOldMessagesLoaded) {
        onOldMessagesLoaded(sortedMessages);
      }

      console.log(`Loaded ${sortedMessages.length} old messages for chat ${currentChatId}`);
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
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionError(null);

        loadOldMessages(chatId);
      };
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageReceived(data);
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
      const messageData = {
        message: message,
      }
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  useEffect(() => {
    if (chatId && token) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [chatId, token]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    connect,
    disconnect,
    loadOldMessages: () => chatId && loadOldMessages(chatId),
  }
}