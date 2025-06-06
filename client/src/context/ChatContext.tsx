"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ChatContextType {
  activeChat: string | null
  setActiveChat: (chatId: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChat, setActiveChat] = useState<string | null>(null)

  return <ChatContext.Provider value={{ activeChat, setActiveChat }}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
