'use client'

import React from 'react';
import { NewsletterStep } from './StepsIndicator';
import FirstStep_DataCollection from './FirstStep_DataCollection';
import NewsletterPreview from './NewsletterPreview';
import CompleteStepButton from './CompleteStepButton';
import { useNewsletter } from '@/context/NewsletterContext';

interface MainContentProps {
  onStepComplete: () => void;
}

const styles = {
  container: `
    w-full
    h-full
    bg-zinc-800/50
    rounded-[10px]
    p-6
    overflow-y-auto
    relative
  `,
  contentWrapper: `
    h-full
    pb-16
  `,
  buttonWrapper: `
    absolute
    bottom-4
    right-4
  `,
};

const MainContent: React.FC<MainContentProps> = ({ onStepComplete }) => {
  const { currentStep, data } = useNewsletter();
  const renderContent = () => {
    switch (currentStep) {
      case NewsletterStep.TOPIC:
        return <FirstStep_DataCollection />;
      case NewsletterStep.CONTENT:
        return <div>Content Drafting</div>;
      case NewsletterStep.DESIGN:
        return <NewsletterPreview onComplete={onStepComplete} />;
      case NewsletterStep.SEND:
        return <div>Send Newsletter</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {renderContent()}
      </div>
      <div className={styles.buttonWrapper}>
        <CompleteStepButton
          onComplete={onStepComplete}
          step={currentStep}
        />
      </div>
    </div>
  );
};

export default MainContent; 