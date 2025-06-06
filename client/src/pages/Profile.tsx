"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { Link } from "react-router-dom"
import ProfileForm from "../components/ProfileForm"
import PasswordChange from "../components/PasswordChange"
import AccountSettings from "../components/AccountSettings"
import { useToast } from "../components/Toast"
import "../styles/profile.css"

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { ToastContainer } = useToast()

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: "👤" },
    { id: "password", label: "Đổi mật khẩu", icon: "🔒" },
    { id: "settings", label: "Cài đặt tài khoản", icon: "⚙️" },
  ]

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          <span>Quay lại chat</span>
        </Link>
        <h1 className="profile-title">Cài đặt tài khoản</h1>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-main">
          {activeTab === "profile" && <ProfileForm onUnsavedChanges={setHasUnsavedChanges} />}
          {activeTab === "password" && <PasswordChange onUnsavedChanges={setHasUnsavedChanges} />}
          {activeTab === "settings" && <AccountSettings onUnsavedChanges={setHasUnsavedChanges} />}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="unsaved-changes-banner">
          <div className="banner-content">
            <span>Bạn có thay đổi chưa được lưu</span>
            <button className="save-all-button">
              <Save size={16} />
              Lưu tất cả
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
