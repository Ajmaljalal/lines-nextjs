'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const styles = {
  container: `
  min-h-screen
  bg-zinc-900
  flex
  flex-col
  items-center
  justify-center`,

  title: `
  text-4xl
  font-bold
  tracking-wider
  text-white`,

  subtitle: `
  text-lg
  text-slate-400
  max-w-[600px]`
};

const SignIn: React.FC = () => {
  const { signInWithGoogle, error } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className={styles.container}>
      <div className="text-center space-y-10">
        <h1 className={styles.title}>LINES</h1>
        <p className={styles.subtitle}>
          Your assistant in generating and sending beautifully designed emails & newsletters.
        </p>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleSignIn}
            variant="default"
            className="px-8 py-2 text-slate-800 bg-white rounded-[8px] hover:bg-white/80"
          >
            Sign in with Google
          </Button>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn; 