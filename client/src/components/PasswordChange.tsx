"use client"

import type React from "react"
import { useState } from "react"
import { Lock, Eye, EyeOff, Shield, Check } from "lucide-react"
import { profileService } from "../services/profileService"
import { useToast } from "./Toast"
import { ApiError } from "../services/api"

interface PasswordChangeProps {
  onUnsavedChanges: (hasChanges: boolean) => void
}

export default function PasswordChange({ onUnsavedChanges }: PasswordChangeProps) {
  const { addToast } = useToast()

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", met: passwords.newPassword.length >= 8 },
    { text: "Có chữ hoa", met: /[A-Z]/.test(passwords.newPassword) },
    { text: "Có chữ thường", met: /[a-z]/.test(passwords.newPassword) },
    { text: "Có số", met: /\d/.test(passwords.newPassword) },
    { text: "Có ký tự đặc biệt", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword) },
  ]
  const handleInputChange = (field: string, value: string) => {
    const newPasswords = { ...passwords, [field]: value }
    setPasswords(newPasswords)

    // Check if there are unsaved changes
    const hasChanges = Object.values(newPasswords).some((val) => val.length > 0)
    onUnsavedChanges(hasChanges)

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("")
    }
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwords.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại"
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự"
    } else if (!passwordRequirements.every((req) => req.met)) {
      newErrors.newPassword = "Mật khẩu không đáp ứng đủ yêu cầu"
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới"
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await profileService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })      // Reset form
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      onUnsavedChanges(false)

      // Set success message
      setSuccessMessage("Mật khẩu đã được thay đổi thành công!")

      addToast({
        type: "success",
        title: "Đổi mật khẩu thành công!",
        message: "Mật khẩu của bạn đã được cập nhật.",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" })
        } else if (error.status === 422) {
          // Validation error - likely password requirements not met
          setErrors({ newPassword: "Mật khẩu mới không đáp ứng yêu cầu bảo mật" })
        }
        addToast({
          type: "error",
          title: "Lỗi đổi mật khẩu",
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

  return (
    <div className="password-change-container">
      <div className="form-header">
        <h2>Đổi mật khẩu</h2>
        <p>Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
        {successMessage && (
          <div className="success-message">
            <Check size={16} />
            {successMessage}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-section">
          <h3 className="section-title">
            <Lock size={20} />
            Mật khẩu hiện tại *
          </h3>
          <div className="current-info-display">
            <div className="info-item">
              <div className={`password-input-container ${errors.currentPassword ? "error" : ""}`}>
                <input
                  type={showPasswords.current ? "text" : "password"}
                  className="form-input"
                  value={passwords.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("current")}>
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <Shield size={20} />
            Mật khẩu mới *
          </h3>
          <div className="current-info-display">
            <div className="info-item">
              <div className={`password-input-container ${errors.newPassword ? "error" : ""}`}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  className="form-input"
                  value={passwords.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("new")}>
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>
          </div>

          {passwords.newPassword && (
            <div className="password-requirements">
              <h4>Yêu cầu mật khẩu:</h4>
              <ul className="requirements-list">
                {passwordRequirements.map((requirement, index) => (
                  <li key={index} className={`requirement ${requirement.met ? "met" : ""}`}>
                    <Check size={14} className="requirement-icon" />
                    {requirement.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3 className="section-title">
            <Lock size={20} />
            Xác nhận mật khẩu *
          </h3>
          <div className="current-info-display">
            <div className="info-item">
              <div className={`password-input-container ${errors.confirmPassword ? "error" : ""}`}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  className="form-input"
                  value={passwords.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility("confirm")}>
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <Shield size={16} />
                Cập nhật mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
