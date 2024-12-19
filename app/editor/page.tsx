'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../../components/Header';
import ChatContainer from '../../components/ChatContainer';
import StepsIndicator, { NewsletterStep } from '../../components/steps/StepsIndicator';
import MainContent from '../../components/steps/MainContent';
import { NewsletterProvider, useNewsletter } from '@/context/NewsletterContext';

const styles = {
  container: `
    flex
    flex-col
    h-screen
    overflow-hidden
    font-[var(--font-geist-sans)] 
    bg-zinc-900
    text-zinc-200
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
    border-zinc-700/50
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
    border-zinc-700/50
    rounded-[12px]
    `
};

const NewsletterEditor = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { currentStep, setCurrentStep } = useNewsletter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

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
          <ChatContainer />
        </div>
      </main>
    </div>
  );
};


const Home: React.FC = () => {
  return (
    <NewsletterProvider>
      <NewsletterEditor />
    </NewsletterProvider>
  );
};

export default Home;