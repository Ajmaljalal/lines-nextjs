import React, { memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';

const styles = {
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
};

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

const NavigationBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.navigation}>
      <NavButton
        isActive={pathname === '/'}
        onClick={() => handleNavigation('/')}
      >
        Dashboard
      </NavButton>
      <NavButton
        isActive={pathname === '/audience'}
        onClick={() => handleNavigation('/audience')}
      >
        Audience
      </NavButton>
      <NavButton
        isActive={pathname === '/analytics'}
        onClick={() => handleNavigation('/analytics')}
      >
        Analytics
      </NavButton>
    </div>
  );
};

export default memo(NavigationBar); 