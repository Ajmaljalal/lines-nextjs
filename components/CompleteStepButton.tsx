import React from 'react';
import { Button } from './ui/button';

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
}

const CompleteStepButton: React.FC<CompleteStepButtonProps> = ({ onComplete }) => {
  return (
    <Button className={styles.button} onClick={onComplete}>
      Mark as Complete
    </Button>
  );
};

export default CompleteStepButton; 