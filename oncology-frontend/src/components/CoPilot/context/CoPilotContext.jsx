import React, { createContext, useContext, useState } from 'react';

/**
 * CoPilot Context for sharing state across components
 */
export const CoPilotContext = createContext();

export const CoPilotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [currentVariant, setCurrentVariant] = useState(null);
  const [currentDisease, setCurrentDisease] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const value = {
    isOpen,
    setIsOpen,
    currentPage,
    setCurrentPage,
    currentVariant,
    setCurrentVariant,
    currentDisease,
    setCurrentDisease,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    unreadCount,
    setUnreadCount,
  };

  return (
    <CoPilotContext.Provider value={value}>
      {children}
    </CoPilotContext.Provider>
  );
};

// Hook to use CoPilot context
export const useCoPilot = () => {
  const context = useContext(CoPilotContext);
  if (!context) {
    throw new Error('useCoPilot must be used within a CoPilotProvider');
  }
  return context;
};
