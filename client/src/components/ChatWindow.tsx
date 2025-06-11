"use client"

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../hooks/useWebSocket";

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const token = localStorage.getItem('token')

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMessageReceived = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOldMessagesLoaded = (oldMessages: Message[]) => {
    setMessages(oldMessages);
  };

  const { isConnected, connectionError, sendMessage } = useWebSocket({
    chatId,
    token,
    onMessageReceived: handleMessageReceived,
    onOldMessagesLoaded: handleOldMessagesLoaded
  })

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
    try {
      sendMessage(messageText);
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
        name={
          user
            ? user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || user.last_name || user.username
            : ""
        }
        status={isConnected ? "Online" : connectionError || "Connecting..."}
        avatar="/original_user_image.jpg?height=40&width=40"
      />
      <div className="messages-container">
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
          <button type="button" className="attachment-button">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            disabled={!isConnected || isLoading}
          />
          <button type="button" className="emoji-button">
            <Smile size={20} />
          </button>
          <button
            type="submit"
            className="send-button"
            disabled={!messageText.trim() || !isConnected || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}