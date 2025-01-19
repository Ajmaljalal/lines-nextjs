import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NewsletterStep } from '../components/steps/StepsIndicator';
import { ContentData, } from '../types/EmailContent';


interface ContentContextType {
  data: ContentData;
  currentStep: number;
  isLoading: boolean;
  updateData: (newData: Partial<ContentData>) => void;
  setCurrentStep: (step: number) => void;
  validateStep: (step: number) => boolean;
  sendContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [data, setData] = useState<ContentData>({} as ContentData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const updateData = useCallback((newData: Partial<ContentData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(data.topic && data.topic.trim());
      case 2:
        return Boolean(data.generatedContent);
      case 3:
        return Boolean(data.htmlContent);
      case 4:
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