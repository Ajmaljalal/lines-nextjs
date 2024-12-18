import React from 'react';
import { Button } from '../ui/button';
import { useNewsletter } from '@/context/NewsletterContext';
import { NewsletterStep } from './StepsIndicator';

const styles = {
  button: `
    bg-[var(--primary-color)]
    hover:bg-[var(--secondary-color)]
    text-white
    rounded-[12px]
    transition-colors
    duration-200
  `,
};

interface CompleteStepButtonProps {
  onComplete: () => void;
  step: NewsletterStep;
}

const CompleteStepButton: React.FC<CompleteStepButtonProps> = ({
  onComplete,
  step
}) => {
  const { isStepValid, data } = useNewsletter();

  return (
    <Button
      onClick={onComplete}
      disabled={!isStepValid(step)}
    >
      Next Step
    </Button>
  );
};

export default CompleteStepButton; 