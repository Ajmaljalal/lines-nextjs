'use client';
import React, { useEffect, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NavigationBar from './NavigationBar';
import BrandThemeButton from './BrandThemeButton';
import UserCredits from '../UserCredits';
import ProfileDropdown from './ProfileDropdown';
import Logo from './Logo';

const styles = {
  container: `
    w-full
    fixed
    top-0
    z-100
    bg-transparent
    backdrop-blur
    px-8
    py-4
    border-b
    border-gray-300
  `,

  titleContainer: `
    flex
    justify-between
    items-center
  `,
};

const Header: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  return (
    <header className={styles.container}>
      <div className={styles.titleContainer}>
        <Logo />
        <NavigationBar />
        <div className="flex items-center gap-4">
          <BrandThemeButton />
          <UserCredits />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default memo(Header);