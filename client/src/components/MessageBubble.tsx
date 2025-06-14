"use client"

interface Message {
  id: string
  text: string
  sender: string
  timestamp: string
  isOwn: boolean
  avatar?: string
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`message-bubble-container ${message.isOwn ? "own" : "other"}`}>
      {!message.isOwn && (
        <img
          src={message.avatar || "/original_user_image.jpg?height=32&width=32"}
          alt={message.sender}
          className="message-avatar"
        />
      )}
      <div className={`message-bubble ${message.isOwn ? "own" : "other"}`}>
        <p className="message-text">{message.text}</p>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
  )
}
