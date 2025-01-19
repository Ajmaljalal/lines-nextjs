import { useState, useCallback, useMemo } from 'react';
import { useContent } from '@/context/ContentContext';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { ChatService } from '@/services/chatService';
import { useChatContext } from '@/context/ChatContext';

export const useChat = () => {
  const { data, currentStep, updateData } = useContent();
  const { currentTheme } = useBrandTheme();
  const { messages, addMessage, clearMessages } = useChatContext();
  const [isSending, setIsSending] = useState(false);

  // Initialize chat service with brand theme
  const chatService = useMemo(() =>
    new ChatService(data, currentStep, currentTheme),
    [data, currentStep, currentTheme]
  );

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsSending(true);
      addMessage({ role: 'user', content, type: 'user' });

      const response = await chatService.processMessage(content);
      addMessage({ role: 'assistant', content: response.message, type: 'assistant' });

      if (response.metadata?.updates) {
        updateData(response.metadata.updates);

        // Re-check conditions with updated data
        const updatedData = { ...data, ...response.metadata.updates };
        if (updatedData.senderName && updatedData.subject && updatedData.fromEmail && updatedData.recipients?.length > 0) {
          addMessage({
            role: 'assistant',
            content: "Great! All the required information is provided. You can now use the form above to review the details and click the 'Send' button when you're ready to send.",
            type: 'assistant'
          });
        }
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
  }, [chatService, addMessage, updateData, data]);

  return {
    messages,
    isSending,
    sendMessage,
    clearMessages
  };
}; 