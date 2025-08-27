import { useState, useCallback, useMemo } from 'react';
import { useContent } from '@/context/ContentContext';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { NewChatService } from '@/services/newChatService';
import { useChatContext } from '@/context/ChatContext';

export const useChat = () => {
  const { data, currentStep, updateData } = useContent();
  const { currentTheme } = useBrandTheme();
  const { messages, addMessage, clearMessages } = useChatContext();
  const [isSending, setIsSending] = useState(false);

  // Initialize chat service and preserve it across renders
  const chatService = useMemo(() => {
    const service = new NewChatService(data, currentStep, currentTheme);
    return service;
  }, [currentStep]); // Only recreate when step changes, not when data changes

  // Update the chat service's data when content data changes
  useMemo(() => {
    if (chatService) {
      chatService.updateData(data);
      chatService.updateBrandTheme(currentTheme);
    }
  }, [data, currentTheme, chatService]);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsSending(true);

      // Add user message to UI
      addMessage({ role: 'user', content, type: 'user' });

      const response = await chatService.processMessage(content);

      // Add assistant response to UI
      addMessage({ role: 'assistant', content: response.message, type: 'assistant' });

      if (response.metadata?.updates) {
        updateData(response.metadata.updates);

        // Compute data collection completion
        const updatedData = { ...data, ...response.metadata.updates } as any;
        const hasTopic = Boolean(updatedData.topic && String(updatedData.topic).trim());
        const hasUserContent = Boolean(updatedData.userProvidedContent && String(updatedData.userProvidedContent).trim());
        const hasUrls = Array.isArray(updatedData.urls) && updatedData.urls.length > 0;
        const wantsWebSearch = Boolean(updatedData.webSearch === true);

        const shouldMarkCompleted = hasTopic && (hasUserContent || hasUrls || wantsWebSearch);
        const agentConfirmed = response.metadata.action === 'CONFIRM';

        if ((shouldMarkCompleted || agentConfirmed) && !updatedData.dataCollectionCompleted) {
          updateData({ dataCollectionCompleted: true });
          addMessage({
            role: 'assistant',
            content: 'Thanks! I have enough details. Curating your content now…',
            type: 'assistant'
          });
        }

        // Re-check send step conditions with updated data
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