import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AssistantContext = createContext(null);

export function AssistantProvider({ children }) {
  const [isMinimized, setIsMinimized] = useState(() => {
    return window.sessionStorage.getItem('shoppilot_minimized') === 'true';
  });
  const [floatingOpen, setFloatingOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const minimizeChat = () => {
    setIsMinimized(true);
    window.sessionStorage.setItem('shoppilot_minimized', 'true');
    setFloatingOpen(false);
  };

  const restoreChat = () => {
    if (isHomePage) {
      setIsMinimized(false);
      window.sessionStorage.setItem('shoppilot_minimized', 'false');
      setFloatingOpen(false);
      window.setTimeout(() => {
        const chatElement = document.getElementById('shoppilot-agent-chat') || document.getElementById('shoppilot-agent-live');
        chatElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setFloatingOpen(true);
    }
  };

  const toggleFloating = () => {
    if (isHomePage && isMinimized) {
      restoreChat();
    } else {
      setFloatingOpen((current) => !current);
    }
  };

  const value = useMemo(
    () => ({
      isMinimized,
      setIsMinimized,
      minimizeChat,
      restoreChat,
      floatingOpen,
      setFloatingOpen,
      toggleFloating,
      isHomePage,
    }),
    [isMinimized, floatingOpen, isHomePage],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}
