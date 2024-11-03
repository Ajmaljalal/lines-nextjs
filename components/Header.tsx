'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';
const Header: React.FC = () => {
  const [user, setUser] = useState<{ picture?: string }>({});
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    // Fetch user info from API
    fetch('/api/get-user-info')
      .then(response => response.json())
      .then(userData => {
        setUser(userData);
      })
      .catch(error => console.error('Error fetching user info:', error));
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <header className="w-full max-w-6xl fixed top-0 z-50 bg-zinc-900 p-4">
      <div className="flex justify-between items-center">
        <div className="text-3xl text-white font-thin">LINES</div>
        <div className="user-menu">
          <div className="avatar-container" onClick={toggleDropdown}>
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={user.picture || ''} alt="User Avatar" />
              <AvatarFallback className="bg-zinc-700 text-zinc-200">
                U
              </AvatarFallback>
            </Avatar>
            {dropdownVisible && (
              <DropdownMenu>
                <DropdownMenuContent>
                  <DropdownMenuItem className="text-zinc-200 hover:bg-zinc-700">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;