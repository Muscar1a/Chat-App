import { apiFetch, ApiError } from "./api"

export interface UserProfile {
  id: string
  avatar?: string
  fullName: string
  email: string
  phone?: string
  bio?: string
  location?: string
  birthday?: string
  website?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  fullName: string
  phone?: string
  bio?: string
  location?: string
  birthday?: string
  website?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
    desktop: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    showLastSeen: boolean
    allowMessageRequests: boolean
    showReadReceipts: boolean
  }
  security: {
    twoFactorAuth: boolean
    loginAlerts: boolean
    sessionTimeout: string
  }
}

class ProfileService {
  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const response = await apiFetch<UserProfile>("/api/profile")
    if (!response.success || !response.data) {
      throw new ApiError("Failed to fetch profile", 500)
    }
    return response.data
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiFetch<UserProfile>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.success || !response.data) {
      throw new ApiError("Failed to update profile", 500)
    }
    return response.data
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || "Failed to upload avatar", response.status)
    }

    return data.data
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiFetch<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new ApiError("Failed to change password", 500)
    }
  }

  // Get user settings
  async getSettings(): Promise<UserSettings> {
    const response = await apiFetch<UserSettings>("/api/settings")
    if (!response.success || !response.data) {
      throw new ApiError("Failed to fetch settings", 500)
    }
    return response.data
  }

  // Update user settings
  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await apiFetch<UserSettings>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
    if (!response.success || !response.data) {
      throw new ApiError("Failed to update settings", 500)
    }
    return response.data
  }

  // Export user data
  async exportData(): Promise<Blob> {
    const response = await fetch("/api/profile/export", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })

    if (!response.ok) {
      throw new ApiError("Failed to export data", response.status)
    }

    return response.blob()
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    const response = await apiFetch<void>("/api/profile/delete", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    })
    if (!response.success) {
      throw new ApiError("Failed to delete account", 500)
    }
  }
}

export const profileService = new ProfileService()
