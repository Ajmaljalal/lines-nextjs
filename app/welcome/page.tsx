// app/welcome/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import WelcomeMessage from '@/components/WelcomeMessage';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const WelcomePage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleExampleClick = (query: string) => {
    router.push(`/editor?topic=${encodeURIComponent(query)}`);
  };

  const handleStartNew = () => {
    router.push('/editor');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-900">
      <WelcomeMessage
        handleExampleClick={handleExampleClick}
        onStartNew={handleStartNew}
      />
    </div>
  );
};

export default WelcomePage;