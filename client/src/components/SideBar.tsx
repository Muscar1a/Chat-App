"use client"

import { useState } from "react"
import { Search, Plus, MoreVertical } from "lucide-react"
import ChatItem from "./ChatItem"
import UserProfile from "./UserProfile"

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

const mockChats = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Hey! How are you doing?",
    timestamp: "2 min ago",
    unreadCount: 2,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "Thanks for the help yesterday!",
    timestamp: "1 hour ago",
    unreadCount: 0,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  {
    id: "3",
    name: "Team Project",
    lastMessage: "Meeting at 3 PM tomorrow",
    timestamp: "3 hours ago",
    unreadCount: 5,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    isGroup: true,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    lastMessage: "Can you review this document?",
    timestamp: "Yesterday",
    unreadCount: 1,
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
]

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = mockChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <UserProfile />
        <div className="header-actions">
          <button className="icon-button">
            <Plus size={20} />
          </button>
          <button className="icon-button">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
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
    </div>
  )
}
