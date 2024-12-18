'use client'

import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';
import { useNewsletter } from '@/context/NewsletterContext';

export enum NewsletterStep {
  TOPIC = 'topic',
  CONTENT = 'content',
  DESIGN = 'design',
  SEND = 'send'
}

interface StepIndicatorProps {
  onStepClick: (step: NewsletterStep) => void;
}

const styles = {
  container: `
    flex
    flex-col
    gap-2
    p-4
    h-full
    max-w-[220px]
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
    hover:bg-zinc-800/50
  `,
  stepActive: `
    text-[var(--primary-color)]
  `,
  stepCompleted: `
    text-green-500
  `,
  stepPending: `
    text-zinc-400
  `,
  stepIcon: `
    w-5
    h-5
  `,
  stepText: `
    text-sm
    font-medium
    transition-colors
    duration-200
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
    { id: NewsletterStep.TOPIC, label: 'Topic & Resources' },
    { id: NewsletterStep.CONTENT, label: 'Content Drafting' },
    { id: NewsletterStep.DESIGN, label: 'Design & Editing' },
    { id: NewsletterStep.SEND, label: 'Sending' },
  ];

  const getStepStatus = (stepId: NewsletterStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const isStepDisabled = (stepId: NewsletterStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    // Allow clicking if step is completed or is the next step and current step is valid
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

        return (
          <div
            key={step.id}
            className={`${styles.step} ${disabled ? styles.stepDisabled : ''}`}
            onClick={() => !disabled && onStepClick(step.id)}
          >
            <div className={styles.stepIcon}>
              {status === 'completed' && (
                <Check className={styles.stepCompleted} />
              )}
              {status === 'active' && (
                <Loader2 className={`${styles.stepActive} ${styles.spinAnimation}`} />
              )}
              {status === 'pending' && (
                <Circle className={styles.stepPending} />
              )}
            </div>
            <span
              className={`${styles.stepText} ${status === 'completed' ? styles.stepCompleted :
                status === 'active' ? styles.stepActive :
                  styles.stepPending
                }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  );
};

export default StepsIndicator; 