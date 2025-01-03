'use client';

import Header from '@/components/layouts/Header';
import UnderConstruction from '@/components/layouts/UnderConstruction';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SettingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <UnderConstruction />
    </div>
  );
};

export default SettingsPage; 