"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import MessageBubble from "./MessageBubble"
import ChatHeader from "./ChatHeader"

interface ChatWindowProps {
  chatId: string | null
}

const mockMessages = [
  {
    id: "1",
    text: "Hey! How are you doing?",
    sender: "Alice Johnson",
    timestamp: "10:30 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    text: "I'm doing great! Just finished a big project at work. How about you?",
    sender: "You",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    text: "That's awesome! I'd love to hear more about it. Are you free for a call later?",
    sender: "Alice Johnson",
    timestamp: "10:35 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    text: "How about 3 PM?",
    sender: "You",
    timestamp: "10:36 AM",
    isOwn: true,
  },
  {
    id: "5",
    text: "Perfect! I'll call you then 📞",
    sender: "Alice Johnson",
    timestamp: "10:37 AM",
    isOwn: false,
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message,
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  if (!chatId) {
    return (
      <div className="chat-window-empty">
        <div className="empty-state">
          <h2>Welcome to Chat App</h2>
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <ChatHeader name="Alice Johnson" status="Online" avatar="/placeholder.svg?height=40&width=40" />

      <div className="messages-container">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <div className="message-input-wrapper">
          <button type="button" className="attachment-button">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="button" className="emoji-button">
            <Smile size={20} />
          </button>
          <button type="submit" className="send-button" disabled={!message.trim()}>
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
