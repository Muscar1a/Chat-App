import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { decryptPrivateKey } from '../utils/Decryption';

interface E2EContextType {
  isE2EReady: boolean;
  EE2EInput: string;
  showE2EModal: boolean;
  passwordError: string;
  isLoading: boolean;
  setEE2EInput: (password: string) => void;
  verifyE2EPassword: () => void;
  resetE2E: () => void;
}

const E2EContext = createContext<E2EContextType | undefined>(undefined);

export const useE2E = () => {
  const context = useContext(E2EContext);
  if (!context) {
    throw new Error('useE2E must be used within an E2EProvider');
  }
  return context;
};

interface E2EProviderProps {
  children: ReactNode;
}

export const E2EProvider: React.FC<E2EProviderProps> = ({ children }) => {
  const [isE2EReady, setIsE2EReady] = useState(false);
  const [EE2EInput, setEE2EInput] = useState("");
  const [showE2EModal, setShowE2EModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const resetE2E = () => {
    // Clear sessionStorage for current user
    if (user?.id) {
      const sessionKey = `e2e_password_${user.id}`;
      sessionStorage.removeItem(sessionKey);
    }
    
    setIsE2EReady(false);
    setEE2EInput("");
    setShowE2EModal(false);
    setPasswordError("");
    setIsLoading(false);
  };

  const verifyE2EPassword = async () => {
    if (!EE2EInput.trim()) {
      setPasswordError("Password cannot be empty");
      return;
    }

    if (!user?.private_key_pem) {
      setPasswordError("Private key not found");
      return;
    }

    setIsLoading(true);
    try {
      // Test password by trying to decrypt private key
      decryptPrivateKey(user.private_key_pem, EE2EInput);
      
      // Add loading delay to ensure password is fully loaded
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save password to sessionStorage for this user
      const sessionKey = `e2e_password_${user.id}`;
      sessionStorage.setItem(sessionKey, EE2EInput);
      
      // If successful, mark as ready and hide modal
      setIsE2EReady(true);
      setShowE2EModal(false);
      setPasswordError("");
      console.log("E2E encryption is now ready and saved to session");
    } catch (error) {
      console.error("E2E password verification failed:", error);
      setPasswordError("Incorrect password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if E2E password is already saved in session and manage modal display
  useEffect(() => {
    console.log("E2E useEffect triggered", { user: !!user, isE2EReady, showE2EModal });
    
    if (!user) {
      console.log("No user, skipping E2E check");
      return;
    }

    if (isE2EReady) {
      // If E2E is already ready, don't show modal
      console.log("E2E already ready, hiding modal");
      setShowE2EModal(false);
      return;
    }

    const sessionKey = `e2e_password_${user.id}`;
    const savedPassword = sessionStorage.getItem(sessionKey);
    
    console.log("Checking saved password for user", user.id, "found:", !!savedPassword);
    
    if (savedPassword) {
      // Try to verify saved password
      try {
        decryptPrivateKey(user.private_key_pem, savedPassword);
        // If successful, set password and mark as ready
        console.log("Saved password is valid, restoring E2E state");
        setEE2EInput(savedPassword);
        setIsE2EReady(true);
        setShowE2EModal(false);
        console.log("E2E password restored from session");
        return;
      } catch (error) {
        // Saved password is invalid, remove it and show modal
        console.warn("Saved E2E password is invalid, clearing it");
        sessionStorage.removeItem(sessionKey);
      }
    }
    
    // If no valid saved password and E2E is not ready, show modal
    if (!isE2EReady) {
      console.log("No valid saved password, showing E2E modal");
      setShowE2EModal(true);
      setPasswordError("");
    }
  }, [user?.id, isE2EReady]); // Use user.id instead of user object to avoid unnecessary re-renders

  // Reset E2E when user changes (different user ID) or user logs out
  useEffect(() => {
    if (!user) {
      console.log("User logged out, resetting E2E");
      resetE2E();
    }
  }, [user?.id]); // Only reset when user ID changes, not when user object changes

  const setEE2EInputWithClearError = (password: string) => {
    setEE2EInput(password);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const value: E2EContextType = {
    isE2EReady,
    EE2EInput,
    showE2EModal,
    passwordError,
    isLoading,
    setEE2EInput: setEE2EInputWithClearError,
    verifyE2EPassword,
    resetE2E,
  };

  return (
    <E2EContext.Provider value={value}>
      {children}    </E2EContext.Provider>
  );
};

// Utility function to clear E2E session for a specific user (can be called from logout)
export const clearE2ESession = (userId: string) => {
  const sessionKey = `e2e_password_${userId}`;
  sessionStorage.removeItem(sessionKey);
  console.log("E2E session cleared for user:", userId);
};
