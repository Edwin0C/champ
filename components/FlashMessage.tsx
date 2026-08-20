'use client';

import { useEffect, useState } from 'react';

interface FlashMessageProps {
  message?: string | null;
  type?: 'success' | 'danger' | 'info' | 'warning';
  onClose?: () => void;
}

export default function FlashMessage({ message, type = 'info', onClose }: FlashMessageProps) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!visible || !message) return null;

  const bgColors = {
    success: 'bg-green-600',
    danger: 'bg-liga-red',
    warning: 'bg-amber-500',
    info: 'bg-liga-blue',
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm z-50 transition-all duration-300 animate-fade-in">
      <div className={`p-4 rounded-lg shadow-lg text-sm font-medium text-white ${bgColors[type]}`}>
        {message}
      </div>
    </div>
  );
}
