'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signOut, db } from '@/config/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ExtendedUser extends User {
  businessData?: Omit<DbUser, 'userId' | 'email' | 'name' | 'imageUrl' | 'phone'>;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mergeUserData = async (googleUser: User): Promise<ExtendedUser> => {
    try {
      const userRef = doc(db, 'users', googleUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user
        const userData: DbUser = {
          userId: googleUser.uid,
          name: googleUser.displayName || '',
          email: googleUser.email || '',
          businessName: null,
          businessType: null,
          emailType: null,
          imageUrl: googleUser.photoURL,
          phone: googleUser.phoneNumber,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(userRef, userData);

        // Create user credits
        const userCreditsRef = doc(db, 'user-credits', googleUser.uid);
        const userCreditsData = {
          userId: googleUser.uid,
          totalCredits: 10,
          creditsUsed: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(userCreditsRef, userCreditsData);

        return {
          ...googleUser,
          businessData: {
            businessName: null,
            businessType: null,
            emailType: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      } else {
        // Update existing user
        const dbUser = userDoc.data() as DbUser;
        await setDoc(
          userRef,
          {
            updatedAt: new Date(),
          },
          { merge: true }
        );

        return {
          ...googleUser,
          businessData: {
            businessName: dbUser.businessName,
            businessType: dbUser.businessType,
            emailType: dbUser.emailType,
            createdAt: dbUser.createdAt,
            updatedAt: new Date(),
          },
        };
      }
    } catch (error) {
      console.error('Error merging user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (googleUser) => {
      if (googleUser) {
        const mergedUser = await mergeUserData(googleUser);
        setUser(mergedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user) {
        throw new Error('No user data returned');
      }
      const mergedUser = await mergeUserData(result.user);
      setUser(mergedUser);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/configuration-not-found') {
        setError('Authentication configuration error. Please ensure Google Sign-in is enabled in Firebase Console.');
      } else {
        setError(error.message || 'Failed to sign in with Google');
      }
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message || 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);