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
import { ContentDrafterAgent } from '@/agents/content_drafter_agent';
import { HtmlGeneratorAgent } from '@/agents/html_generator_agent';
import { useBrandTheme } from '@/context/BrandThemeContext';

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

  const generateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const agent = new ContentDrafterAgent({
        messages: [],
        data: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          topic: data.topic,
          content: data.content,
          urls: data.urls,
          style: data.style
        }
      });

      const response = await agent.execute();
      if (response.error) {
        throw new Error(response.error);
      }

      await updateData({ generatedContent: response.content });
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
      const agent = new HtmlGeneratorAgent({
        messages: [],
        data: {
          id: data.id,
          userId: data.userId,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          topic: data.topic || '',
          urls: data.urls || [],
          style: data.style || '',
          content: data.generatedContent || '',
        }
      }, currentTheme);

      const response = await agent.execute();
      if (response.error) {
        throw new Error(response.error);
      }

      await updateData({ htmlContent: response.content });
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