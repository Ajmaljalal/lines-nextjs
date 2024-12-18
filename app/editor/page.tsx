'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../../components/Header';
import ChatContainer from '../../components/ChatContainer';
import StepsIndicator, { NewsletterStep } from '../../components/StepsIndicator';
import MainContent from '../../components/MainContent';
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
    w-[220px]
    min-w-[220px]
    border
    border-zinc-700/50
    rounded-[12px]
    `,

  middleColumn: `
    flex-1
    min-w-0
    `,

  rightColumn: `
    w-[350px]
    min-w-[350px]
    border
    border-zinc-700/50
    rounded-[12px]
    `
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<NewsletterStep>(NewsletterStep.TOPIC);

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
          <StepsIndicator currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
        <div className={styles.middleColumn}>
          <MainContent currentStep={currentStep} onStepComplete={handleStepComplete} />
        </div>
        <div className={styles.rightColumn}>
          <ChatContainer />
        </div>
      </main>
    </div>
  );
};

export default Home;