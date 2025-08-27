'use client'

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../../components/layouts/Header';
import ChatContainer from '../../components/layouts/ChatContainer';
import StepsIndicator, { EmailCreationStep } from '../../components/steps/StepsIndicator';
import MainContent from '../../components/steps/MainContent';
import { ContentProvider, useContent } from '@/context/ContentContext';
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
    bg-transparent
    backdrop-blur-[200px]
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
    border-gray-300
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
    border-gray-300
    rounded-[12px]
    `
};

const ContentEditor = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  const contentType = searchParams.get('type') as 'marketing' || 'marketing';
  const { currentStep, setCurrentStep, updateData, data } = useContent();
  const { messages, isSending, sendMessage } = useChat();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const loadContent = async () => {
      if (!contentId) {
        router.push('/');
        return;
      }

      try {
        const contentRef = doc(db, 'emails', contentId);
        const contentDoc = await getDoc(contentRef);

        if (contentDoc.exists()) {
          const contentData = contentDoc.data();

          // Only allow access if the user owns the content
          if (contentData.userId !== user.uid) {
            console.error('Unauthorized access');
            router.push('/');
            return;
          }

          updateData({
            id: contentData.id,
            userId: contentData.userId,
            topic: contentData.topic || '',
            contentType: contentData.contentType || contentType,
            userProvidedContent: contentData.userProvidedContent || '',
            urls: contentData.urls || [],
            style: contentData.style || '',
            generatedContent: contentData.generatedContent,
            htmlContent: contentData.htmlContent,
            dataCollectionCompleted: Boolean(contentData.generatedContent),
            recipients: contentData.recipients,
            subject: contentData.subject,
            fromEmail: contentData.fromEmail,
            senderName: contentData.senderName,
            replyToEmail: contentData.replyToEmail,
            status: contentData.status,
            templateId: contentData.templateId,
            createdAt: contentData.createdAt,
            updatedAt: contentData.updatedAt,
          });
        } else {
          // Initialize with content type for new content
          updateData({
            id: contentId,
            userId: user.uid,
            contentType: contentType,
            topic: '',
            userProvidedContent: '',
            urls: [],
            style: '',
            dataCollectionCompleted: false,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading content:', error);
        router.push('/');
      }
    };

    loadContent();
  }, [user, contentId]);

  if (!user) return null;

  const handleStepClick = (step: EmailCreationStep) => {
    setCurrentStep(step);
  };

  const handleStepComplete = () => {
    const steps = [
      EmailCreationStep.CONTENT,
      EmailCreationStep.DESIGN,
      EmailCreationStep.SEND,
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
            isDisabled={data.status === 'sent'}
          />
        </div>
      </main>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <ContentProvider>
      <ChatProvider>
        <ContentEditor />
      </ChatProvider>
    </ContentProvider>
  );
};

export default Home;