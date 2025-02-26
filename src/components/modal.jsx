import React, { useState } from 'react';

// Reusable Modal Component with Inline Styles
function Modal({ isOpen, onClose, title, children }) {
  // Inline styles for overlay
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  // Inline styles for modal container
  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100vw',
    maxWidth: '90%',
    padding: '20px',
    maxHeight: '70vh',
    overflow: 'auto'
  };

  // Inline styles for modal header
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '10px',
    marginBottom: '15px'
  };

  // Inline styles for close button
  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h2>{title}</h2>
          <button 
            onClick={onClose} 
            style={closeButtonStyle}
          >
            &times;
          </button>
        </div>
        {children}
        <div style={{
          marginTop: '15px', 
          textAlign: 'right'
        }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#f0f0f0',
              color: 'black',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;