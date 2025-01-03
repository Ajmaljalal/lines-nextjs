'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../core-ui-components/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../core-ui-components/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import UserCredits from '../UserCredits';

const styles = {
  container: `
    w-full
    fixed
    top-0
    z-50
    bg-background
    px-8
    py-4
    border-b
    border-border-color
    transition-colors
    duration-200
  `,

  titleContainer: `
    flex
    justify-between
    items-center
  `,

  title: `
    text-3xl
    text-foreground
    font-bold
    flex
    items-center
    gap-2
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
    transition-colors
    duration-200
    hover:bg-background
  `,

  navItemActive: `
    bg-background
    text-foreground
  `,

  navItemInactive: `
    text-muted-foreground
    hover:text-foreground
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
    transition-colors
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

const SendIcon = () => (
  <Image
    src="/images/send-orange.png"
    alt="SendLines Logo"
    width={28}
    height={28}
    className="object-contain"
  />
);

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener('click', closeDropdown);
    } else {
      document.removeEventListener('click', closeDropdown);
    }

    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, [dropdownVisible]);

  if (!user) return null;

  return (
    <header className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>
          <SendIcon />
          SendLines
        </div>

        <div className={styles.navigation}>
          <button
            onClick={() => handleNavigation('/')}
            className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : styles.navItemInactive
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavigation('/analytics')}
            className={`${styles.navItem} ${pathname === '/analytics' ? styles.navItemActive : styles.navItemInactive
              }`}
          >
            Analytics
          </button>
        </div>

        <div className="flex items-center gap-4">
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
    </header>
  );
};

export default Header;