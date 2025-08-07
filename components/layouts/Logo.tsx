import React, { memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const styles = {
  title: `
    text-4xl
    text-[var(--primary-color)]
    font-bold
    flex
    items-center
    gap-2
    cursor-pointer
    hover:opacity-90
    transition-opacity
  `,
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

const Logo = () => {
  const router = useRouter();
  return (
    <div className={styles.title} onClick={() => router.push('/')}>
      <SendIcon />
      SendLines
      <span className="text-sm text-primary py-1 font-medium ml-[-2px] mb-[10px]">
        Beta
      </span>
    </div>
  );
};

export default memo(Logo); 