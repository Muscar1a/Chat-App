"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import ChatItem from "./ChatItem"
import UserProfile from "./UserProfile"
import UserListModal from "./UserListModal"

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

const mockChats = [
  {
    id: "ai-assistant",
    name: "AI Assistant",
    lastMessage: "How can I help you today?",
    timestamp: "2 min ago",
    unreadCount: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
]

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUserListOpen, setIsUserListOpen] = useState(false)
  const [chats, setChats] = useState(mockChats)

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateNewChat = (userId: string, userName: string, userAvatar: string) => {
    // Check if chat already exists
    const existingChat = chats.find((chat) => chat.id === userId)
    if (existingChat) {
      onSelectChat(existingChat.id)
    } else {
      // Create new chat
      const newChat = {
        id: userId,
        name: userName,
        lastMessage: "Start a new conversation",
        timestamp: "Just now",
        unreadCount: 0,
        avatar: userAvatar,
        isOnline: true,
      }

      const updatedChats = [newChat, ...chats]
      setChats(updatedChats)
      onSelectChat(userId)
    }

    setIsUserListOpen(false)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Messages</h1>
        <UserProfile />
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="chat-list">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChat === chat.id}
            onClick={() => onSelectChat(chat.id)}
          />
        ))}
      </div>

      <button className="new-chat-button" onClick={() => setIsUserListOpen(true)}>
        <Plus size={24} />
      </button>

      <UserListModal
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
        onSelectUser={handleCreateNewChat}
      />
    </div>
  )
}
