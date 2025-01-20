import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../core-ui-components/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../core-ui-components/dropdown-menu';

const styles = {
  userMenu: `relative`,
  avatarContainer: `cursor-pointer hover:opacity-80 transition-opacity`,
  avatarFallback: `bg-muted text-muted-foreground`,
  dropdownContent: `bg-background p-1`,
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
  dropdownSeparator: `bg-zinc-800 my-1`
};

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  if (!user) return null;

  return (
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
  );
};

export default memo(ProfileDropdown); 