"use client"

import type React from "react"

import { useState } from "react"
import { Mail, ArrowLeft, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import "../styles/auth.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = () => {
    if (!email) {
      setError("Email là bắt buộc")
      return false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ")
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateEmail()) {
      setIsLoading(true)

      // Giả lập gửi email khôi phục
      setTimeout(() => {
        setIsLoading(false)
        setIsSubmitted(true)
      }, 1500)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {!isSubmitted ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Quên mật khẩu</h1>
              <p className="auth-subtitle">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className={`input-container ${error ? "error" : ""}`}>
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
                {error && <p className="error-message">{error}</p>}
              </div>

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Gửi hướng dẫn <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Email đã được gửi!</h2>
            <p>Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến {email}. Vui lòng kiểm tra hộp thư của bạn.</p>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
