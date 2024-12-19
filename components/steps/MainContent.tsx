'use client'

import React from 'react';
import { NewsletterStep } from './StepsIndicator';
import FirstStep_DataCollection from './FirstStep_DataCollection';
import NewsletterPreview from './NewsletterPreview';
import CompleteStepButton from './CompleteStepButton';
import { useNewsletter } from '@/context/NewsletterContext';
import SecondStep_ContentDrafting from './SecondStep_ContentDrafting';
import ThirdStep_HtmlPreview from './ThirdStep_HtmlPreview';

interface MainContentProps {
  onStepComplete: () => void;
}


const styles = {
  container: `
    w-full
    h-full
    bg-zinc-800/50
    rounded-[12px]
    p-6
    flex
    flex-col
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
  const { currentStep } = useNewsletter();
  const renderContent = () => {
    switch (currentStep) {
      case NewsletterStep.TOPIC:
        return <FirstStep_DataCollection />;
      case NewsletterStep.CONTENT:
        return <SecondStep_ContentDrafting />;
      case NewsletterStep.DESIGN:
        return <ThirdStep_HtmlPreview />;
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