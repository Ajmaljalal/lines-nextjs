'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../components/Header';
import ChatContainer from '../components/ChatContainer';
import NewsletterForm from '../components/NewsletterForm';
import NewsletterPreview from '../components/NewsletterPreview';

const styles = {
  container: `
    flex
    flex-col
    items-center 
    min-h-screen
    p-4
    pb-0
    gap-16 
    font-[var(--font-geist-sans)] 
    bg-zinc-900
    overflow-hidden
    text-zinc-200`,

  main: `
    flex
    gap-4
    items-start
    w-full
    max-w-[1920px]
    mt-20`,

  middleColumn: `
    w-full
    rounded-lg
    p-4
    h-[calc(100vh-180px)]
    overflow-y-auto`,

  rightColumn: `
    w-1/6
    min-w-[400px]
    bg-zinc-800/50
    rounded-lg
    h-[calc(100vh-180px)]
    overflow-hidden
    flex
    flex-col`
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <NewsletterForm />
        <div className={styles.middleColumn}>
          <NewsletterPreview />
        </div>
        <div className={styles.rightColumn}>
          <ChatContainer />
        </div>
      </main>
    </div>
  );
};

export default Home;