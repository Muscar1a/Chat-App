import React from 'react';
import { useE2E } from '../context/E2EContext';
import { Lock, Shield } from 'lucide-react';

const E2EModal: React.FC = () => {
  const { 
    showE2EModal, 
    EE2EInput, 
    setEE2EInput, 
    verifyE2EPassword, 
    passwordError, 
    isLoading 
  } = useE2E();

  if (!showE2EModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyE2EPassword();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      verifyE2EPassword();
    }
  };

  return (
    <div className="e2e-modal-overlay">
      <div className="e2e-modal-content">
        <div className="e2e-modal-header">
          <div className="e2e-icon">
            <Shield size={48} color="#3b82f6" />
          </div>
          <h2>End-to-End Encryption</h2>
          <p>Enter your password again to secure your messages</p>
        </div>

        <form onSubmit={handleSubmit} className="e2e-form">
          <div className="e2e-input-wrapper">
            <Lock size={20} className="e2e-input-icon" />            <input
              type="password"
              value={EE2EInput}
              onChange={(e) => setEE2EInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              className="e2e-password-input"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {passwordError && (
            <div className="e2e-error-message">
              <span>{passwordError}</span>
            </div>
          )}

          <button
            type="submit"
            className={`e2e-verify-button ${isLoading ? 'loading' : ''}`}
            disabled={!EE2EInput.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="e2e-spinner"></div>
                <span>Initializing Encryption...</span>
              </>
            ) : (
              <>
                <Shield size={18} />
                <span>Verify & Enable Encryption</span>
              </>
            )}
          </button>
        </form>

        <div className="e2e-info">
          <div className="e2e-info-item">
            <span className="e2e-info-icon">🔒</span>
            <span>Your messages are end-to-end encrypted</span>
          </div>
          <div className="e2e-info-item">
            <span className="e2e-info-icon">🔑</span>
            <span>Only you and your recipient can read them</span>
          </div>
          <div className="e2e-info-item">
            <span className="e2e-info-icon">🛡️</span>
            <span>Your password never leaves your device</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default E2EModal;
