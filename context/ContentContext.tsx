import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EmailCreationStep } from '../components/steps/StepsIndicator';
import { ContentData, } from '../types/EmailContent';


interface ContentContextType {
  data: ContentData;
  currentStep: EmailCreationStep;
  isLoading: boolean;
  updateData: (newData: Partial<ContentData>) => void;
  setCurrentStep: (step: EmailCreationStep) => void;
  validateStep: (step: EmailCreationStep) => boolean;
  sendContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [data, setData] = useState<ContentData>({} as ContentData);
  const [currentStep, setCurrentStep] = useState(EmailCreationStep.TOPIC);
  const [isLoading, setIsLoading] = useState(false);

  const updateData = useCallback((newData: Partial<ContentData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  const validateStep = useCallback((step: EmailCreationStep): boolean => {
    switch (step) {
      case EmailCreationStep.TOPIC:
        return Boolean(data.topic && data.topic.trim());
      case EmailCreationStep.CONTENT:
        return Boolean(data.generatedContent);
      case EmailCreationStep.DESIGN:
        return Boolean(data.htmlContent);
      case EmailCreationStep.SEND:
        return Boolean(
          data.subject &&
          data.senderName &&
          data.fromEmail &&
          data.recipients?.length
        );
      default:
        return false;
    }
  }, [data]);

  const sendContent = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement sending logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      updateData({ status: 'sent' });
      router.push('/');
    } catch (error) {
      console.error('Error sending content:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, updateData]);

  return (
    <ContentContext.Provider
      value={{
        data,
        currentStep,
        isLoading,
        updateData,
        setCurrentStep,
        validateStep,
        sendContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export default ContentContext; 