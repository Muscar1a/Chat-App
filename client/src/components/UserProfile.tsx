"use client"

import { LogOut } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function UserProfile() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  return (
    <div className="user-profile">
      <div className="user-avatar-container">
        <img src="/placeholder.svg?height=40&width=40" alt="Your profile" className="user-avatar" />
        <div className="user-status-indicator" />
      </div>
      <div className="user-info">
        <h3 className="user-name">{user?.username || "Bạn"}</h3>
        <p className="user-status">Online</p>
      </div>
      <button className="logout-button" onClick={handleLogout} title="Logout">
        <LogOut size={18} />
      </button>
    </div>
  )
}
