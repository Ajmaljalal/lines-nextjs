import React, { createContext, useContext, useState } from 'react';
import { NewsletterStep } from '../components/steps/StepsIndicator';

interface NewsletterData {
  topic: string;
  content: string;
  urls: string[];
  style: string;
  generatedContent?: string;
  htmlContent?: string;
  design?: {
    template?: string;
    colors?: string[];
  };
  recipients?: string[];
  scheduledDate?: Date;
  subject?: string;
  fromEmail?: string;
}

interface NewsletterContextType {
  data: NewsletterData;
  updateData: (updates: Partial<NewsletterData>) => void;
  isStepValid: (step: NewsletterStep) => boolean;
  currentStep: NewsletterStep;
  setCurrentStep: (step: NewsletterStep) => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export const NewsletterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<NewsletterData>({
    topic: '',
    content: '',
    urls: [],
    style: '',
  });
  const [currentStep, setCurrentStep] = useState<NewsletterStep>(NewsletterStep.TOPIC);

  const updateData = (updates: Partial<NewsletterData>) => {
    setData(current => ({
      ...current,
      ...updates,
    }));
  };

  const isStepValid = (step: NewsletterStep): boolean => {
    switch (step) {
      case NewsletterStep.TOPIC:
        return data.topic.trim().length > 0;
      case NewsletterStep.CONTENT:
        return !!data.generatedContent;
      case NewsletterStep.DESIGN:
        return !!data.htmlContent;
      case NewsletterStep.SEND:
        return (data.recipients?.length ?? 0) > 0;
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