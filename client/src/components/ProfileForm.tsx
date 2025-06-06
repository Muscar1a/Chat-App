"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Camera, User, Mail, Phone, MapPin, Calendar, Edit3, Save } from "lucide-react"
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
    fullName: "",
    phone: "",
    bio: "",
    location: "",
    birthday: "",
    website: "",
  })

  const [originalData, setOriginalData] = useState(formData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      const data = {
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        location: profile.location || "",
        birthday: profile.birthday || "",
        website: profile.website || "",
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc"
    }

    if (formData.phone && !/^[+]?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website phải bắt đầu bằng http:// hoặc https://"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await updateProfile(formData)
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
              src={profile?.avatar || "/placeholder.svg?height=120&width=120"}
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

        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Thông tin cơ bản</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Họ và tên *
              </label>
              <input
                type="text"
                className={`form-input ${errors.fullName ? "error" : ""}`}
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Nhập họ và tên"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ""}
                disabled
                title="Email không thể thay đổi"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} />
                Số điện thoại
              </label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? "error" : ""}`}
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Ngày sinh
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3 className="section-title">Thông tin bổ sung</h3>

          <div className="form-group">
            <label className="form-label">
              <Edit3 size={16} />
              Giới thiệu bản thân
            </label>
            <textarea
              className="form-textarea"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} />
                Địa chỉ
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="form-group">
              <label className="form-label">🌐 Website</label>
              <input
                type="url"
                className={`form-input ${errors.website ? "error" : ""}`}
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://example.com"
              />
              {errors.website && <span className="error-message">{errors.website}</span>}
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
