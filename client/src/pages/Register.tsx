// DONE
"use client"

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/auth.css";
import axios from "axios";

export default function Register() {
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    userName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", met: password.length >= 8 },
    { text: "Có chữ hoa", met: /[A-Z]/.test(password) },
    { text: "Có chữ thường", met: /[a-z]/.test(password) },
    { text: "Có số", met: /\d/.test(password) },
    { text: "Có ký tự đặc biệt", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const validateForm = () => {
    const newErrors: {
      userName?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    if (!userName.trim()) {
      newErrors.userName = "Tên người dùng là bắt buộc"
    }

    if (!email) {
      newErrors.email = "Email là bắt buộc"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"
    } else if (!passwordRequirements.every((req) => req.met)) {
      newErrors.password = "Mật khẩu không đáp ứng đủ yêu cầu bảo mật"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)

      try {
        await axios.post("http://localhost:8000/users/register", {
          username: userName,
          email,
          password,
        })
        setIsLoading(false)
        window.location.href = "/login"
      } catch (error: any) {
        setIsLoading(false)
        
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          // Handle structured validation errors from server
          if (errorData.errors && Array.isArray(errorData.errors)) {
            const newErrors: any = {};
            errorData.errors.forEach((err: any) => {
              if (err.field === 'password') {
                newErrors.password = err.message;
              } else if (err.field === 'email') {
                newErrors.email = err.message;
              } else if (err.field === 'username') {
                newErrors.userName = err.message;
              }
            });
            setErrors(newErrors);
          } else if (errorData.message) {
            // Handle single error message
            setErrors((prev) => ({
              ...prev,
              email: errorData.message,
            }));
          } else {
            // Fallback for unknown error structure
            setErrors((prev) => ({
              ...prev,
              email: "Đăng ký không thành công. Vui lòng thử lại.",
            }));
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            email: "Đăng ký không thành công. Vui lòng thử lại.",
          }));
        }
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">Tạo tài khoản để bắt đầu trò chuyện với bạn bè.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              Tên tài khoản
            </label>
            <div className={`input-container ${errors.userName ? "error" : ""}`}>
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="userName"
                className="form-input"
                placeholder="JohnSmith"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            {errors.userName && <p className="error-message">{errors.userName}</p>}
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
            
            {password && (
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
