"use client"

export default function UserProfile() {
  return (
    <div className="user-profile">
      <div className="user-avatar-container">
        <img src="/placeholder.svg?height=40&width=40" alt="Your profile" className="user-avatar" />
        <div className="user-status-indicator" />
      </div>
      <div className="user-info">
        <h3 className="user-name">You</h3>
        <p className="user-status">Online</p>
      </div>
    </div>
  )
}
