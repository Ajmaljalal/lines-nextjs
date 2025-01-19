import React, { createContext, useContext, useState, useEffect } from 'react';
import { useContent } from './ContentContext';
import { NewsletterStep } from '../components/steps/StepsIndicator';
import { AgentMessage } from '@/agents/types';

interface ChatContextProps {
  messages: AgentMessage[];
  addMessage: (message: AgentMessage) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const getInitialMessage = (step: NewsletterStep, data: any): string => {
  switch (step) {
    case NewsletterStep.TOPIC:
      return "Hi! What would you like to write about today?";
    case NewsletterStep.CONTENT:
      return 'I am generating content now. Please wait a moment and then we can discuss the content.'
    case NewsletterStep.DESIGN:
      return 'I am generating the HTML design now. Please wait a moment and then we can discuss the design.'
    case NewsletterStep.SEND:
      return "Let's prepare your content for sending. I can help you set up the recipient list, subject line, and sender details. What would you like to configure first?";
    default:
      return "Hey there! Ask me anything about your content.";
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStep, data } = useContent();
  const [messagesByStep, setMessagesByStep] = useState<Record<NewsletterStep, AgentMessage[]>>({
    [NewsletterStep.TOPIC]: [],
    [NewsletterStep.CONTENT]: [],
    [NewsletterStep.DESIGN]: [],
    [NewsletterStep.SEND]: [],
  });

  // Initialize messages for each step when it becomes active
  useEffect(() => {
    if (messagesByStep[currentStep].length === 0) {
      const initialMessage = getInitialMessage(currentStep, data);
      setMessagesByStep(prev => ({
        ...prev,
        [currentStep]: [
          {
            role: 'assistant',
            content: initialMessage,
            type: 'assistant'
          }
        ]
      }));
    }
  }, [currentStep, data]);

  const addMessage = (message: AgentMessage) => {
    setMessagesByStep(prev => ({
      ...prev,
      [currentStep]: [...prev[currentStep], message]
    }));
  };

  const clearMessages = () => {
    setMessagesByStep(prev => ({
      ...prev,
      [currentStep]: []
    }));
  };

  return (
    <ChatContext.Provider value={{
      messages: messagesByStep[currentStep],
      addMessage,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
