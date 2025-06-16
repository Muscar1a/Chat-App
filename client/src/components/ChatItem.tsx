"use client"
import { Chat } from "../types/chat";

interface ChatItemProps {
  chat: Chat
  isSelected: boolean
  onClick: () => void
}

export default function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  // Since the message is already decrypted in SideBar, we can display it directly
  return (
    <div className={`chat-item ${isSelected ? "selected" : ""}`} onClick={onClick}>
      <div className="chat-item-avatar-container">
        <img src={chat.avatar || "/original_user_image.jpg"} alt={chat.name} className="chat-item-avatar" />
        {chat.isOnline && <div className="online-indicator" />}
      </div>

      <div className="chat-item-content">
        <div className="chat-item-header">
          <h4 className="chat-item-name">{chat.name}</h4>
          <span className="chat-item-timestamp">{chat.timestamp}</span>
        </div>
        <div className="chat-item-footer">
          <p className="chat-item-message">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
        </div>
      </div>
    </div>
  )
}
