"use client"

import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="auth-logo">
          <img src="/placeholder.svg?height=40&width=40" alt="Logo" />
          <h1>Chat App</h1>
        </div>
      </div>
      <div className="auth-content">{children}</div>
    </div>
  )
}
