'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
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

  dropdownItem: `
  text-zinc-200
  cursor-pointer
  hover:bg-zinc-700
  `
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, []);

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

  console.log('toggleDropdown', dropdownVisible);

  return (
    <header className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>LINES</div>
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem className={styles.dropdownItem} onClick={logout}>
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