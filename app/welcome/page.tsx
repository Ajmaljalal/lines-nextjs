// app/welcome/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import WelcomeMessage from '@/components/layouts/WelcomeMessage';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Header from '@/components/layouts/Header';

const WelcomePage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleStartNew = () => {
    router.push('/editor');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="mt-20">
        <WelcomeMessage
          onStartNew={handleStartNew}
        />
      </div>
    </div>
  );
};

export default WelcomePage;