"use client"

import { useState, useEffect } from "react"
import { Bell, Shield, Eye, Trash2, Download, AlertTriangle } from "lucide-react"
import { profileService, type UserSettings } from "../services/profileService"
import { useToast } from "./Toast"
import { ApiError } from "../services/api"

interface AccountSettingsProps {
  onUnsavedChanges: (hasChanges: boolean) => void
}

export default function AccountSettings({ onUnsavedChanges }: AccountSettingsProps) {
  const { addToast } = useToast()

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sound: false,
      desktop: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: false,
      allowMessageRequests: true,
      showReadReceipts: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: "30",
    },
  })

  const [originalSettings, setOriginalSettings] = useState(settings)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await profileService.getSettings()
        setSettings(userSettings)
        setOriginalSettings(userSettings)
      } catch (error) {
        if (error instanceof ApiError) {
          addToast({
            type: "error",
            title: "Lỗi tải cài đặt",
            message: error.message,
          })
        }
      } finally {
        setLoadingSettings(false)
      }
    }

    loadSettings()
  }, [addToast])

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    onUnsavedChanges(hasChanges)
  }, [settings, originalSettings, onUnsavedChanges])

  const handleSettingChange = (category: string, setting: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)

    try {
      const updatedSettings = await profileService.updateSettings(settings)
      setOriginalSettings(updatedSettings)
      addToast({
        type: "success",
        title: "Cài đặt đã được lưu!",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: "error",
          title: "Lỗi lưu cài đặt",
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

  const handleExportData = async () => {
    try {
      const blob = await profileService.exportData()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-data-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      addToast({
        type: "success",
        title: "Xuất dữ liệu thành công!",
        message: "File đã được tải xuống.",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: "error",
          title: "Lỗi xuất dữ liệu",
          message: error.message,
        })
      } else {
        addToast({
          type: "error",
          title: "Có lỗi xảy ra khi xuất dữ liệu",
        })
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      addToast({
        type: "error",
        title: "Vui lòng nhập mật khẩu để xác nhận",
      })
      return
    }

    try {
      setIsLoading(true)
      await profileService.deleteAccount(deletePassword)

      // Clear auth token and redirect to login
      localStorage.removeItem("auth_token")
      window.location.href = "/login"

      addToast({
        type: "success",
        title: "Tài khoản đã được xóa",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        addToast({
          type: "error",
          title: "Lỗi xóa tài khoản",
          message: error.message,
        })
      } else {
        addToast({
          type: "error",
          title: "Có lỗi xảy ra khi xóa tài khoản",
        })
      }
    } finally {
      setIsLoading(false)
      setShowDeleteModal(false)
      setDeletePassword("")
    }
  }

  if (loadingSettings) {
    return (
      <div className="account-settings-container">
        <div className="loading-state">
          <div className="loading-spinner large"></div>
          <p>Đang tải cài đặt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-settings-container">
      <div className="form-header">
        <h2>Cài đặt tài khoản</h2>
        <p>Quản lý thông báo, quyền riêng tư và bảo mật</p>
      </div>

      <div className="settings-sections">
        {/* Notifications */}
        <div className="settings-section">
          <h3 className="section-title">
            <Bell size={20} />
            Thông báo
          </h3>

          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Thông báo email</h4>
                <p>Nhận thông báo qua email khi có tin nhắn mới</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange("notifications", "email", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Thông báo đẩy</h4>
                <p>Nhận thông báo đẩy trên thiết bị</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleSettingChange("notifications", "push", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Âm thanh thông báo</h4>
                <p>Phát âm thanh khi có tin nhắn mới</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.sound}
                  onChange={(e) => handleSettingChange("notifications", "sound", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Thông báo desktop</h4>
                <p>Hiển thị thông báo trên màn hình desktop</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.desktop}
                  onChange={(e) => handleSettingChange("notifications", "desktop", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="settings-section">
          <h3 className="section-title">
            <Eye size={20} />
            Quyền riêng tư
          </h3>

          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Hiển thị trạng thái online</h4>
                <p>Cho phép người khác thấy khi bạn đang online</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showOnlineStatus}
                  onChange={(e) => handleSettingChange("privacy", "showOnlineStatus", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Hiển thị lần cuối online</h4>
                <p>Cho phép người khác thấy lần cuối bạn online</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showLastSeen}
                  onChange={(e) => handleSettingChange("privacy", "showLastSeen", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Cho phép yêu cầu tin nhắn</h4>
                <p>Nhận tin nhắn từ người không phải bạn bè</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.allowMessageRequests}
                  onChange={(e) => handleSettingChange("privacy", "allowMessageRequests", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Xác nhận đã đọc</h4>
                <p>Hiển thị khi bạn đã đọc tin nhắn</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.showReadReceipts}
                  onChange={(e) => handleSettingChange("privacy", "showReadReceipts", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="settings-section">
          <h3 className="section-title">
            <Shield size={20} />
            Bảo mật
          </h3>

          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Xác thực hai yếu tố</h4>
                <p>Thêm lớp bảo mật cho tài khoản của bạn</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => handleSettingChange("security", "twoFactorAuth", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Cảnh báo đăng nhập</h4>
                <p>Nhận thông báo khi có đăng nhập từ thiết bị mới</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.security.loginAlerts}
                  onChange={(e) => handleSettingChange("security", "loginAlerts", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Thời gian chờ phiên</h4>
                <p>Tự động đăng xuất sau thời gian không hoạt động</p>
              </div>
              <select
                className="setting-select"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange("security", "sessionTimeout", e.target.value)}
              >
                <option value="15">15 phút</option>
                <option value="30">30 phút</option>
                <option value="60">1 giờ</option>
                <option value="120">2 giờ</option>
                <option value="never">Không bao giờ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3 className="section-title">
            <Download size={20} />
            Quản lý dữ liệu
          </h3>

          <div className="data-actions">
            <button className="action-button export" onClick={handleExportData}>
              <Download size={16} />
              Xuất dữ liệu của tôi
            </button>

            <button className="action-button delete" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={16} />
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="save-button" onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? <span className="loading-spinner"></span> : "Lưu cài đặt"}
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <AlertTriangle size={24} className="warning-icon" />
              <h3>Xóa tài khoản</h3>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị
                xóa vĩnh viễn.
              </p>
              <div className="form-group" style={{ marginTop: "16px" }}>
                <label className="form-label">Nhập mật khẩu để xác nhận:</label>
                <input
                  type="password"
                  className="form-input"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Mật khẩu của bạn"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-button cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="modal-button delete" onClick={handleDeleteAccount} disabled={isLoading}>
                {isLoading ? <span className="loading-spinner"></span> : "Xóa tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
