export interface BrandTheme {
  id: string;
  userId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  logoUrl?: string;
  websiteUrl?: string;
  unsubscribeUrl?: string;
  socialMediaUrls?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandThemeContextType {
  currentTheme: BrandTheme | null;
  setCurrentTheme: (theme: BrandTheme | null) => void;
  themes: BrandTheme[];
  setThemes: (themes: BrandTheme[]) => void;
  saveTheme: (theme: BrandTheme) => Promise<void>;
  isLoading: boolean;
}
