'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '../components/Header';
import ChatContainer from '../components/ChatContainer';
import InputContainer from '../components/InputContainer';

const styles = {
  container: `
  flex
  flex-col
  items-center 
  justify-items-center 
  min-h-screen
  p-4 
  gap-16 
  font-[var(--font-geist-sans)] 
  bg-zinc-900
  overflow-hidden
  text-zinc-200`,

  main: `
  flex
  flex-col
  flex-grow
  gap-8
  items-center
  w-full
  max-w-6xl
  `
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
        <ChatContainer />
      </main>
      <InputContainer />
    </div>
  );
};

export default Home;