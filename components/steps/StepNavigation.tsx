import React, { useState, useEffect } from 'react';
import { Button } from '../core-ui-components/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContent } from '@/context/ContentContext';
import { EmailCreationStep } from './StepsIndicator';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { X, Loader2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../core-ui-components/dialog';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { emailTemplateService } from '@/services/emailTemplateService';

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
  step: EmailCreationStep;
}

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTest: (emails: string[]) => Promise<void>;
  isTestSending: boolean;
}

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
  initialName?: string;
  isUpdate?: boolean;
}

const TestEmailModal: React.FC<TestEmailModalProps> = ({
  isOpen,
  onClose,
  onSendTest,
  isTestSending
}) => {
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = () => {
    if (!currentEmail.trim()) return;

    const emailToAdd = currentEmail.trim();
    if (!isValidEmail(emailToAdd)) {
      setError('Please enter a valid email address');
      return;
    }

    if (testEmails.includes(emailToAdd)) {
      setError('Email already added');
      return;
    }

    if (testEmails.length >= 5) {
      setError('Maximum 5 test emails allowed');
      return;
    }

    setTestEmails([...testEmails, emailToAdd]);
    setCurrentEmail('');
    setError(null);
  };

  const removeEmail = (emailToRemove: string) => {
    setTestEmails(testEmails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = async () => {
    if (testEmails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    try {
      await onSendTest(testEmails);
      setTestEmails([]);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send test email');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {testEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {testEmails.map((email, index) => (
                <div key={index} className="bg-muted text-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span className="truncate max-w-[300px]">{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-muted-foreground hover:text-foreground"
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
              placeholder="Enter email addresses and press Enter or Add..."
              value={currentEmail}
              onChange={(e) => {
                setCurrentEmail(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            <Button
              type="button"
              onClick={addEmail}
              className="absolute right-[8px] top-1/2 -translate-y-1/2 h-[calc(100%-16px)] min-w-[50px] text-xs px-2.5 bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-[8px]"
              disabled={testEmails.length >= 5}
            >
              Add
            </Button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isTestSending || testEmails.length === 0}
            className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-[8px]"
          >
            {isTestSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  initialName = '',
  isUpdate = false
}) => {
  const [templateName, setTemplateName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTemplateName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    try {
      await onSave(templateName.trim());
      if (!isUpdate) {
        setTemplateName('');
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save template');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update Template' : 'Save as Template'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="Enter template name..."
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  setError(null);
                }}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white rounded-[8px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUpdate ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              isUpdate ? 'Update Template' : 'Save Template'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  isLoading,
  step
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailId = searchParams.get('id');
  const { data, updateData, validateStep } = useContent();
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEmailSent = data.status === 'sent';
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState<string>('');

  const saveEmail = async (status: 'draft' | 'sent') => {
    if (!user || !emailId) return;

    setIsSaving(true);
    // Clean the data by removing undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const email = {
      ...cleanData,
      id: emailId,
      userId: user.uid,
      status,
      updatedAt: new Date()
    };

    try {
      const emailRef = doc(db, 'emails', emailId);
      await setDoc(emailRef, email, { merge: true });
    } catch (error) {
      console.error('Error saving email:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const sendEmail = async () => {
    if (!user || !emailId) return;
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
          subscribers: data.recipients,
          userId: user.uid,
          replyToEmail: data.replyToEmail
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to send newsletter');
      }

      await saveEmail('sent');
      router.push('/'); // Redirect to home after successful send
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send newsletter');
      console.error('Send newsletter error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendTestEmail = async (testEmails: string[]) => {
    if (!user || !emailId) return;
    try {
      setIsTestSending(true);
      setError(null);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `[TEST] ${data.subject}`,
          senderName: data.senderName,
          fromEmail: data.fromEmail,
          htmlContent: data.htmlContent,
          subscribers: testEmails,
          userId: user.uid,
          replyToEmail: data.replyToEmail
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to send test email');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send test email');
      console.error('Send test email error:', error);
      throw error;
    } finally {
      setIsTestSending(false);
    }
  };

  const saveTemplateIdToEmail = async (templateId: string) => {
    if (!emailId) return;

    const emailRef = doc(db, 'emails', emailId);
    await setDoc(emailRef, {
      templateId,
      updatedAt: new Date()
    }, { merge: true });
  };

  const handleSaveTemplate = async (name: string) => {
    if (!user || !data.htmlContent) return;

    try {
      setIsSavingTemplate(true);
      if (data.templateId) {
        // Only update the template, don't touch the email document
        await emailTemplateService.updateTemplate(data.templateId, name, data.htmlContent);
      } else {
        // Save new template and update both email document and content state
        const templateId = await emailTemplateService.saveTemplate(user.uid, name, data.htmlContent);
        await saveTemplateIdToEmail(templateId);
        updateData({ templateId });
      }
      setTemplateName(name);
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
      throw error;
    } finally {
      setIsSavingTemplate(false);
    }
  };

  useEffect(() => {
    if (data.templateId) {
      emailTemplateService.getTemplate(data.templateId).then(template => {
        if (template) {
          setTemplateName(template.name);
        }
      });
    }
  }, [data.templateId]);

  const handleNext = async () => {
    if (step === EmailCreationStep.SEND && validateStep(step)) {
      await sendEmail();
    } else {
      onNext();
    }
  };

  const buttonText = step === EmailCreationStep.SEND ? 'Send' : 'Next';

  if (isEmailSent) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-[8px] text-sm border border-green-300 shadow-lg">
        Email has already been sent
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

        <Button
          onClick={() => router.back()}
          className={`${styles.button} ${styles.backButton}`}
        >
          Cancel
        </Button>

        <Button
          onClick={() => saveEmail('draft')}
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

        {step === EmailCreationStep.DESIGN && (
          <Button
            onClick={() => setShowSaveTemplateModal(true)}
            disabled={isSavingTemplate}
            className={`${styles.button} ${styles.backButton}`}
          >
            {data.templateId ? 'Update Template' : 'Save as Template'}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {step === EmailCreationStep.SEND && (
          <Button
            onClick={() => setShowTestEmailModal(true)}
            className={`${styles.button} bg-gray-100 hover:bg-gray-200`}
            disabled={!validateStep(step)}
          >
            Test Send
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!validateStep(step) || isSending || isSaving}
          className={`${styles.button} ${styles.nextButton} ${(isSending || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <TestEmailModal
        isOpen={showTestEmailModal}
        onClose={() => setShowTestEmailModal(false)}
        onSendTest={sendTestEmail}
        isTestSending={isTestSending}
      />
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
        isSaving={isSavingTemplate}
        initialName={templateName}
        isUpdate={!!data.templateId}
      />
    </div>
  );
};

export default StepNavigation; 