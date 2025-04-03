import React, { useEffect } from 'react';
import '../../styles/adminStudentPopup.css';

const ModalPopup = ({ title, children, onClose, size = "medium" }) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Handle clicking outside the modal to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine modal size class
  const sizeClass = {
    small: "modal-content-small",
    medium: "modal-content-medium",
    large: "modal-content-large"
  }[size] || "modal-content-medium";

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${sizeClass}`}>
        <div className="modal-header">
          <h2>{title}</h2>
        
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalPopup;