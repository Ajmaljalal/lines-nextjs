import React, { useState, useCallback } from 'react';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useNewsletter } from '@/context/NewsletterContext';
import { Button } from '../core-ui-components/button';
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
  recipientList: `
    flex
    flex-wrap
    gap-2
    mb-2
  `,
  recipientChip: `
    bg-muted
    text-foreground
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
    text-white
    border-none
    focus:ring-1
    focus:ring-[var(--primary-color)]
    rounded-[8px]
    transition-all
    duration-200
  `,
  uploadSection: `
    border-2
    border-dashed
    border-zinc-700/20
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
  const { user } = useAuth();
  const [senderName, setSenderName] = useState(data.senderName || '');
  const [subject, setSubject] = useState(data.subject || '');
  const [fromEmail, setFromEmail] = useState(data.fromEmail || '');
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const isReadOnly = data.status === 'sent';

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getExistingSubscribers = async (userId: string) => {
    try {
      const subscribersRef = doc(db, 'subscribers', userId);
      const docSnap = await getDoc(subscribersRef);
      if (docSnap.exists()) {
        return docSnap.data().subscribers || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching existing subscribers:', error);
      return [];
    }
  };

  const addRecipient = async () => {
    if (!currentRecipient.trim() || !isValidEmail(currentRecipient.trim()) || !user) {
      return;
    }

    const emailToAdd = currentRecipient.trim();
    if (data.recipients?.includes(emailToAdd)) {
      return;
    }

    const newRecipients = [...(data.recipients || []), emailToAdd];
    updateData({ recipients: newRecipients });

    try {
      // Get existing subscribers and append new one
      const existingSubscribers = await getExistingSubscribers(user.uid);
      if (!existingSubscribers.includes(emailToAdd)) {
        const updatedSubscribers = [...existingSubscribers, emailToAdd];

        // Save to Firebase
        const subscribersRef = doc(db, 'subscribers', user.uid);
        await setDoc(subscribersRef, {
          userId: user.uid,
          subscribers: updatedSubscribers,
          totalCount: updatedSubscribers.length,
          updatedAt: new Date().toISOString()
        });
      }
      setCurrentRecipient('');
    } catch (error) {
      console.error('Error saving recipient:', error);
      // Remove the recipient if Firebase save fails
      const revertedRecipients = newRecipients.filter((email: string) => email !== emailToAdd);
      updateData({ recipients: revertedRecipients });
      setSendError('Failed to save recipient');
    }
  };

  const removeRecipient = async (emailToRemove: string) => {
    const newRecipients = (data.recipients || []).filter((email: string) => email !== emailToRemove);
    updateData({ recipients: newRecipients });

    if (!user) return;

    try {
      // Get existing subscribers and remove the email
      const existingSubscribers = await getExistingSubscribers(user.uid);
      const updatedSubscribers = existingSubscribers.filter((email: string) => email !== emailToRemove);

      // Update Firebase
      const subscribersRef = doc(db, 'subscribers', user.uid);
      await setDoc(subscribersRef, {
        userId: user.uid,
        subscribers: updatedSubscribers,
        totalCount: updatedSubscribers.length,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing recipient:', error);
      // Revert the local state if Firebase update fails
      updateData({ recipients: [...newRecipients, emailToRemove] });
      setSendError('Failed to remove recipient');
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'text/csv') {
      setUploadStatus('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    setUploadStatus('Processing CSV file...');

    try {
      // Read and parse CSV
      const text = await file.text();
      const newEmails = text
        .split('\n')
        .map(line => line.trim())
        .filter(email => email && isValidEmail(email));

      if (newEmails.length === 0) {
        setUploadStatus('No valid email addresses found in the CSV file');
        return;
      }

      // Get existing subscribers and merge with new ones
      const existingSubscribers = await getExistingSubscribers(user.uid);
      const uniqueEmails = Array.from(new Set([...existingSubscribers, ...newEmails]));

      // Save to Firebase
      const subscribersRef = doc(db, 'subscribers', user.uid);
      await setDoc(subscribersRef, {
        userId: user.uid,
        subscribers: uniqueEmails,
        totalCount: uniqueEmails.length,
        updatedAt: new Date().toISOString()
      });

      updateData({ recipients: uniqueEmails });
      setUploadStatus(`Successfully uploaded ${newEmails.length} subscribers (${uniqueEmails.length} total unique subscribers)`);
    } catch (error) {
      console.error('Error processing CSV:', error);
      setUploadStatus('Error processing CSV file');
    }
  }, [user, updateData]);

  return (
    <form className={styles.container}>
      <div className={styles.formGroup}>
        <Label>
          Sender Name <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Enter the sender's name..."
          value={senderName}
          onChange={(e) => {
            setSenderName(e.target.value);
            updateData({ senderName: e.target.value });
          }}
          required
          disabled={isReadOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          Subject Line <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="Enter the email subject line..."
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            updateData({ subject: e.target.value });
          }}
          required
          disabled={isReadOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          From Email <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="Enter the sender email address..."
          value={fromEmail}
          onChange={(e) => {
            setFromEmail(e.target.value);
            updateData({ fromEmail: e.target.value });
          }}
          required
          disabled={isReadOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          Add recipients / subscribers <span className="text-red-500">*</span>
        </Label>

        {data.recipients && data.recipients.length > 0 && (
          <div className={styles.recipientList}>
            {data.recipients.slice(0, 4).map((email, index) => (
              <div key={index} className={styles.recipientChip}>
                <span className="truncate max-w-[300px]">{email}</span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(email)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {data.recipients.length > 4 && (
              <div className={`${styles.recipientChip} bg-zinc-700/50`}>
                +{data.recipients.length - 4} more
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <Input
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
            disabled={isReadOnly}
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
          <label className={styles.uploadSection}>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isReadOnly}
            />
            <Upload className="w-6 h-6 text-zinc-400" />
            <p className="text-sm text-zinc-400 mt-2">
              {csvFile ? csvFile.name : 'Or click/drag to upload a CSV file of your recipients'}
            </p>
            {uploadStatus && (
              <p className={`text-sm mt-2 ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {uploadStatus}
              </p>
            )}
          </label>
        </div>
      </div>

      {sendError && (
        <div className="text-red-500 text-sm mt-4">
          {sendError}
        </div>
      )}
    </form>
  );
};

export default FourthStep_SendNewsletter; 