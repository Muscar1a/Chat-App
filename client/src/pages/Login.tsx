"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import "../styles/auth.css"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)

      // Giả lập đăng nhập
      setTimeout(() => {
        setIsLoading(false)
        // Chuyển hướng đến trang chính sau khi đăng nhập thành công
        window.location.href = "/"
      }, 1500)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <img src="/placeholder.svg?height=20&width=20" alt="Google" className="social-icon" />
            <span>Đăng nhập với Google</span>
          </button>
          <button className="social-button facebook">
            <img src="/placeholder.svg?height=20&width=20" alt="Facebook" className="social-icon" />
            <span>Đăng nhập với Facebook</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>hoặc đăng nhập với email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div className="password-label-container">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>
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

          <div className="remember-me">
            <label className="checkbox-container">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <span className="checkmark"></span>
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Đăng nhập <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="auth-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
