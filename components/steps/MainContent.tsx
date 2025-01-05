'use client'

import React, { useState, useEffect } from 'react';
import { NewsletterStep } from './StepsIndicator';
import FirstStep_DataCollection from './Step_1_DataCollection';
import SecondStep_ContentDrafting from './Step_2_ContentDrafting';
import ThirdStep_HtmlPreview from './Step_3_HtmlPreview';
import FourthStep_SendNewsletter from './Step_4_SendNewsletter';
import StepNavigation from './StepNavigation';
import { useNewsletter } from '@/context/NewsletterContext';
import { Loader2 } from 'lucide-react';
import { contentGenerationService } from '@/services/contentGenerationService';
import { htmlGenerationService } from '@/services/htmlGenerationService';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { TavilyService } from '@/services/tavilyService';

interface MainContentProps {
  onStepComplete: () => void;
}

const styles = {
  container: `
    w-full
    h-full
    bg-card
    rounded-[12px]
    p-6
    flex
    flex-col
    transition-colors
    duration-200
  `,
  contentWrapper: `
    flex-1
    overflow-y-auto
    scrollbar-none
  `,
  buttonWrapper: `
    mt-6
    flex
    justify-end
  `,
};

const MainContent: React.FC<MainContentProps> = ({ onStepComplete }) => {
  const { currentStep, data, updateData } = useNewsletter();
  const { currentTheme } = useBrandTheme();
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSearchInProgress, setIsWebSearchInProgress] = useState(false);

  const generateContent = async () => {
    if (data.webSearch) {
      setIsWebSearchInProgress(true);
      try {
        const result = await TavilyService.searchWeb(data.topic);
        if (result.results.length === 0) {
          updateData({ webSearchContent: [] });
        } else {
          updateData({
            webSearchContent: result.results.map(result => {
              return {
                title: result.title,
                content: result.content,
                url: result.url
              }
            })
          });
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Web search failed');
      } finally {
        setIsWebSearchInProgress(false);
      }
    }
    try {
      setIsGenerating(true);
      setError(null);

      const result = await contentGenerationService.generateContent(data);
      if (result.error) {
        throw new Error(result.error);
      }

      updateData({ generatedContent: result.content });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHtml = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const result = await htmlGenerationService.generateHtml(data, currentTheme);
      if (result.error) {
        throw new Error(result.error);
      }

      updateData({ htmlContent: result.content });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'HTML generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (currentStep === NewsletterStep.CONTENT && !data.generatedContent) {
      generateContent();
    } else if (currentStep === NewsletterStep.DESIGN && !data.htmlContent) {
      generateHtml();
    }
  }, [currentStep]);

  const renderContent = () => {
    if (isWebSearchInProgress) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          <p className="text-zinc-400">Searching the web for relevant content...</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          <p className="text-zinc-400">
            {currentStep === NewsletterStep.CONTENT
              ? 'Generating email content...'
              : 'Designing email content...'}
          </p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );
    }

    switch (currentStep) {
      case NewsletterStep.TOPIC:
        return <FirstStep_DataCollection />;
      case NewsletterStep.CONTENT:
        return <SecondStep_ContentDrafting />;
      case NewsletterStep.DESIGN:
        return <ThirdStep_HtmlPreview />;
      case NewsletterStep.SEND:
        return <FourthStep_SendNewsletter onComplete={onStepComplete} />;
      default:
        return null;
    }
  };

  console.log('data', data);
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {renderContent()}
      </div>
      <StepNavigation
        onNext={onStepComplete}
        step={currentStep}
        isLoading={isSending || isGenerating}
      />
    </div>
  );
};

export default MainContent; 