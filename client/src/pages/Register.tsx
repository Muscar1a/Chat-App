"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import "../styles/auth.css"

export default function Register() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const validateForm = () => {
    const newErrors: {
      fullName?: string
      email?: string
      password?: string
      confirmPassword?: string
      terms?: string
    } = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc"
    }

    if (!email) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    if (!agreeTerms) {
      newErrors.terms = "Bạn phải đồng ý với điều khoản dịch vụ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)

      // Giả lập đăng ký
      setTimeout(() => {
        setIsLoading(false)
        // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        window.location.href = "/login"
      }, 1500)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">Tạo tài khoản để bắt đầu trò chuyện với bạn bè.</p>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <img src="/placeholder.svg?height=20&width=20" alt="Google" className="social-icon" />
            <span>Đăng ký với Google</span>
          </button>
          <button className="social-button facebook">
            <img src="/placeholder.svg?height=20&width=20" alt="Facebook" className="social-icon" />
            <span>Đăng ký với Facebook</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>hoặc đăng ký với email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ và tên
            </label>
            <div className={`input-container ${errors.fullName ? "error" : ""}`}>
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="fullName"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className={`input-container ${errors.email ? "error" : ""}`}>
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className={`input-container ${errors.password ? "error" : ""}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu
            </label>
            <div className={`input-container ${errors.confirmPassword ? "error" : ""}`}>
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          <div className="terms-container">
            <label className="checkbox-container">
              <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)} />
              <span className="checkmark"></span>
              <span>
                Tôi đồng ý với{" "}
                <Link to="/terms" className="terms-link">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link to="/privacy" className="terms-link">
                  Chính sách bảo mật
                </Link>
              </span>
            </label>
            {errors.terms && <p className="error-message">{errors.terms}</p>}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Đăng ký <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản?{" "}
          <Link to="/login" className="auth-link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
