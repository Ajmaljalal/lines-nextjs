'use client'

import React from 'react';
import { NewsletterStep } from './StepsIndicator';
import NewsletterForm from './NewsletterForm';
import NewsletterPreview from './NewsletterPreview';
import { Button } from './ui/button';

interface MainContentProps {
  currentStep: NewsletterStep;
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
  `,
  footer: `
    mt-8
    flex
    justify-end
  `,
  button: `
    bg-orange-500
    hover:bg-orange-600
    text-white
  `,
};

const MainContent: React.FC<MainContentProps> = ({ currentStep, onStepComplete }) => {
  const renderContent = () => {
    switch (currentStep) {
      case NewsletterStep.TOPIC:
        return <NewsletterForm onComplete={onStepComplete} />;
      case NewsletterStep.CONTENT:
        return (
          <div>
            <div>Content Drafting</div>
            <div className={styles.footer}>
              <Button className={styles.button} onClick={onStepComplete}>
                Mark as Complete
              </Button>
            </div>
          </div>
        );
      case NewsletterStep.DESIGN:
        return <NewsletterPreview onComplete={onStepComplete} />;
      case NewsletterStep.SEND:
        return (
          <div>
            <div>Send Newsletter</div>
            <div className={styles.footer}>
              <Button className={styles.button} onClick={onStepComplete}>
                Mark as Complete
              </Button>
            </div>
          </div>
        );
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