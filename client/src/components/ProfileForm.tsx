"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Camera, User, Mail, Save } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import { useToast } from "./Toast"
import { ApiError } from "../services/api"

interface ProfileFormProps {
  onUnsavedChanges: (hasChanges: boolean) => void
}

export default function ProfileForm({ onUnsavedChanges }: ProfileFormProps) {
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const [originalData, setOriginalData] = useState(formData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Load profile data when available
  useEffect(() => {
    if (profile) {
      const data = {
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
      }
      setFormData(data)
      setOriginalData(data)
    }
  }, [profile])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
    onUnsavedChanges(hasChanges)
  }, [formData, originalData, onUnsavedChanges])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: "error",
        title: "File quá lớn",
        message: "Kích thước file không được vượt quá 5MB",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      addToast({
        type: "error",
        title: "File không hợp lệ",
        message: "Vui lòng chọn file hình ảnh",
      })
      return
    }

    try {
      setIsLoading(true)
      await uploadAvatar(file)
      addToast({
        type: "success",
        title: "Cập nhật ảnh đại diện thành công!",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: "error",
          title: "Lỗi upload ảnh",
          message: error.message,
        })
      } else {
        addToast({
          type: "error",
          title: "Có lỗi xảy ra khi upload ảnh",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // if (!validateForm()) return


    setIsLoading(true)

    try {
      // Convert camelCase to snake_case for server
      const serverData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      }

      await updateProfile(serverData)
      setOriginalData(formData)
      addToast({
        type: "success",
        title: "Cập nhật thông tin thành công!",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors) {
          setErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])))
        }
        addToast({
          type: "error",
          title: "Lỗi cập nhật thông tin",
          message: error.message,
        })
      } else {
        addToast({
          type: "error",
          title: "Có lỗi xảy ra. Vui lòng thử lại!",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="profile-form-container">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-form-container">
      <div className="form-header">
        <h2>Thông tin cá nhân</h2>
        <p>Cập nhật thông tin cá nhân của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={profile?.avatar || "/original_user_image.jpg?height=80&width=80"}
              alt="Avatar"
              className="avatar-image"
            />
            <button
              type="button"
              className="avatar-edit-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
            />
          </div>
          <div className="avatar-info">
            <h3>Ảnh đại diện</h3>
            <p>Nhấp vào ảnh để thay đổi. Kích thước tối đa 5MB.</p>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Thông tin hiện tại</h3>

          <div className="current-info-display">
            <div className="info-row">
              <div className="info-item">
                <label className="info-label">
                  <User size={16} />
                  Tên
                </label>                
                <input
                type="text"
                className={`form-input ${errors.firstName ? "error" : ""}`}
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Nhập họ và tên"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="info-item">
                <label className="info-label">
                  <User size={16} />
                  Họ
                </label>
                <input
                type="text"
                className={`form-input ${errors.lastName ? "error" : ""}`}
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Nhập họ và tên"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="info-item">
              <label className="info-label">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Nhập email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <Save size={16} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
