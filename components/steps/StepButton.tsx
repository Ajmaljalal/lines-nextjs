import React from 'react';
import { Button } from '../core-ui-components/button';
import { useContent } from '@/context/ContentContext';
import { EmailCreationStep } from './StepsIndicator';
import { Loader2 } from 'lucide-react';

const styles = {
  button: `
    bg-[var(--primary-color)]
    hover:bg-[var(--secondary-color)]
    text-white
    rounded-[12px]
    transition-colors
    duration-200
    border-2
    border-[var(--primary-color)]
    hover:border-[var(--secondary-color)]
  `,
};

interface CompleteStepButtonProps {
  onComplete: () => void;
  step: EmailCreationStep;
  isLoading?: boolean;
}

const CompleteStepButton: React.FC<CompleteStepButtonProps> = ({
  onComplete,
  step,
  isLoading
}) => {
  const { validateStep, data } = useContent();

  const stepText = step === EmailCreationStep.SEND ? "Send" : "Next";

  return (
    <Button
      onClick={onComplete}
      disabled={!validateStep(step) || isLoading}
      className={`
        ${styles.button}
        min-w-[120px]
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </div>
      ) : (
        stepText
      )}
    </Button>
  );
};

export default CompleteStepButton; 