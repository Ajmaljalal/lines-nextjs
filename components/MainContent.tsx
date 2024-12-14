'use client'

import React from 'react';
import { NewsletterStep } from './StepsIndicator';
import NewsletterForm from './NewsletterForm';
import NewsletterPreview from './NewsletterPreview';

interface MainContentProps {
  currentStep: NewsletterStep;
}

const styles = {
  container: `
    w-full
    h-full
    bg-zinc-800/50
    rounded-[10px]
    p-6
    overflow-y-auto
  `,
};

const MainContent: React.FC<MainContentProps> = ({ currentStep }) => {
  const renderContent = () => {
    switch (currentStep) {
      case NewsletterStep.TOPIC:
        return <NewsletterForm />;
      case NewsletterStep.CONTENT:
        return <div>Content Drafting</div>;
      case NewsletterStep.DESIGN:
        return <NewsletterPreview />;
      case NewsletterStep.SEND:
        return <div>Send Newsletter</div>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderContent()}
    </div>
  );
};

export default MainContent; 