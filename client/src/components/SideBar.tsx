"use client"

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import ChatItem from "./ChatItem";
import UserProfile from "./UserProfile";
import UserListModal from "./UserListModal";
import axios from "axios";
import { Chat } from "../types/chat";
import { getDisplayName } from "../utils/userUtils";
import { useAuth } from "../context/AuthContext";
import { useE2E } from "../context/E2EContext";
import { useChat } from "../context/ChatContext";
import { decryptAESKeyWithPrivateKey, decryptMessageWithAES, decryptPrivateKey } from "../utils/Decryption";

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { user } = useAuth();
  const { isE2EReady, EE2EInput } = useE2E();
  const { lastMessages } = useChat();

  // Helper function to decrypt last message
  const decryptLastMessage = (lastMessage: any) => {
    if (!lastMessage || !isE2EReady || !EE2EInput || !user?.private_key_pem) {
      return lastMessage?.message || "No messages yet";
    }

    try {
      console.log("Attempting to decrypt last message in sidebar:", lastMessage);
      
      // Decrypt private key
      const myPrivateKeyPem = decryptPrivateKey(user.private_key_pem, EE2EInput);
      
      // Get the appropriate encrypted key based on who sent the message
      const encryptedKey = lastMessage.created_by === user.id
        ? lastMessage.encrypted_key_sender
        : lastMessage.encrypted_key_receiver;

      if (!encryptedKey || !lastMessage.iv) {
        console.warn("Missing encryption data for last message");
        return lastMessage.message;
      }

      // Decrypt AES key using private key
      const aesKey = decryptAESKeyWithPrivateKey(encryptedKey, myPrivateKeyPem);
      
      // Decrypt message using AES key
      const plaintext = decryptMessageWithAES(lastMessage.message, aesKey, lastMessage.iv);
      
      console.log("Successfully decrypted last message:", plaintext);
      return plaintext;
      
    } catch (error) {
      console.error("Failed to decrypt last message:", error);
      return lastMessage.message;
    }
  };

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Only load chats when E2E is ready
  useEffect(() => {
    if (isE2EReady) {
      console.log("E2E is ready, loading chats with decryption capability");
      loadExistingChats();
    } else {
      console.log("E2E not ready yet, waiting before loading chats");
    }
  }, [isE2EReady]);

  // Reload chats when lastMessages changes to update UI
  useEffect(() => {
    if (isE2EReady && Object.keys(lastMessages).length > 0) {
      console.log("Last messages updated, refreshing chat list");
      // Use a small delay to avoid excessive re-renders
      const timeoutId = setTimeout(() => {
        loadExistingChats();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [lastMessages, isE2EReady]);

  const loadExistingChats = async () => {
    // Don't load chats if E2E is not ready
    if (!isE2EReady) {
      console.log("E2E not ready, skipping chat loading");
      return;
    }

    try {
      setIsLoadingChats(true);
      console.log("Loading chats with E2E decryption...");
      const response = await axios.get("http://localhost:8000/chat/private/all/");
      const chatData = response.data;

      const transformedChats = await Promise.all(
        chatData.map(async (chat: any) => {
          try {
            const chatInfoResponse = await axios.get(`http://localhost:8000/chat/private/info/${chat.chat_id}`)
            const chatInfo = chatInfoResponse.data

            const lastMessage = chat.messages?.length > 0 
              ? chat.messages[chat.messages.length - 1]
              : null;

            // Check if we have a more recent message from context
            const contextLastMessage = lastMessages[chat.chat_id];
            const useContextMessage = contextLastMessage && lastMessage && 
              new Date(contextLastMessage.created_at) > new Date(lastMessage.created_at);

            const finalLastMessage = useContextMessage ? contextLastMessage.message : 
              (lastMessage ? decryptLastMessage(lastMessage) : "No messages yet");

            const finalTimestamp = useContextMessage ? contextLastMessage.timestamp :
              (chat.messages?.length > 0
                ? new Date(chat.messages[chat.messages.length - 1].created_at).toLocaleTimeString()
                : "Just now");

            return {
              id: chat.chat_id,
              name: getDisplayName(chatInfo.recipient_profile),
              lastMessage: finalLastMessage,
              timestamp: finalTimestamp,
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

  // Helper function to verify chat exists
  const verifyChatExists = async (chatId: string, maxRetries = 3): Promise<boolean> => {
    const token = localStorage.getItem('token');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Verifying chat ${chatId} exists (attempt ${i + 1}/${maxRetries})`);
        const response = await axios.get(`http://localhost:8000/chat/private/info/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.chat_id === chatId) {
          console.log(`✅ Chat ${chatId} verified successfully`);
          return true;
        }
      } catch (error) {
        console.log(`❌ Chat verification failed (attempt ${i + 1}): ${error}`);
        
        // Wait before retry (exponential backoff)
        if (i < maxRetries - 1) {
          const waitTime = Math.pow(2, i) * 500; // 500ms, 1s, 2s
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    console.log(`❌ Chat ${chatId} verification failed after ${maxRetries} attempts`);
    return false;
  };

  const fetchOrCreateChat = async (recipientId: string): Promise<void> => {
    console.log("--> fetchOrCreateChat called with recipientId:", recipientId);
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error("No authentication token found");
    }

    setIsCreatingChat(true);
    
    try {
      // 1) Thử route "already exists" trước
      const response = await axios.get(
        `http://localhost:8000/chat/private/recipient/chat-id/${recipientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Fetched existing chat ID:", response.data.chat_id);
      const chatId = response.data.chat_id;
      
      // Verify existing chat before navigating
      const isValid = await verifyChatExists(chatId);
      if (!isValid) {
        throw new Error("Existing chat verification failed");
      }
      
      // **Navigate to existing chat**
      onSelectChat(chatId);
      setIsUserListOpen(false);
      
    } catch (error: any) {
      // 2) Không tìm thấy → tạo mới
      if (error.response?.status === 404 || error.message?.includes("verification failed")) {
        console.log("📝 Chat not found or invalid, creating new chat...");
        
        try {
          const createResponse = await axios.get(
            `http://localhost:8000/chat/private/recipient/create-chat/${recipientId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("📨 Chat creation response:", createResponse.data);

          // **PICK THE NESTED chat_id**
          const newChatId = createResponse.data.chat?.chat_id;
          if (!newChatId) {
            throw new Error("No chat ID returned from creation endpoint");
          }
          
          console.log("🆕 New chat ID:", newChatId);
          
          // **Wait and verify new chat exists before navigating**
          const isValid = await verifyChatExists(newChatId, 5); // More retries for new chat
          if (!isValid) {
            throw new Error("New chat verification failed after creation");
          }
          
          // **Refresh chat list first to include new chat**
          console.log("🔄 Refreshing chat list...");
          await loadExistingChats();
          
          // **Then navigate to new chat**
          console.log("🚀 Navigating to new chat");
          onSelectChat(newChatId);
          setIsUserListOpen(false);
          
        } catch (createError: any) {
          console.error("❌ Error creating chat:", createError);
          throw new Error(`Failed to create chat: ${createError.response?.data?.detail || createError.message}`);
        }
      } else {
        // Other errors
        console.error("❌ Unexpected error:", error.response?.data || error.message);
        throw new Error(`Unexpected error: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setIsCreatingChat(false);
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
        {!isE2EReady ? (
          <div className="loading-chats">
            <div className="loading-spinner"></div>
            <p>Waiting for E2E encryption to be ready...</p>
          </div>
        ) : isLoadingChats ? (
          <div className="loading-chats">
            <div className="loading-spinner"></div>
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChat === chat.id}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <div className="no-chats">
            <p>No conversations yet</p>
            <p>Start a new chat to begin messaging</p>
          </div>
        )}
      </div>

      <button 
        className={`new-chat-button ${isCreatingChat || !isE2EReady ? 'creating' : ''}`} 
        onClick={() => setIsUserListOpen(true)}
        disabled={isCreatingChat || !isE2EReady}
        title={!isE2EReady ? "Please enter E2E password first" : "Create new chat"}
      >
        <Plus size={24} />
        {isCreatingChat && <span className="creating-text">Creating...</span>}
        {!isE2EReady && !isCreatingChat && <span className="creating-text">E2E Required</span>}
      </button>

      <UserListModal
        isOpen={isUserListOpen}
        onClose={() => setIsUserListOpen(false)}
        onSelectUser={fetchOrCreateChat}
      />
    </div>
  )
}
