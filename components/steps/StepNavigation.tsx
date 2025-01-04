import React, { useState } from 'react';
import { Button } from '../core-ui-components/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNewsletter } from '@/context/NewsletterContext';
import { NewsletterStep } from './StepsIndicator';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { X, Loader2 } from 'lucide-react';

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
  const { data, updateData, isStepValid } = useNewsletter();
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNewsletterSent = data.status === 'sent';

  const saveNewsletter = async (status: 'draft' | 'sent') => {
    if (!user || !newsletterId) return;

    setIsSaving(true);
    // Clean the data by removing undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const newsletter = {
      ...cleanData,
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
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const sendNewsletter = async () => {
    try {
      setIsSending(true);
      setError(null);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: data.subject,
          senderName: data.senderName,
          fromEmail: data.fromEmail,
          htmlContent: data.htmlContent,
          userId: user?.uid,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to send newsletter');
      }

      await saveNewsletter('sent');
      router.push('/'); // Redirect to home after successful send
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send newsletter');
      console.error('Send newsletter error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = async () => {
    if (step === NewsletterStep.SEND && isStepValid(step)) {
      await sendNewsletter();
    } else {
      onNext();
    }
  };

  const buttonText = step === NewsletterStep.SEND ? 'Send Newsletter' : 'Next';

  if (isNewsletterSent) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-[8px] text-sm border border-green-300 shadow-lg">
        Newsletter has already been sent
        <Button
          onClick={() => router.push('/')}
          className="h-6 w-6 ml-2 hover:bg-green-200 rounded-full p-1 shadow-lg border border-green-300"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="flex gap-2">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200">
            {error}
          </div>
        )}
        {step !== NewsletterStep.TOPIC && (
          <Button
            onClick={() => router.back()}
            className={`${styles.button} ${styles.backButton}`}
          >
            Back
          </Button>
        )}
        <Button
          onClick={() => saveNewsletter('draft')}
          className={`${styles.button} ${styles.cancelButton}`}
          disabled={isSaving}
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          ) : (
            'Save as Draft'
          )}
        </Button>
      </div>
      <Button
        onClick={handleNext}
        disabled={!isStepValid(step) || isSending || isSaving}
        className={`${styles.button} ${styles.nextButton} ${(isSending || isSaving || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </div>
        ) : (
          buttonText
        )}
      </Button>
    </div>
  );
};

export default StepNavigation; 