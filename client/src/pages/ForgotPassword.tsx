import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Lock, Eye, EyeOff, Key } from 'lucide-react';
import axios from 'axios';
import { forgotPasswordRoute, resetPasswordRoute } from '../utils/APIRoutes';
import '../styles/auth.css';

export default function ForgotPassword() {
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setTokenState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const navigate = useNavigate();
  const { urlToken } = useParams<{ urlToken: string }>();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromQuery = queryParams.get('token');

    if (urlToken) {
      setTokenState(urlToken);
      setMode('reset');
    } else if (tokenFromQuery) {
      setTokenState(tokenFromQuery);
      setMode('reset');
    }
  }, [urlToken, location.search]);

  const validateEmail = () => {
    if (!email) {
      setError('Email là bắt buộc');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    setError(null);
    return true;
  };

  const validatePasswordReset = () => {
    if (!newPassword) {
      setError('Mật khẩu mới là bắt buộc');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    setError(null);
    return true;
  };

  const handleRequestResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await axios.post(forgotPasswordRoute, { 
        email 
      });
      setSuccessMessage(response.data.msg || "Nếu email đã được đăng ký, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.");
    } catch (err: any) {
      console.error('Request password reset error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!validatePasswordReset()) return;

    setLoading(true);
    try {
      const response = await axios.post(resetPasswordRoute, {
        token: token,
        new_password: newPassword,
      });
      setSuccessMessage(response.data.msg || "Mật khẩu đã được đặt lại thành công.");
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' } 
        });
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Không thể đặt lại mật khẩu. Token có thể không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'request') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          {!successMessage ? (
            <>
              <div className="auth-header">
                <h1 className="auth-title">Quên mật khẩu</h1>
                <p className="auth-subtitle">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
              </div>

              <form onSubmit={handleRequestResetSubmit} className="auth-form">
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

                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? (
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
              <p>{successMessage}</p>
            </div>
          )}

          <p className="auth-footer">
            <Link to="/login" className="back-link">
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Reset password mode
  return (
    <div className="auth-container">
      <div className="auth-card">
        {!successMessage ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Đặt lại mật khẩu</h1>
              <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="auth-form">
              {/* <div className="form-group">
                <label htmlFor="token" className="form-label">
                  Token
                </label>
                <div className="input-container">
                  <Key size={18} className="input-icon" />
                  <input
                    type="text"
                    id="token"
                    className="form-input"
                    placeholder="Nhập token từ email"
                    value={token}
                    onChange={(e) => setTokenState(e.target.value)}
                    readOnly={!!urlToken}
                  />
                </div>
              </div> */}

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Mật khẩu mới
                </label>
                <div className={`input-container ${error ? "error" : ""}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className="form-input"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmNewPassword" className="form-label">
                  Xác nhận mật khẩu mới
                </label>
                <div className={`input-container ${error ? "error" : ""}`}>
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    id="confirmNewPassword"
                    className="form-input"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  >
                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Đặt lại mật khẩu <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Đặt lại mật khẩu thành công!</h2>
            <p>{successMessage}</p>
            <p className="auth-subtitle">Bạn sẽ được chuyển hướng đến trang đăng nhập...</p>
          </div>
        )}

        <p className="auth-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
