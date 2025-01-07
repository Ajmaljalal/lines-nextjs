'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../../components/layouts/Header';
import ChatContainer from '../../components/layouts/ChatContainer';
import StepsIndicator, { NewsletterStep } from '../../components/steps/StepsIndicator';
import MainContent from '../../components/steps/MainContent';
import { NewsletterProvider, useNewsletter } from '@/context/NewsletterContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useChat } from '@/hooks/useChat';
import { ChatProvider } from '@/context/ChatContext';

const styles = {
  container: `
    flex
    flex-col
    h-screen
    overflow-hidden
    font-[var(--font-geist-sans)] 
    bg-background
    text-foreground
    transition-colors
    duration-200
    `,

  main: `
    flex
    h-[calc(100vh-80px)]
    gap-4
    p-4
    w-full
    max-w-[1920px]
    mx-auto
    mt-20
    overflow-hidden
    `,

  leftColumn: `
    border
    border-border-color
    rounded-[12px]
    `,

  middleColumn: `
    flex-1
    overflow-scroll
    `,

  rightColumn: `
    w-[350px]
    min-w-[350px]
    border
    border-border-color
    rounded-[12px]
    `
};

const NewsletterEditor = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get('id');
  const { currentStep, setCurrentStep, updateData } = useNewsletter();
  const { messages, isSending, sendMessage } = useChat();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const loadNewsletter = async () => {
      if (!newsletterId) {
        router.push('/');
        return;
      }

      try {
        const newsletterRef = doc(db, 'newsletters', newsletterId);
        const newsletterDoc = await getDoc(newsletterRef);

        if (newsletterDoc.exists()) {
          const newsletterData = newsletterDoc.data();

          // Only allow access if the user owns the newsletter
          if (newsletterData.userId !== user.uid) {
            console.error('Unauthorized access');
            router.push('/');
            return;
          }

          updateData({
            id: newsletterData.id,
            userId: newsletterData.userId,
            topic: newsletterData.topic || '',
            userProvidedContent: newsletterData.userProvidedContent || '',
            urls: newsletterData.urls || [],
            style: newsletterData.style || '',
            generatedContent: newsletterData.generatedContent,
            htmlContent: newsletterData.htmlContent,
            recipients: newsletterData.recipients,
            subject: newsletterData.subject,
            fromEmail: newsletterData.fromEmail,
            senderName: newsletterData.senderName,
            status: newsletterData.status,
            createdAt: newsletterData.createdAt,
            updatedAt: newsletterData.updatedAt,
          });
        }
        // If document doesn't exist, continue with empty state
      } catch (error) {
        console.error('Error loading newsletter:', error);
        router.push('/');
      }
    };

    loadNewsletter();
  }, [user, newsletterId]);

  if (!user) return null;

  const handleStepClick = (step: NewsletterStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = () => {
    const steps = [
      NewsletterStep.TOPIC,
      NewsletterStep.CONTENT,
      NewsletterStep.DESIGN,
      NewsletterStep.SEND,
    ];

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <StepsIndicator onStepClick={handleStepClick} />
        </div>
        <div className={styles.middleColumn}>
          <MainContent onStepComplete={handleStepComplete} />
        </div>
        <div className={styles.rightColumn}>
          <ChatContainer
            messages={messages}
            isSending={isSending}
            onSendMessage={sendMessage}
            isDisabled={false}
          />
        </div>
      </main>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <NewsletterProvider>
      <ChatProvider>
        <NewsletterEditor />
      </ChatProvider>
    </NewsletterProvider>
  );
};

export default Home;