import React, { createContext, useContext, useState, useEffect } from 'react';
import { useContent } from './ContentContext';
import { EmailCreationStep } from '../components/steps/StepsIndicator';
import { ContentData } from '@/types/EmailContent';
import { AgentMessage } from '@/agents/types';

interface ChatContextProps {
  messages: AgentMessage[];
  addMessage: (message: AgentMessage) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const getInitialMessage = (step: EmailCreationStep, data: ContentData): string => {
  switch (step) {
    case EmailCreationStep.CONTENT:
      return data.dataCollectionCompleted
        ? 'I am generating content now...'
        : 'Hi! Share the topic, any URLs, and any content you want to include.'
    case EmailCreationStep.DESIGN:
      return 'I am generating the design now...'
    case EmailCreationStep.SEND:
      return "Let's prepare your email for sending...";
    default:
      return "Hey there! let me help you with your email...";
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStep, data } = useContent();
  const [messagesByStep, setMessagesByStep] = useState<Record<EmailCreationStep, AgentMessage[]>>({
    [EmailCreationStep.CONTENT]: [],
    [EmailCreationStep.DESIGN]: [],
    [EmailCreationStep.SEND]: [],
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
