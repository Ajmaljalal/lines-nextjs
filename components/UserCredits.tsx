'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Spinner } from './core-ui-components/spinner';
import { Badge } from './core-ui-components/badge';

interface UserCredits {
  userId: string;
  totalCredits: number;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserCredits: React.FC = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const creditsRef = doc(db, 'user-credits', user.uid);

    const unsubscribe = onSnapshot(
      creditsRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Omit<UserCredits, 'createdAt' | 'updatedAt'> & {
            createdAt: any;
            updatedAt: any;
          };
          setCredits({
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          });
        } else {
          setError('Credits data not found.');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user credits:', err);
        setError('Failed to load credits.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <Spinner size="small" />;
  }

  if (error || !credits) {
    return <div className="text-red-500 text-sm"> 0 Credits</div>;
  }

  const remainingCredits = credits.totalCredits - credits.creditsUsed;

  return (
    <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
      <Badge variant="success">
        <span>💰 {remainingCredits} Credits</span>
      </Badge>
      <span className="text-xs text-foreground">
        Used: {credits.creditsUsed} / {credits.totalCredits}
      </span>
    </div>
  );
};

export default UserCredits; 