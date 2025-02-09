'use client';

import Header from '@/components/layouts/Header';
import UnderConstruction from '@/components/layouts/UnderConstruction';
import { useAuth } from '@/context/AuthContext';
import { getEmailStats } from '@/services/getEmailStats';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  // getEmailStats('messageId').then((stats) => {
  //   console.log(stats);
  // });

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent backdrop-blur-[200px]">
      <Header />
      <UnderConstruction />
    </div>
  );
};

export default AnalyticsPage; 