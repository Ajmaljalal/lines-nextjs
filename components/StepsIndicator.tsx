'use client'

import React from 'react';
import { Check, Loader2, Circle } from 'lucide-react';

export enum NewsletterStep {
  TOPIC = 'topic',
  CONTENT = 'content',
  DESIGN = 'design',
  SEND = 'send'
}

interface StepIndicatorProps {
  currentStep: NewsletterStep;
  onStepClick: (step: NewsletterStep) => void;
}

const styles = {
  container: `
    flex
    flex-col
    gap-2
    p-4
    h-full
  `,
  step: `
    flex
    items-center
    gap-3
    p-3
    rounded-md
    cursor-pointer
    transition-all
    duration-200
    hover:bg-zinc-800/50
  `,
  stepActive: `
    text-orange-500
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
  `
};

const StepsIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
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

  return (
    <div className={styles.container}>
      {steps.map((step) => {
        const status = getStepStatus(step.id);

        return (
          <div
            key={step.id}
            className={styles.step}
            onClick={() => onStepClick(step.id)}
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