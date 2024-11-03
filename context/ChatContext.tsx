import React, { createContext, useContext, useState } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatContextProps {
  messages: Message[];
  addMessage: (sender: 'user' | 'ai', text: string) => void;
  fetchChatResponse: (message: string) => void;
  loading: boolean;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const addMessage = (sender: 'user' | 'ai', text: string) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const fetchChatResponse = async (message: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ user_input: message }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setLoading(false);
      if (data.error) {
        addMessage('ai', "Sorry, I couldn't process your request. Please try again.");
      } else if (typeof data.response === 'string') {
        addMessage('ai', data.response);
      } else {
        console.error('Unexpected response type:', data.response);
        addMessage('ai', 'Received an unexpected response format.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching chat response:', error);
      addMessage('ai', 'There was an error processing your request.');
    }
  };

  return (
    <ChatContext.Provider value={{ messages, addMessage, fetchChatResponse, loading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};