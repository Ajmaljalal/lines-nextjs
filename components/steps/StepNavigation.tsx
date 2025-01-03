import React from 'react';
import { Button } from '../core-ui-components/button';
import { useRouter } from 'next/navigation';
import { useNewsletter } from '@/context/NewsletterContext';
import { NewsletterStep } from './StepsIndicator';

const styles = {
  container: `
    flex
    justify-between
    items-center
    mt-6
  `,
  button: `
    px-4
    py-2
    rounded-[8px]
    transition-colors
    duration-200
    text-sm
  `,
  backButton: `
    border
    border-border-color
    hover:bg-muted
  `,
  cancelButton: `
    text-red-500
    hover:bg-red-500/10
  `,
  nextButton: `
    bg-[var(--primary-color)]
    text-white
    hover:bg-[var(--secondary-color)]
  `
};

interface StepNavigationProps {
  onNext: () => void;
  isLoading?: boolean;
  step: NewsletterStep;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  isLoading,
  step
}) => {
  const router = useRouter();
  const { setCurrentStep, currentStep, isStepValid } = useNewsletter();

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Your progress will be saved as a draft.')) {
      router.push('/');
    }
  };

  const handleBack = () => {
    const steps = [
      NewsletterStep.TOPIC,
      NewsletterStep.CONTENT,
      NewsletterStep.DESIGN,
      NewsletterStep.SEND
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const isNextDisabled = !isStepValid(currentStep) || isLoading;

  return (
    <div className={styles.container}>
      <div className="flex gap-2">
        {currentStep !== NewsletterStep.TOPIC && (
          <Button
            onClick={handleBack}
            className={`${styles.button} ${styles.backButton}`}
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleCancel}
          className={`${styles.button} ${styles.cancelButton}`}
        >
          Save as Draft
        </Button>
      </div>
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`${styles.button} ${styles.nextButton} ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {step === NewsletterStep.SEND ? 'Send' : 'Next'}
      </Button>
    </div>
  );
};

export default StepNavigation; 