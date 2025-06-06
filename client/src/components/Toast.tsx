"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export interface ToastProps {
  id: string
  type: "success" | "error" | "info"
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const Icon = icons[type]

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  return (
    <div className={`toast ${colors[type]}`}>
      <div className="toast-content">
        <Icon size={20} className="toast-icon" />
        <div className="toast-text">
          <h4 className="toast-title">{title}</h4>
          {message && <p className="toast-message">{message}</p>}
        </div>
      </div>
      <button onClick={() => onClose(id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  )
}

// Toast container and hook
let toastId = 0

export interface ToastData {
  type: "success" | "error" | "info"
  title: string
  message?: string
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const addToast = (toast: ToastData) => {
    const id = `toast-${++toastId}`
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )

  return { addToast, ToastContainer }
}
