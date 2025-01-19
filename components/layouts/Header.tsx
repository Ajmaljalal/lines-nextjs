'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../core-ui-components/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../core-ui-components/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, LogOut, Palette } from 'lucide-react';
import { useBrandTheme } from '@/context/BrandThemeContext';
import UserCredits from '../UserCredits';
import { Button } from '../core-ui-components/button';
import { BrandThemeModal } from '../brand-theme/BrandThemeModal';

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
    border-border-color
  `,

  titleContainer: `
    flex
    justify-between
    items-center
  `,

  title: `
    text-3xl
    text-[var(--primary-color)]
    font-bold
    flex
    items-center
    gap-2
    cursor-pointer
    hover:opacity-90
    transition-opacity
  `,

  navigation: `
    flex
    gap-1
    bg-muted
    p-1
    rounded-lg
  `,

  navItem: `
    px-4
    py-2
    rounded-md
    text-sm
    font-medium
    cursor-pointer
    transition-all
    duration-200
    hover:bg-background/80
    hover:text-foreground
    hover:shadow-sm
  `,

  navItemActive: `
    bg-background
    text-foreground
    shadow-sm
  `,

  navItemInactive: `
    text-muted-foreground
  `,

  userMenu: `
    relative
  `,

  avatarContainer: `
    cursor-pointer
    hover:opacity-80
    transition-opacity
  `,

  avatarFallback: `
    bg-muted
    text-muted-foreground
  `,

  dropdownContent: `
    bg-background
    p-1
  `,

  dropdownItem: `
    flex
    bg-background
    items-center
    gap-2
    text-sm
    text-foreground
    cursor-pointer
    hover:bg-muted
    focus:bg-muted
    rounded-[8px]
    transition-all
    duration-200
    px-3
    py-2
    outline-none
  `,

  dropdownSeparator: `
    bg-zinc-800
    my-1
  `
};

const SendIcon = memo(() => (
  <Image
    src="/images/send-purple.png"
    alt="SendLines Logo"
    width={28}
    height={28}
    className="object-contain"
  />
));
SendIcon.displayName = 'SendIcon';

// Memoized navigation button to prevent re-renders
const NavButton = memo(({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`${styles.navItem} ${isActive ? styles.navItemActive : styles.navItemInactive}`}
  >
    {children}
  </button>
));
NavButton.displayName = 'NavButton';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTheme } = useBrandTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [showBrandThemeModal, setShowBrandThemeModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleProfileClick = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const toggleBrandThemeModal = useCallback((value: boolean) => {
    setShowBrandThemeModal(value);
  }, []);

  if (!user) return null;

  return (
    <header className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title} onClick={() => handleNavigation('/')}>
          <SendIcon />
          SendLines
          <span className="text-xs text-primary py-1 font-medium ml-[-2px] mb-[10px]">
            Beta
          </span>
        </div>

        <div className={styles.navigation}>
          <NavButton
            isActive={pathname === '/'}
            onClick={() => handleNavigation('/')}
          >
            Dashboard
          </NavButton>
          <NavButton
            isActive={pathname === '/analytics'}
            onClick={() => handleNavigation('/analytics')}
          >
            Analytics
          </NavButton>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => toggleBrandThemeModal(true)}
            className="flex items-center gap-2 bg-muted hover:bg-background text-sm font-medium h-9 px-4"
          >
            <Palette className="w-4 h-4 text-muted-foreground" />
            {currentTheme ? (
              <span className="text-foreground">
                <span className="text-muted-foreground">Edit Brand and Theme</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select your Brand and Theme</span>
            )}
          </Button>
          <UserCredits />
          <div className={styles.userMenu}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className={styles.avatarContainer}>
                  <AvatarImage src={user.photoURL || ''} alt="User Avatar" />
                  <AvatarFallback className={styles.avatarFallback}>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={styles.dropdownContent} align="end">
                <DropdownMenuItem className={styles.dropdownItem} onClick={handleProfileClick}>
                  <User size={16} />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className={styles.dropdownItem} onClick={handleSettingsClick}>
                  <Settings size={16} />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className={styles.dropdownSeparator} />
                <DropdownMenuItem className={styles.dropdownItem} onClick={logout}>
                  <LogOut size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <BrandThemeModal isOpen={showBrandThemeModal} onClose={() => toggleBrandThemeModal(false)} />
    </header>
  );
};

export default memo(Header);