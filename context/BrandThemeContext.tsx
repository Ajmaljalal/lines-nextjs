'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandTheme, BrandThemeContextType } from '@/types/BrandTheme';
import { useAuth } from './AuthContext';
import { brandThemeService } from '@/services/brandThemeService';

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

export const BrandThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<BrandTheme | null>(null);
  const [themes, setThemes] = useState<BrandTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemes = async () => {
      if (user) {
        try {
          const loadedThemes = await brandThemeService.getBrandThemes(user.uid);
          setThemes(loadedThemes);
          // Set the first theme as current if there's no current theme
          if (loadedThemes.length > 0 && !currentTheme) {
            setCurrentTheme(loadedThemes[0]);
          }
        } catch (error) {
          console.error('Error loading brand themes:', error);
        }
      }
      setIsLoading(false);
    };

    loadThemes();
  }, [user]);

  const saveTheme = async (theme: BrandTheme) => {
    try {
      await brandThemeService.saveBrandTheme(theme);
      if (currentTheme?.id === theme.id) {
        setCurrentTheme(theme);
      }
      setThemes(prevThemes => {
        const index = prevThemes.findIndex(t => t.id === theme.id);
        if (index >= 0) {
          return [...prevThemes.slice(0, index), theme, ...prevThemes.slice(index + 1)];
        }
        return [...prevThemes, theme];
      });
    } catch (error) {
      console.error('Error saving brand theme:', error);
      throw error;
    }
  };

  return (
    <BrandThemeContext.Provider value={{
      currentTheme,
      setCurrentTheme,
      themes,
      setThemes,
      saveTheme,
      isLoading,
    }}>
      {children}
    </BrandThemeContext.Provider>
  );
};

export const useBrandTheme = () => {
  const context = useContext(BrandThemeContext);
  if (context === undefined) {
    throw new Error('useBrandTheme must be used within a BrandThemeProvider');
  }
  return context;
}; 