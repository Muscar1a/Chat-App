"use client"

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { getDisplayName } from "../utils/userUtils";

interface User {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar: string
  is_online: boolean
}

interface UserListModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectUser: (userId: string) => Promise<void>
}

export default function UserListModal({ isOpen, onClose, onSelectUser }: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingChat, setCreatingChat] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/users/all')
      setUsers(response.data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  };

  const handleUserSelect = async (user: User) => {
    if (creatingChat) return; // Prevent multiple clicks
    
    setCreatingChat(user.id);
    try {
      console.log(`🚀 Starting chat creation/selection for user: ${getDisplayName(user)} (${user.id})`);
      await onSelectUser(user.id);
      console.log(`✅ Successfully created/opened chat with: ${getDisplayName(user)}`);
    } catch (error: any) {
      console.error("❌ Error selecting user:", error);
      
      // Show more specific error messages
      let errorMessage = "Failed to create or open chat. Please try again.";
      
      if (error.message) {
        if (error.message.includes("authentication") || error.message.includes("token")) {
          errorMessage = "Authentication expired. Please refresh the page and try again.";
        } else if (error.message.includes("verification failed")) {
          errorMessage = "Chat creation succeeded but verification failed. Please refresh the page.";
        } else if (error.message.includes("No chat ID")) {
          errorMessage = "Server error: No chat ID received. Please try again.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setCreatingChat(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const displayName = getDisplayName(user)
    const searchLower = searchQuery.toLowerCase()

    return (
      displayName.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="user-list-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>New Conversation</h2>
          <button className="modal-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-search">
          <div className="modal-search-wrapper">
            <Search size={18} className="modal-search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-search-input"
              autoFocus
            />
          </div>
        </div>

        <div className="user-list">
          {loading ? (
            <div className="loading-state">
              <Loader2 size={24} className="animate-spin" />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button onClick={fetchUsers} className="retry-button">Retry</button>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`user-list-item ${creatingChat === user.id ? 'creating-chat' : ''}`}
                onClick={() => handleUserSelect(user)}
                style={{ 
                  cursor: creatingChat ? 'not-allowed' : 'pointer',
                  opacity: creatingChat && creatingChat !== user.id ? 0.5 : 1
                }}
              >
                <div className="user-list-avatar-container">
                  <img
                    src={user.avatar || "/original_user_image.jpg?height=40&width=40"}
                    alt={getDisplayName(user)}
                    className="user-list-avatar"
                  />
                  {user.is_online && <div className="user-list-status-indicator" />}
                </div>
                <div className="user-list-info">
                  <h3 className="user-list-name">{getDisplayName(user)}</h3>
                  <p className="user-list-username">@{user.username}</p>
                </div>
                {creatingChat === user.id && (
                  <div className="creating-chat-indicator">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              {searchQuery ? "No users found matching your search" : "No users available"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
