"use client"

import { LogOut, User, Palette, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ThemeSettings from "./ThemeSettings";
import "../styles/user-profile.css";

export default function UserProfile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { logout, user, loading } = useAuth()
  const navigate = useNavigate()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
    }
  }

  const handleThemeSettings = () => {
    setIsThemeSettingsOpen(true)
    setIsDropdownOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (loading || !user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile loading">
          <div className="user-avatar-container">
            <div className="user-avatar skeleton"></div>
          </div>
          <div className="user-info">
            <div className="user-name skeleton"></div>
            <div className="user-status skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      <div className="user-profile" onClick={toggleDropdown}>
        <div className="user-avatar-container">
          <img
            src={user?.avatar || "/original_user_image.jpg?height=40&width=40"}
            alt="Your profile"
            className="user-avatar"
          />
        </div>
        <div className="user-info">
          <h3 className="user-name">{user?.username || "John Doe"}</h3>
          <p className="user-status">Online</p>
        </div>
        <div className="dropdown-arrow">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-user-avatar">
              <img
                src={user?.avatar || "/original_user_image.jpg?height=40&width=40"}
                alt={user?.username || "Loading ..."}
              />
            </div>
            <div className="dropdown-user-info">
              <p className="dropdown-user-name">{user?.username || "Loading ..."}</p>
              <p className="dropdown-user-email">{user?.email || "Loading ..."}</p>
            </div>
          </div>

          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => navigate('/profile')}>
              <User size={18} />
              <span>Profile Settings</span>
            </button>
            <button className="dropdown-item">
              <Settings size={18} />
              <span>Preferences</span>
            </button>
            <button className="dropdown-item" onClick={handleThemeSettings}>
              <Palette size={18} />
              <span>Theme Settings</span>
            </button>
            <button className="dropdown-item sign-out" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      <ThemeSettings isOpen={isThemeSettingsOpen} onClose={() => setIsThemeSettingsOpen(false)} />
    </div>
  )
}