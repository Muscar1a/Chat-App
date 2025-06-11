"use client"

import { useEffect, useRef } from "react"
import { X, Sun, Moon, Monitor, Check } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import "../styles/theme-settings.css"

interface ThemeSettingsProps {
  isOpen: boolean
  onClose: () => void
  isInline?: boolean
}

export default function ThemeSettings({ isOpen, onClose, isInline = false }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()
  const modalRef = useRef<HTMLDivElement>(null)

  const themes = [
    {
      id: "light",
      name: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark",
      description: "Easy on the eyes in low light",
      icon: Moon,
    },
    {
      id: "system",
      name: "System",
      description: "Follows your device settings",
      icon: Monitor,
    },
  ]

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])
  if (!isOpen && !isInline) return null

  const content = (
    <div className="theme-settings">
      <div className="theme-section">
        <h3 className="theme-section-title">Chế độ hiển thị</h3>
        <p className="theme-description">Chọn chế độ hiển thị phù hợp với bạn</p>        <div className="theme-options">
          {themes.map((themeOption) => {
            const IconComponent = themeOption.icon
            const isSelected = theme === themeOption.id

            return (
              <div
                key={themeOption.id}
                className={`theme-option ${isSelected ? "selected" : ""}`}
                onClick={() => setTheme(themeOption.id as "light" | "dark" | "system")}
              >
                <div className="theme-option-icon">
                  <IconComponent size={24} />
                </div>
                <div className="theme-option-content">
                  <h4 className="theme-option-name">{themeOption.name}</h4>
                  <p className="theme-option-description">{themeOption.description}</p>
                </div>
                {isSelected && (
                  <div className="theme-option-check">
                    <Check size={20} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="theme-section">
        <h3 className="theme-section-title">Xem trước</h3>
        <div className="preview-container">
          <div className="preview-sidebar">
            <div className="preview-header">Tin nhắn</div>
            <div className="preview-chat-item">
              <div className="preview-avatar"></div>
              <div className="preview-content">
                <div className="preview-name">Nguyễn Văn A</div>
                <div className="preview-message">Xin chào!</div>
              </div>
            </div>
          </div>
          <div className="preview-chat">
            <div className="preview-chat-header">Chat với AI</div>
            <div className="preview-messages">
              <div className="preview-message-bubble own">Chào bạn!</div>
              <div className="preview-message-bubble other">Tôi có thể giúp gì cho bạn?</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isInline) {
    return content
  }

  return (
    <div className="modal-overlay">
      <div className="theme-settings-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Cài đặt giao diện</h2>
          <button className="modal-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {content}
      </div>
    </div>
  )
}
