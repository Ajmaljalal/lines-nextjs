import { useState, useCallback } from 'react';
import { useNewsletter } from '@/context/NewsletterContext';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { ChatService } from '@/services/chatService';
import { AgentMessage } from '@/agents/types';

interface AgentMetadata {
  type: 'data_collection' | 'content_editing' | 'design_customization';
  action: string;
  field?: string;
  value?: any;
  section?: {
    id: string;
    title?: string;
    content?: string;
  };
  updates?: {
    html?: string;
    css?: string;
  };
}

export const useChat = () => {
  const { data, currentStep, updateData } = useNewsletter();
  const { currentTheme } = useBrandTheme();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const chatService = new ChatService(data, currentStep, currentTheme);

  const sendMessage = useCallback(async (message: string) => {
    try {
      setIsSending(true);
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      const response = await chatService.processMessage(message);

      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);

      // Handle agent actions based on metadata
      const metadata = response.metadata as AgentMetadata | undefined;
      if (metadata?.type) {
        switch (metadata.type) {
          case 'data_collection':
            if (metadata.action === 'update_field' && metadata.field) {
              updateData({ [metadata.field]: metadata.value });
            }
            break;

          case 'content_editing':
            if (metadata.action === 'edit_section' && metadata.section?.id) {
              const content = JSON.parse(data.generatedContent || '{}');
              const sectionIndex = content.sections.findIndex(
                (s: any) => s.id === metadata.section?.id
              );
              if (sectionIndex !== -1) {
                content.sections[sectionIndex] = {
                  ...content.sections[sectionIndex],
                  ...metadata.section
                };
                updateData({ generatedContent: JSON.stringify(content) });
              }
            }
            break;

          case 'design_customization':
            if (metadata.action === 'update_layout' && metadata.updates?.html) {
              updateData({ htmlContent: metadata.updates.html });
            }
            break;
        }
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }
      ]);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [data, currentStep, updateData, currentTheme]);

  const clearChat = useCallback(() => {
    setMessages([]);
    chatService.clearConversation();
  }, []);

  return {
    messages,
    isSending,
    sendMessage,
    clearChat
  };
}; 