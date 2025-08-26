import React, { useState, useEffect } from 'react';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useContent } from '@/context/ContentContext';
import { useAuth } from '@/context/AuthContext';
import {
  getExistingSubscribers,
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

interface FourthStep_SendEmailProps {
  onComplete?: () => void;
}

const FourthStep_SendEmail: React.FC<FourthStep_SendEmailProps> = ({ onComplete }) => {
  const { data, updateData } = useContent();
  const { user } = useAuth();
  const [senderName, setSenderName] = useState(data.senderName || '');
  const [subject, setSubject] = useState(data.subject || '');
  const [fromEmail, setFromEmail] = useState(data.fromEmail || '');
  const [replyToEmail, setReplyToEmail] = useState(data.replyToEmail || '');
  const isReadOnly = data.status === 'sent';

  // Fetch existing subscribers at component mount
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const subscribers = await getExistingSubscribers(user.uid);
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

  useEffect(() => {
    setReplyToEmail(data.replyToEmail || '');
  }, [data.replyToEmail]);

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
          Reply-To Email
        </Label>
        <Input
          type="email"
          placeholder="Enter reply-to email address (optional)..."
          value={replyToEmail}
          onChange={(e) => {
            const val = e.target.value;
            setReplyToEmail(val);
            updateData({ replyToEmail: val });
          }}
          disabled={isReadOnly}
        />
        <p className="text-sm text-muted-foreground mt-1">
          If not set, replies will go to the From Email address
        </p>
      </div>
    </form>
  );
};

export default FourthStep_SendEmail;
