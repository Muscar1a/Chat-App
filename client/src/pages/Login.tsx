"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import "../styles/auth.css"
import axios from "axios"
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ userName?: string; password?: string; }>({})
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { userName?: string; password?: string } = {}

    if (!userName) {
      newErrors.userName = "Tên người dùng là bắt buộc"
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc"
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)

      try {
        const params = new URLSearchParams();
        params.append('username', userName);
        params.append('password', password);
        // FIXME
        const response = await axios.post("http://localhost:8000/auth/login", 
          params,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        login(response.data.access_token); 
        navigate("/message");
      } catch (error: any) {
        setIsLoading(false);
        if (error.response && error.response.data) {
          setErrors({
            ...errors,
            userName: error.response.data.detail || "Tài khoản hoặc mật khẩu không đúng"
          });
        } else {
          setErrors({
            ...errors,
            userName: "Đăng nhập thất bại. Vui lòng thử lại."
          });
        }
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Đăng nhập</h1>
          <p className="auth-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>


        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              User Name
            </label>
            <div className={`input-container ${errors.userName ? "error" : ""}`}>
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                id="userName"
                className="form-input"
                placeholder="JohnDoe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            {errors.userName && <p className="error-message">{errors.userName}</p>}
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

          {/*<div className="remember-me">
            <label className="checkbox-container">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
              <span className="checkmark"></span>
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div> */}

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
