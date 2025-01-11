import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useNewsletter } from '@/context/NewsletterContext';
import { Button } from '../core-ui-components/button';
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getExistingSubscribers,
  addSubscriber,
  removeSubscriber as removeSubscriberService,
  uploadCsvSubscribers
} from '@/services/subscriberService';

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

  // -------------------------------------------------
  // Fetch existing subscribers at component mount
  // -------------------------------------------------
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const subscribers = await getExistingSubscribers(user.uid);
        // Merge or Overwrite with Firestore data
        // If you want to keep user’s local recipients, 
        // you can optionally merge them here
        updateData({ recipients: subscribers });
      } catch (error) {
        console.error('Error fetching existing subscribers:', error);
      }
    })();
  }, [user]);

  // Sync local state whenever data changes from the agent
  useEffect(() => {
    setSenderName(data.senderName || '');
  }, [data.senderName]);

  useEffect(() => {
    setSubject(data.subject || '');
  }, [data.subject]);

  useEffect(() => {
    setFromEmail(data.fromEmail || '');
  }, [data.fromEmail]);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = async () => {
    if (!currentRecipient.trim() || !isValidEmail(currentRecipient.trim()) || !user) {
      return;
    }

    const emailToAdd = currentRecipient.trim();
    // Check if already in local newsletter recipients
    if (data.recipients?.includes(emailToAdd)) {
      return;
    }

    // Update local recipients
    const newRecipients = [...(data.recipients || []), emailToAdd];
    updateData({ recipients: newRecipients });

    try {
      // Add subscriber in Firestore
      await addSubscriber(user.uid, emailToAdd);
      setCurrentRecipient('');
    } catch (error) {
      console.error('Error saving recipient:', error);
      // Revert if something fails
      const revertedRecipients = newRecipients.filter((email) => email !== emailToAdd);
      updateData({ recipients: revertedRecipients });
      setSendError('Failed to save recipient');
    }
  };

  const removeRecipient = async (emailToRemove: string) => {
    // Update local recipients
    const newRecipients = (data.recipients || []).filter((email) => email !== emailToRemove);
    updateData({ recipients: newRecipients });

    if (!user) return;

    try {
      // Remove from Firestore
      await removeSubscriberService(user.uid, emailToRemove);
    } catch (error) {
      console.error('Error removing recipient:', error);
      // Revert if something fails
      updateData({ recipients: [...newRecipients, emailToRemove] });
      setSendError('Failed to remove recipient');
    }
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setCsvFile(file);
      setUploadStatus('Processing CSV file...');

      try {
        const { newEmails, totalUnique } = await uploadCsvSubscribers(
          user.uid,
          file,
          isValidEmail
        );

        // Here we’re overwriting local recipients with the newly combined list
        updateData({ recipients: newEmails });
        setUploadStatus(
          `Successfully uploaded ${newEmails.length} subscribers (${totalUnique} total unique subscribers)`
        );
      } catch (error: any) {
        console.error('Error processing CSV file:', error);
        setUploadStatus(error.message || 'Error processing CSV file');
      }
    },
    [user, updateData]
  );

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
            const val = e.target.value;
            setSenderName(val);
            // Generate and set email automatically
            const generatedEmail = val.toLowerCase().replace(/\s+/g, '') + '@sendlines.com';
            setFromEmail(generatedEmail);
            updateData({
              senderName: val,
              fromEmail: generatedEmail
            });
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
            const val = e.target.value;
            setSubject(val);
            updateData({ subject: val });
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
          value={fromEmail}
          readOnly
          disabled={true}
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Email is automatically generated based on the sender name
        </p>
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