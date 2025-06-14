"use client"

import { Phone, Video, MoreVertical } from "lucide-react"

interface ChatHeaderProps {
  name: string
  status: string
  avatar: string
  statusColor?: string
}

export default function ChatHeader({ name, status, avatar, statusColor = "#10b981" }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="chat-header-avatar-container">
          <img src={avatar || "/original_user_image.jpg"} alt={name} className="chat-header-avatar" />
          <div className="chat-header-status-indicator" style={{ background: statusColor }} />
        </div>
        <div className="chat-header-details">
          <h3 className="chat-header-name">{name}</h3>
          <p className="chat-header-status" style={{ color: statusColor }}>
            {status}
          </p>
        </div>
      </div>

      {/* <div className="chat-header-actions">
        <button className="header-action-button">
          <Phone size={20} />
        </button>
        <button className="header-action-button">
          <Video size={20} />
        </button>
        <button className="header-action-button">
          <MoreVertical size={20} />
        </button>
      </div> */}
    </div>
  )
}
