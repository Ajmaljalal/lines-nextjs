import React from 'react';
import { Button } from '../core-ui-components/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNewsletter } from '@/context/NewsletterContext';
import { NewsletterStep } from './StepsIndicator';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get('id');
  const { data, isStepValid } = useNewsletter();
  const { user } = useAuth();
  const isNewsletterSent = data.status === 'sent';

  const saveNewsletter = async (status: 'draft' | 'sent') => {
    if (!user || !newsletterId) return;

    const newsletter = {
      ...data,
      id: newsletterId,
      userId: user.uid,
      status,
      updatedAt: new Date()
    };

    try {
      const newsletterRef = doc(db, 'newsletters', newsletterId);
      await setDoc(newsletterRef, newsletter, { merge: true });
    } catch (error) {
      console.error('Error saving newsletter:', error);
    }
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel? Your progress will be saved as a draft.')) {
      await saveNewsletter('draft');
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
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      onNext();
    }
  };

  const isNextDisabled = !isStepValid(step) || isLoading;

  const handleNext = async () => {
    if (step === NewsletterStep.SEND) {
      await saveNewsletter('sent');
    }
    onNext();
  };

  if (isNewsletterSent) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-[8px] text-sm border border-green-300 shadow-lg">
        Newsletter has already been sent
        <Button
          onClick={() => router.push('/')}
          className=" h-6 w-6 ml-2 hover:bg-green-200 rounded-full p-1 shadow-lg border border-green-300"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const buttonText = step === NewsletterStep.SEND ? 'Send' : 'Next';
  return (
    <div className={styles.container}>
      <div className="flex gap-2">
        {step !== NewsletterStep.TOPIC && (
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
        onClick={handleNext}
        disabled={isNextDisabled}
        className={`${styles.button} ${styles.nextButton} ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {isLoading ? 'Sending...' : buttonText}
      </Button>
    </div>
  );
};

export default StepNavigation; 