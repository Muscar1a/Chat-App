"use client"

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import ChatItem from "./ChatItem";
import UserProfile from "./UserProfile";
import UserListModal from "./UserListModal";
import axios from "axios";
import { Chat } from "../types/chat";

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    loadExistingChats();
  }, []);

  const loadExistingChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await axios.get("http://localhost:8000/chat/private/all/");
      const chatData = response.data;

      const transformedChats = await Promise.all(
        chatData.map(async (chat: any) => {
          try {
            const chatInfoResponse = await axios.get(`http://localhost:8000/chat/private/info/${chat.chat_id}`)
            const chatInfo = chatInfoResponse.data

            return {
              id: chat.chat_id,
              name: chatInfo.recipient_profile?.username || 'Unknown User',
              lastMessage: chat.messages?.length > 0
                ? chat.messages[chat.messages.length - 1].message
                : "No messages yet",
              timestamp: chat.messages?.length > 0
                ? new Date(chat.messages[chat.messages.length - 1].created_at).toLocaleTimeString()
                : "Just now",
              unreadCount: 0,
              avatar: chatInfo.recipient_profile?.avatar || "/original_user_image.jpg?height=40&width=40",
              isOnline: chatInfo.recipient_profile?.is_online || false,
            }
          } catch (error) {
            console.error("Error loading chat info:", error)
            return {
              id: chat.chat_id,
              name: 'Unknown User',
              lastMessage: "No messages yet",
              timestamp: "Just now",
              unreadCount: 0,
              avatar: "/original_user_image.jpg?height=40&width=40",
              isOnline: false,
            }
          }
        })
      );

      setChats(transformedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchOrCreateChat = async (recipientId: string) => {
    console.log("--> fetchOrCreateChat called with recipientId:", recipientId);
    const token = localStorage.getItem('token');

    try {
      // 1) Thử route "already exists" trước
      const response = await axios.get(
        `http://localhost:8000/chat/private/recipient/chat-id/${recipientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Fetched existing chat ID:", response.data.chat_id);
      return response.data.chat_id;
    } catch (error: any) {
      // 2) Không tìm thấy → tạo mới
      if (error.response?.status === 404) {
        console.log("Chat not found, creating new chat via GET (as per original).");
        const createResponse = await axios.get(
          `http://localhost:8000/chat/private/recipient/create-chat/${recipientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Chat created (via GET):", createResponse.data);

        // **PICK THE NESTED chat_id**
        const newChatId = createResponse.data.chat.chat_id;
        console.log("Extracted new chat ID:", newChatId);
        return newChatId;
      }

      // any other error, rethrow
      console.error("Error fetching/creating chat:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Messages</h1>
        <UserProfile />
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="chat-list">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isSelected={selectedChat === chat.id}
            onClick={() => onSelectChat(chat.id)}
          />
        ))}
      </div>

      <button className="new-chat-button" onClick={() => setIsUserListOpen(true)}>
        <Plus size={24} />
      </button>

      <UserListModal
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
        onSelectUser={fetchOrCreateChat}
      />
    </div>
  )
}
