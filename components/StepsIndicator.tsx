'use client'

import React from 'react';
import { Check, Pencil, Send, Palette } from 'lucide-react';

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

// ... existing code ...
const styles = {
  container: `
    flex
    flex-col
    gap-2
    p-4
    h-full
    bg-zinc-800/50
    rounded-lg
    border
    border-zinc-700/50
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
    hover:bg-zinc-700/50
    border
    border-transparent
  `,
  stepActive: `
    bg-zinc-700/80
    border-zinc-600
  `,
  stepCompleted: `
    text-green-500
  `,
  stepIcon: `
    w-7
    h-7
    p-1.5
    rounded-md
    bg-zinc-700/50
    transition-colors
    duration-200
  `,
  stepIconActive: `
    bg-zinc-600
  `,
  stepText: `
    text-sm
    font-medium
    transition-colors
    duration-200
  `,
};

const StepsIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: NewsletterStep.TOPIC, label: 'Topic Selection', icon: Pencil },
    { id: NewsletterStep.CONTENT, label: 'Content Drafting', icon: Pencil },
    { id: NewsletterStep.DESIGN, label: 'Design & Edit', icon: Palette },
    { id: NewsletterStep.SEND, label: 'Send Newsletter', icon: Send },
  ];

  return (
    <div className={styles.container}>
      {steps.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = false; // TODO: Add completion logic

        return (
          <div
            key={step.id}
            className={`${styles.step} ${isActive ? styles.stepActive : ''}`}
            onClick={() => onStepClick(step.id)}
          >
            <div className={`${styles.stepIcon} ${isActive ? styles.stepIconActive : ''}`}>
              {isCompleted ? (
                <Check className={styles.stepCompleted} />
              ) : (
                <step.icon className={isActive ? 'text-zinc-200' : 'text-zinc-400'} />
              )}
            </div>
            <span className={`${styles.stepText} ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  );
};

export default StepsIndicator; 