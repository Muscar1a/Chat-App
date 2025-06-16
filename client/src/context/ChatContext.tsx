"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface LastMessage {
  message: string;
  timestamp: string;
  created_at: string;
}

interface ChatContextType {
  activeChat: string | null
  setActiveChat: (chatId: string | null) => void
  lastMessages: Record<string, LastMessage>
  updateLastMessage: (chatId: string, message: LastMessage) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessage>>({})

  const updateLastMessage = (chatId: string, message: LastMessage) => {
    setLastMessages(prev => ({
      ...prev,
      [chatId]: message
    }))
  }

  return (
    <ChatContext.Provider value={{ 
      activeChat, 
      setActiveChat, 
      lastMessages, 
      updateLastMessage 
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
