"use client"

import { Link } from "react-router-dom"
import { MessageCircle, Users, Shield, Zap, ArrowRight, Github, Twitter, Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "../styles/homepage.css"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="hero">
        <div className="container">
          <h1 className="hero-title">Chat với bạn bè mọi lúc mọi nơi</h1>
          <p className="hero-subtitle">
            Một ứng dụng trò chuyện đơn giản, nhanh chóng và bảo mật
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/message" className="btn btn-primary">
                Đi đến tin nhắn <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  Đăng nhập <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-outline">
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Tính năng nổi bật</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MessageCircle size={32} />
              </div>
              <h3>Trò chuyện dễ dàng</h3>
              <p>Giao diện đơn giản, thân thiện với người dùng</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Trò chuyện nhóm</h3>
              <p>Tạo nhóm chat và kết nối với nhiều người cùng lúc</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Bảo mật tối đa</h3>
              <p>Tin nhắn được mã hóa đầu cuối để bảo vệ quyền riêng tư</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Nhanh chóng</h3>
              <p>Trải nghiệm mượt mà với thời gian phản hồi tức thì</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>Chat App</h2>
              <p>Kết nối mọi người, mọi lúc mọi nơi</p>
            </div>
            <div className="footer-links">
              <div className="social-links">
                <a href="#" aria-label="Github">
                  <Github size={20} />
                </a>
                <a href="#" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" aria-label="Email">
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Chat App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}