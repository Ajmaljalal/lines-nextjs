import React, { useState, useCallback } from 'react';
import { Textarea } from '../core-ui-components/textarea';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useNewsletter } from '@/context/NewsletterContext';
import { Button } from '../core-ui-components/button';
import { Upload, X, Loader2 } from 'lucide-react';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-8
    max-w-3xl
    mx-auto
    px-4
  `,
  formGroup: `
    space-y-2.5
  `,
  label: `
    text-sm
    font-medium
    text-zinc-300
    ml-1
  `,
  input: `
    w-full
    bg-zinc-800/50
    border-zinc-700/50
    text-zinc-200
    placeholder:text-zinc-500
    focus:border-zinc-600
    focus:ring-1
    focus:ring-zinc-600
    rounded-[12px]
    transition-colors
    duration-200
  `,
  recipientList: `
    flex
    flex-wrap
    gap-2
    mb-2
  `,
  recipientChip: `
    bg-zinc-700/50
    text-zinc-200
    px-3
    py-1
    rounded-full
    text-sm
    flex
    items-center
    gap-2
  `,
  addButton: `
    bg-[var(--primary-color)]
    border-none
    focus:ring-1
    focus:ring-primary/30
    rounded-[8px]
    transition-all
    duration-200
  `,
  uploadSection: `
    border-2
    border-dashed
    border-zinc-700/50
    rounded-[12px]
    p-6
    text-center
    cursor-pointer
    hover:border-zinc-600
    transition-colors
    duration-200
    mt-2
    w-full
    flex
    flex-col
    items-center
    justify-center
  `,
};

interface FourthStep_SendNewsletterProps {
  onComplete?: () => void;
}

const FourthStep_SendNewsletter: React.FC<FourthStep_SendNewsletterProps> = ({ onComplete }) => {
  const { data, updateData } = useNewsletter();
  const [subject, setSubject] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = () => {
    if (!currentRecipient.trim() || !isValidEmail(currentRecipient.trim())) {
      return;
    }

    const emailToAdd = currentRecipient.trim();
    if (data.recipients?.includes(emailToAdd)) {
      return;
    }

    const newRecipients = [...(data.recipients || []), emailToAdd];
    updateData({ recipients: newRecipients });
    setCurrentRecipient('');
  };

  const removeRecipient = (emailToRemove: string) => {
    const newRecipients = (data.recipients || []).filter(email => email !== emailToRemove);
    updateData({ recipients: newRecipients });
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      alert('Please upload a CSV file');
      return;
    }

    setCsvFile(file);

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const emails = text
        .split('\n')
        .map(line => line.trim())
        .filter(email => email && isValidEmail(email));

      updateData({ recipients: emails });
    };
    reader.readAsText(file);
  }, [updateData]);

  const handleSubmit = async () => {
    if (!subject || !fromEmail || !data.recipients?.length || !data.htmlContent) {
      setSendError('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          fromEmail,
          recipients: data.recipients,
          htmlContent: data.htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      // Update newsletter data with send details
      updateData({
        subject,
        fromEmail,
      });

      // Call onComplete callback if provided
      onComplete?.();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className={styles.formGroup}>
          <Label className={styles.label}>
            Subject Line <span className="text-red-500">*</span>
          </Label>
          <Input
            className={styles.input}
            placeholder="Enter the email subject line..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label className={styles.label}>
            From Email <span className="text-red-500">*</span>
          </Label>
          <Input
            className={styles.input}
            type="email"
            placeholder="Enter the sender email address..."
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <Label className={styles.label}>
            Add more recipients / subscribers <span className="text-red-500">*</span>
          </Label>

          {data.recipients && data.recipients.length > 0 && (
            <div className={styles.recipientList}>
              {data.recipients.map((email, index) => (
                <div key={index} className={styles.recipientChip}>
                  <span className="truncate max-w-[300px]">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Input
              className={`${styles.input} pr-[70px]`}
              type="email"
              placeholder="Enter email addresses and press Enter or Add..."
              value={currentRecipient}
              onChange={(e) => setCurrentRecipient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRecipient();
                }
              }}
            />
            <Button
              type="button"
              onClick={addRecipient}
              className={`
                ${styles.addButton}
                absolute
                right-[8px]
                top-1/2
                -translate-y-1/2
                h-[calc(100%-16px)]
                min-w-[50px]
                text-xs
                px-2.5
              `}
            >
              Add
            </Button>
          </div>

          <div className="mt-4">
            <Label className={styles.label}>
              Or Upload CSV File
            </Label>
            <label className={styles.uploadSection}>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className="w-6 h-6 text-zinc-400" />
              <p className="text-sm text-zinc-400 mt-2">
                {csvFile ? csvFile.name : 'Click to upload a CSV file of email addresses'}
              </p>
            </label>
          </div>
        </div>

        {sendError && (
          <div className="text-red-500 text-sm mt-4">
            {sendError}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSending}
            className={`
              ${styles.addButton}
              min-w-[120px]
              ${isSending ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              'Send Newsletter'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FourthStep_SendNewsletter; 