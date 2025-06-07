"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/SideBar"
import ChatWindow from "./components/ChatWindow"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import ForgotPassword from "./pages/ForgotPassword"
import { ChatProvider } from "./context/ChatContext"
import "./App.css"
import "./styles/toast.css"
import { AuthProvider, useAuth } from "./context/AuthContext"
import HomePage from "./pages/HomePage"

function ChatApp() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1")

  return (
    <ChatProvider>
      <div className="app">
        <div className="chat-container">
          <Sidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />
          <ChatWindow chatId={selectedChat} />
        </div>
      </div>
    </ChatProvider>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap your entire app with AuthProvider */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/message"
            element={
              <RequireAuth>
                <ChatApp />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

// Helper component to protect routes
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App
