import { useState, useCallback, useContext, useMemo } from 'react';
import { useNewsletter } from '@/context/NewsletterContext';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { ChatService } from '@/services/chatService';
import { AgentMessage } from '@/agents/types';
import { useChatContext } from '@/context/ChatContext';

export const useChat = () => {
  const { data, currentStep, updateData } = useNewsletter();
  const { currentTheme } = useBrandTheme();
  const { messages, addMessage, clearMessages } = useChatContext();
  const [isSending, setIsSending] = useState(false);

  const chatService = useMemo(() => new ChatService(data, currentStep, currentTheme), [data, currentStep, currentTheme]);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsSending(true);

      // Add user message
      addMessage({
        role: 'user',
        content,
        type: 'user'
      });

      // Get response from chat service
      const response = await chatService.processMessage(content);

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.message,
        type: 'assistant'
      });

      // Handle any updates from the response metadata
      if (response.metadata?.updates) {
        updateData(response.metadata.updates);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Could you please try again?',
        type: 'assistant'
      });
    } finally {
      setIsSending(false);
    }
  }, [chatService, addMessage, updateData]);

  return {
    messages,
    sendMessage,
    isSending,
    clearMessages
  };
}; 