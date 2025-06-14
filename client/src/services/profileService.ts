import axios from "axios"

// Create an error class for API errors
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export interface UserProfile {
  id: string
  avatar?: string
  firstName: string
  lastName: string
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
  firstName: string
  lastName: string
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
  private baseURL = 'http://localhost:8000' // Adjust this to match your backend URL

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${this.baseURL}/users/me`, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to fetch profile", 
        error.response?.status || 500
      )
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await axios.put(`${this.baseURL}/users/me`, data, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to update profile", 
        error.response?.status || 500
      )
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const token = localStorage.getItem('token')
      const response = await axios.post(`${this.baseURL}/upload/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      return { avatarUrl: response.data.avatar_url || response.data.url }
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to upload avatar", 
        error.response?.status || 500
      )
    }
  }  // Change password
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      // Convert camelCase to snake_case for API
      const requestData = {
        current_password: data.currentPassword,
        new_password: data.newPassword
      }
      
      console.log('Sending password change request:', { 
        current_password: data.currentPassword ? '[HIDDEN]' : 'empty',
        new_password: data.newPassword ? '[HIDDEN]' : 'empty'
      })
      
      await axios.post(`${this.baseURL}/auth/change-password`, requestData, {
        headers: getAuthHeaders()
      })
    } catch (error: any) {
      console.error('Password change error:', error.response?.data)
      throw new ApiError(
        error.response?.data?.detail || "Failed to change password", 
        error.response?.status || 500
      )
    }
  }

  // Get user settings
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await axios.get(`${this.baseURL}/users/settings`, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to fetch settings", 
        error.response?.status || 500
      )
    }
  }

  // Update user settings
  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    try {
      const response = await axios.put(`${this.baseURL}/users/settings`, settings, {
        headers: getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to update settings", 
        error.response?.status || 500
      )
    }
  }

  // Export user data
  async exportData(): Promise<Blob> {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${this.baseURL}/users/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      })

      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to export data", 
        error.response?.status || 500
      )
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/users/me`, {
        headers: getAuthHeaders(),
        data: { password }
      })
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.detail || "Failed to delete account", 
        error.response?.status || 500
      )
    }
  }
}

export const profileService = new ProfileService()
