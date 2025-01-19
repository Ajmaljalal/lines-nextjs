'use client'

import React, { useEffect } from 'react';
import { Check, Lock, Hourglass } from 'lucide-react';
import { useNewsletter } from '@/context/NewsletterContext';

export enum EmailCreationStep {
  TOPIC = 'topic',
  CONTENT = 'content',
  DESIGN = 'design',
  SEND = 'send'
}

interface StepIndicatorProps {
  onStepClick: (step: EmailCreationStep) => void;
}

const styles = {
  container: `
    flex
    flex-col
    gap-2
    p-3
    h-full
  `,
  step: `
    flex
    items-center
    gap-3
    p-3
    rounded-[12px]
    cursor-pointer
    transition-all
    duration-200
    hover:bg-zinc-100/50
    border
    border-transparent
    w-[105px]
  `,
  stepActive: `
    text-[var(--primary-color)]
    bg-zinc-100
    hover:bg-zinc-100
  `,
  stepCompleted: `
    text-green-500
  `,
  stepPending: `
    text-zinc-400
  `,
  stepIcon: `
    w-4
    h-4
    flex
    items-center
    justify-center
  `,
  stepText: `
    text-sm
    font-medium
    transition-colors
    duration-200
  `,
  stepTextLong: `
    block
    lg:hidden
  `,
  stepTextShort: `
    hidden
    lg:block
  `,
  spinAnimation: `
    animate-spin
  `,
  stepDisabled: `
    opacity-50
    cursor-not-allowed
    hover:bg-transparent
  `,
};

const StepsIndicator: React.FC<StepIndicatorProps> = ({ onStepClick }) => {
  const { currentStep, isStepValid } = useNewsletter();
  const steps = [
    {
      id: EmailCreationStep.TOPIC,
      shortLabel: 'Topic',
      longLabel: 'Topic'
    },
    {
      id: EmailCreationStep.CONTENT,
      shortLabel: 'Content',
      longLabel: 'Draft'
    },
    {
      id: EmailCreationStep.DESIGN,
      shortLabel: 'Design',
      longLabel: 'Design'
    },
    {
      id: EmailCreationStep.SEND,
      shortLabel: 'Send',
      longLabel: 'Send'
    },
  ];

  useEffect(() => {
    console.log('Current step is:', currentStep);
  }, [currentStep]);

  const getStepStatus = (stepId: EmailCreationStep) => {
    if (stepId === currentStep) return 'active';
    if (isStepValid(stepId)) return 'completed';
    return 'pending';
  };

  const isStepDisabled = (stepId: EmailCreationStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    if (getStepStatus(stepId) === 'completed') return false;
    if (stepIndex === currentIndex + 1 && isStepValid(currentStep)) return false;
    if (stepIndex > currentIndex) return true;
    return false;
  };

  return (
    <div className={styles.container}>
      {steps.map((step) => {
        const status = getStepStatus(step.id);
        const disabled = isStepDisabled(step.id);
        const isActive = status === 'active';

        console.log('Step ID:', step.id, 'Status:', status, 'Disabled:', disabled);

        return (
          <div
            key={step.id}
            className={`
              ${styles.step}
              ${disabled ? styles.stepDisabled : ''}
              ${isActive ? styles.stepActive : ''}
            `}
            onClick={() => !disabled && onStepClick(step.id)}
          >
            <div className={`${styles.stepIcon} ${isActive ? styles.stepActive : ''}`}>
              {status === 'completed' && (
                <Check className={styles.stepCompleted} />
              )}
              {status === 'active' && (
                <Hourglass className={styles.stepActive} />
              )}
              {status === 'pending' && (
                <Lock className={styles.stepPending} />
              )}
            </div>
            <span
              className={`${styles.stepText} ${status === 'completed'
                ? styles.stepCompleted
                : isActive
                  ? styles.stepActive
                  : styles.stepPending
                }`}
            >
              <span className={styles.stepTextLong}>{step.shortLabel}</span>
              <span className={styles.stepTextShort}>{step.longLabel}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepsIndicator; 