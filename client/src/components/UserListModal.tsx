"use client"

import { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

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
  onSelectUser: (userId: string, userName: string, userAvatar: string) => void
}

export default function UserListModal({ isOpen, onClose, onSelectUser }: UserListModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getDisplayName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else if (user.last_name) {
      return user.last_name;
    } else {
      return user.username;
    }
  }

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
                className="user-list-item"
                onClick={() => onSelectUser(
                  user.id,
                  getDisplayName(user),
                  user.avatar || "/original_user_image.jpg?height=40&width=40"
                )}
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
