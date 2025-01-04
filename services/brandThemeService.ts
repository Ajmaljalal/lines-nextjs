import { db } from '@/config/firebase';
import { BrandTheme } from '@/types/BrandTheme';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

const COLLECTION_NAME = 'brand-themes';

export const brandThemeService = {
  async saveBrandTheme(theme: BrandTheme): Promise<void> {
    const themeRef = doc(db, COLLECTION_NAME, theme.id);
    await setDoc(themeRef, {
      ...theme,
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
    });
  },

  async getBrandThemes(userId: string): Promise<BrandTheme[]> {
    const themesQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(themesQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: new Date(doc.data().createdAt),
      updatedAt: new Date(doc.data().updatedAt),
    })) as BrandTheme[];
  },
}; 