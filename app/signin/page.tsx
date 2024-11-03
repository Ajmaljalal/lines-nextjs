import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center">
      <div className="text-center space-y-10">
        <h1 className="text-4xl font-thin tracking-wider text-white ">LINES</h1>
        <p className="text-lg text-slate-400 max-w-[600px]">
          Your assistant in generating and sending beautifully designed emails & newsletters.
        </p>

        <div className="mt-8">
          <Button
            asChild
            variant="default"
            className="px-8 py-2 text-slate-800 bg-white rounded-[8px] hover:bg-white/80"
          >
            <Link href="/google-signin">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 