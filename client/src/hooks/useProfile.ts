"use client"

import { useState, useEffect } from "react"
import { profileService, type UserProfile } from "../services/profileService"
import { ApiError } from "../services/api"

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const profileData = await profileService.getProfile()
      setProfile(profileData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError("Failed to load profile")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const updatedProfile = await profileService.updateProfile(data)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new Error("Failed to update profile")
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      const result = await profileService.uploadAvatar(file)
      if (profile) {
        setProfile({ ...profile, avatar: result.avatarUrl })
      }
      return result.avatarUrl
    } catch (err) {
      if (err instanceof ApiError) {
        throw err
      }
      throw new Error("Failed to upload avatar")
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  }
}
