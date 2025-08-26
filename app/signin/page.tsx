'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/core-ui-components/button';
import Image from 'next/image';
import { Spinner } from '@/components/core-ui-components/spinner';

const styles = {
  container: `
    w-full
    mx-auto
    flex
    flex-col
    items-center
    justify-center
    gap-8
    overflow-y-auto
    min-h-screen
    px-4
    bg-transparent
    backdrop-blur-[200px]
    relative
    z-10
    before:content-['']
    before:fixed
    before:top-0
    before:left-0
    before:w-full
    before:h-full
    before:-z-10
    before:bg-[linear-gradient(135deg,rgba(99,102,241,0.4),rgba(79,70,229,0.6))]
    before:opacity-95
  `,

  logoContainer: `
    mb-8
  `,

  title: `
    text-5xl
    font-bold
    text-foreground
    tracking-tight
  `,

  subtitle: `
    text-lg
    text-muted-foreground
    text-center
    max-w-2xl
  `,

  signInButton: `
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
    text-lg
    flex
    items-center
    gap-2
  `,

  errorText: `
    text-red-500
    text-sm
    mt-4
  `
};

const SignIn: React.FC = () => {
  const { signInWithGoogle, error, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/send-purple.png"
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
        onClick={handleSignIn}
        className={styles.signInButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner size="small" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign in with Google</span>
        )}
      </Button>

      {error && (
        <p className={styles.errorText}>
          {error}
        </p>
      )}
    </div>
  );
};

export default SignIn; 