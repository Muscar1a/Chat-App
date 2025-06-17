// API configuration
export const host = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Auth endpoints
export const loginRoute = `${host}/auth/login`;
export const registerRoute = `${host}/users/register`;
export const logoutRoute = `${host}/auth/logout`;
export const forgotPasswordRoute = `${host}/auth/request-password-reset`;
export const resetPasswordRoute = `${host}/auth/reset-password`;
export const changePasswordRoute = `${host}/auth/change-password`;

// User endpoints
export const getUsersRoute = `${host}/users/all`;
export const getMeRoute = `${host}/users/me`;

// Chat endpoints
export const getAllChatsRoute = `${host}/chat/private/all/`;
export const getChatInfoRoute = (chatId: string) => `${host}/chat/private/info/${chatId}`;
export const getRecipientChatRoute = (recipientId: string) => `${host}/chat/private/recipient/chat-id/${recipientId}`;
export const createChatRoute = (recipientId: string) => `${host}/chat/private/recipient/create-chat/${recipientId}`;
export const markAsReadRoute = (chatId: string) => `${host}/chat/private/${chatId}/mark-read`;
export const getUnreadCountRoute = (chatId: string) => `${host}/chat/private/${chatId}/unread-count`;
