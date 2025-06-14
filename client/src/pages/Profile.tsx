"use client"

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import PasswordChange from "../components/PasswordChange";
import AccountSettings from "../components/AccountSettings";
import ThemeSettings from "../components/ThemeSettings";
import { useToast } from "../components/Toast";

import "../styles/profile.css";
import "../styles/theme-settings.css";
import 'antd/dist/reset.css';

export default function Profile() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { ToastContainer } = useToast();

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: "👤" },
    { id: "password", label: "Đổi mật khẩu", icon: "🔒" },
    // { id: "settings", label: "Cài đặt tài khoản", icon: "⚙️" },
    { id: "theme", label: "Giao diện", icon: "🎨" },
  ];

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") || "profile")
    }
  }, [searchParams]);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <Link to="/message" className="back-button">
          <ArrowLeft size={20} />
          <span>Quay lại</span>
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
          {activeTab === "theme" && <ThemeSettings onUnsavedChanges={setHasUnsavedChanges} />}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="unsaved-changes-banner">
          <div className="banner-content">
            <span>Bạn có thay đổi chưa được lưu</span>
            {/* <button className="save-all-button">
              <Save size={16} />
              Lưu tất cả
            </button> */}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}