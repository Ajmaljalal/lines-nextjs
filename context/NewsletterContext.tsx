import React, { createContext, useContext, useState } from 'react';
import { EmailCreationStep } from '../components/steps/StepsIndicator';
import { Newsletter } from '../types/Newsletter';


interface NewsletterContextType {
  data: Newsletter;
  updateData: (updates: Partial<Newsletter>) => void;
  isStepValid: (step: EmailCreationStep) => boolean;
  currentStep: EmailCreationStep;
  setCurrentStep: (step: EmailCreationStep) => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export const NewsletterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Newsletter>({
    id: '',
    userId: '',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    topic: '',
    userProvidedContent: '',
    webSearch: false,
    webSearchContent: [],
    urlsExtractedContent: [],
    urls: [],
    style: '',
    senderName: '',
  });
  const [currentStep, setCurrentStep] = useState<EmailCreationStep>(EmailCreationStep.TOPIC);

  const updateData = (updates: Partial<Newsletter>) => {
    setData(current => ({
      ...current,
      ...updates,
    }));
  };

  const isStepValid = (step: EmailCreationStep): boolean => {
    switch (step) {
      case EmailCreationStep.TOPIC:
        return data.topic.trim().length > 0;
      case EmailCreationStep.CONTENT:
        return !!data.generatedContent;
      case EmailCreationStep.DESIGN:
        return !!data.htmlContent;
      case EmailCreationStep.SEND:
        return (data.recipients?.length ?? 0) > 0 &&
          !!data.subject?.trim() &&
          !!data.fromEmail?.trim() &&
          !!data.senderName?.trim();
      default:
        return false;
    }
  };

  return (
    <NewsletterContext.Provider value={{
      data,
      updateData,
      isStepValid,
      currentStep,
      setCurrentStep
    }}>
      {children}
    </NewsletterContext.Provider>
  );
};

export const useNewsletter = () => {
  const context = useContext(NewsletterContext);
  if (context === undefined) {
    throw new Error('useNewsletter must be used within a NewsletterProvider');
  }
  return context;
}; 