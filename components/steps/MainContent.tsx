'use client'

import React, { useState } from 'react';
import { NewsletterStep } from './StepsIndicator';
import FirstStep_DataCollection from './Step_1_DataCollection';
import SecondStep_ContentDrafting from './Step_2_ContentDrafting';
import ThirdStep_HtmlPreview from './Step_3_HtmlPreview';
import FourthStep_SendNewsletter from './Step_4_SendNewsletter';
import StepNavigation from './StepNavigation';
import { useNewsletter } from '@/context/NewsletterContext';

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
  const { currentStep, data } = useNewsletter();
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
    try {
      setIsSending(true);
      setSendError(null);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
          fromEmail: data.fromEmail,
          senderName: data.senderName,
          recipients: data.recipients,
          htmlContent: data.htmlContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send newsletter');
      }

      onStepComplete();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      setSendError(error instanceof Error ? error.message : 'Failed to send newsletter');
    } finally {
      setIsSending(false);
    }
  };

  const handleAction = () => {
    console.log("data in main content", data)
    if (currentStep === NewsletterStep.SEND) {
      handleSend();
    } else {
      onStepComplete();
    }
  };

  const renderContent = () => {
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
        {sendError && (
          <div className="text-red-500 text-sm mt-4 px-4">
            {sendError}
          </div>
        )}
      </div>
      <StepNavigation
        onNext={handleAction}
        step={currentStep}
        isLoading={isSending}
      />
    </div>
  );
};

export default MainContent; 