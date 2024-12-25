'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../core-ui-components/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../core-ui-components/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '../core-ui-components/button';
import { User, Settings, LogOut } from 'lucide-react';

const styles = {
  container: `
  w-full
  fixed
  top-0
  z-50
  bg-zinc-900
  px-8
  py-4
  border-b
  border-zinc-800
  `,

  titleContainer: `
  flex
  justify-between
  items-center
  `,

  title: `
  text-3xl
  text-white
  font-bold
  flex
  items-center
  gap-2
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
  bg-zinc-700
  text-zinc-200
  `,

  dropdownContent: `
  bg-zinc-900
  border
  border-zinc-800
  p-1
  `,

  dropdownItem: `
  flex
  items-center
  gap-2
  text-sm
  text-zinc-200
  cursor-pointer
  hover:bg-zinc-800
  focus:bg-zinc-800
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
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, []);

  const handleProfileClick = () => {
    // TODO: Implement profile navigation
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    // TODO: Implement settings navigation
    router.push('/settings');
  };

  const toggleDropdown = () => {
    console.log('toggleDropdown');
    // e.stopPropagation();
    setDropdownVisible(!dropdownVisible);
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
        <div className={styles.userMenu}>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className={styles.avatarContainer}>
                  <AvatarImage src={user.photoURL || ''} alt="User Avatar" />
                  <AvatarFallback className={styles.avatarFallback}>
                    {user.displayName?.charAt(0)}
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