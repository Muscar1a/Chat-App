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
import { E2EProvider } from "./context/E2EContext"
import HomePage from "./pages/HomePage"
import { ThemeProvider } from "./context/ThemeContext"
import E2EModal from "./components/E2EModal"
import "./styles/e2e-modal.css"

function ChatApp() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <E2EProvider>
      <ChatProvider>
        <div className="app">
          <E2EModal />
          <div className="chat-container">
            <Sidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />
            <ChatWindow chatId={selectedChat} />
          </div>
        </div>
      </ChatProvider>
    </E2EProvider>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
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
            <Route path="/forgot-password/:urlToken" element={<ForgotPassword />} />
            <Route path="/reset-password.html" element={<ForgotPassword />} />
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
      </ThemeProvider>
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
