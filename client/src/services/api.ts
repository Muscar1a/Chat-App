// API configuration and base functions
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token")
}

// Base fetch function with auth headers
const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken()

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status, data.errors)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError("Network error occurred", 0)
  }
}

export { apiFetch, ApiError, type ApiResponse }
