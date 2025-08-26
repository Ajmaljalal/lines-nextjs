import Image from 'next/image';
import { Button } from '../core-ui-components/button';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EmailTypeModal } from '../core-ui-components/email-type-modal';

const styles = {
  container: `
    w-full
    max-w-4xl
    mx-auto
    flex
    flex-col
    items-center
    justify-center
    gap-8
    overflow-y-auto
    min-h-[calc(100vh-80px)]
    px-4
  `,

  logoContainer: `
    mb-8
  `,

  title: `
    text-6xl
    font-bold
    text-foreground
    tracking-tight
  `,

  subtitle: `
    text-xl
    text-muted-foreground
    text-center
    max-w-2xl
  `,

  startNewButton: `
    mt-8
    px-8
    py-6
    bg-[var(--primary-color)]
    hover:bg-[var(--secondary-color)]
    transition-all
    duration-200
    rounded-[12px]
    text-white
    font-medium
    text-xl
    flex
    items-center
    gap-2
  `,
};

interface WelcomeMessageProps {
  onStartNew: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onStartNew }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleContentTypeSelect = async (type: 'marketing') => {
    const emailId = uuidv4();
    await onStartNew();
    router.push(`/editor?id=${emailId}&type=${type}`);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/send-orange.png"
          alt="SendLines Logo"
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
      <h1 className={styles.title}>Welcome to SendLines</h1>
      <h3 className={styles.subtitle}>
        Your intelligent assistant in crafting beautifully designed email campaigns.
      </h3>
      <Button
        onClick={() => setShowModal(true)}
        className={styles.startNewButton}
      >
        <span>Start writing</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12L10 8L6 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <EmailTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleContentTypeSelect}
      />
    </div>
  )
}

export default WelcomeMessage;