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
  // Giả định đã đăng nhập để test profile page
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <ChatApp /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
