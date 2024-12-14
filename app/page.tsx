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
    p-4
    pb-0
    gap-16 
    font-[var(--font-geist-sans)] 
    bg-zinc-900
    overflow-hidden
    text-zinc-200
    relative
    `,

  main: `
    flex
    h-[calc(100vh-180px)]
    gap-4
    items-start
    w-full
    max-w-[1920px]
    mt-4
    `,

  middleColumn: `
    w-full
    rounded-lg
    p-4
    h-full
    overflow-y-auto`,

  leftColumn: `
    max-w-[500px]
    w-full
    bg-zinc-800/50
    rounded-[10px]
    h-full
    overflow-y-auto
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
      <NewsletterForm />
      <main className={styles.main}>
        <div className={styles.leftColumn}>
          <ChatContainer />
        </div>
        <div className={styles.middleColumn}>
          <NewsletterPreview />
        </div>
      </main>
    </div>
  );
};

export default Home;