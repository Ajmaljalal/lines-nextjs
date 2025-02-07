'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/layouts/Header';
import { Input } from '@/components/core-ui-components/input';
import { Button } from '@/components/core-ui-components/button';
import { Upload, X, Loader2 } from 'lucide-react';
import {
  getExistingSubscribers,
  addSubscriber,
  removeSubscriber,
  uploadCsvSubscribers
} from '@/services/subscriberService';

const styles = {
  container: `
    min-h-screen 
    bg-transparent
    backdrop-blur-[200px]
    flex 
    flex-col
  `,
  content: `
    w-full
    max-w-3xl
    mx-auto
    px-4
    py-8
    mt-20
  `,
  header: `
    mb-8
  `,
  title: `
    text-2xl 
    font-semibold
    tracking-tight
  `,
  subtitle: `
    text-sm
    text-muted-foreground
    mt-1
  `,
  recipientList: `
    flex
    flex-wrap
    gap-2
    mb-4
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
    mt-6
    w-full
    flex
    flex-col
    items-center
    justify-center
  `,
};

const AudiencePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    loadSubscribers();
  }, [user]);

  const loadSubscribers = async () => {
    if (!user) return;
    const existingSubscribers = await getExistingSubscribers(user.uid);
    setSubscribers(existingSubscribers);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddSubscriber = async () => {
    if (!currentEmail.trim() || !isValidEmail(currentEmail.trim()) || !user) {
      return;
    }

    const emailToAdd = currentEmail.trim();
    if (subscribers.includes(emailToAdd)) {
      return;
    }

    try {
      await addSubscriber(user.uid, emailToAdd);
      setSubscribers([...subscribers, emailToAdd]);
      setCurrentEmail('');
      setError(null);
    } catch (error) {
      setError('Failed to add subscriber');
    }
  };

  const handleRemoveSubscriber = async (email: string) => {
    if (!user) return;

    try {
      await removeSubscriber(user.uid, email);
      setSubscribers(subscribers.filter(e => e !== email));
      setError(null);
    } catch (error) {
      setError('Failed to remove subscriber');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setSubscribers(newEmails);
      setUploadStatus(
        `Successfully uploaded ${newEmails.length} subscribers (${totalUnique} total unique subscribers)`
      );
      setError(null);
    } catch (error: any) {
      setUploadStatus(error.message || 'Error processing CSV file');
      setError('Failed to upload CSV');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Audience Management</h1>
          <p className={styles.subtitle}>
            Manage your email subscribers and mailing lists
          </p>
        </div>

        {subscribers.length > 0 && (
          <div className={styles.recipientList}>
            {subscribers.map((email, index) => (
              <div key={index} className={styles.recipientChip}>
                <span className="truncate max-w-[300px]">{email}</span>
                <button
                  onClick={() => handleRemoveSubscriber(email)}
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
            type="email"
            placeholder="Enter email address and press Enter..."
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSubscriber();
              }
            }}
          />
          <Button
            onClick={handleAddSubscriber}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 h-[calc(100%-16px)]"
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
            />
            <Upload className="w-6 h-6 text-zinc-400" />
            <p className="text-sm text-zinc-400 mt-2">
              {csvFile ? csvFile.name : 'Click/drag to upload a CSV file of your subscribers'}
            </p>
            {uploadStatus && (
              <p className={`text-sm mt-2 ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {uploadStatus}
              </p>
            )}
          </label>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-4">
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default AudiencePage; 