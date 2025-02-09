'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../core-ui-components/dialog';
import { Label } from '../core-ui-components/label';
import { Input } from '../core-ui-components/input';
import { Button } from '../core-ui-components/button';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { BrandTheme } from '@/types/BrandTheme';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';

const colorPickerStyles = {
  input: 'p-0 border border-2 border-gray-300 w-full h-10 cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch-wrapper]:w-full [&::-webkit-color-swatch-wrapper]:h-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:w-full [&::-webkit-color-swatch]:h-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:w-full [&::-moz-color-swatch]:h-full',
}

interface BrandThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandThemeModal: React.FC<BrandThemeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { currentTheme, saveTheme, setCurrentTheme } = useBrandTheme();
  const [name, setName] = useState(currentTheme?.name || '');
  const [primaryColor, setPrimaryColor] = useState(currentTheme?.primaryColor || '#FF5722');
  const [secondaryColor, setSecondaryColor] = useState(currentTheme?.secondaryColor || '#FF8A65');
  const [accentColor, setAccentColor] = useState(currentTheme?.accentColor || '#FFA000');
  const [textColor, setTextColor] = useState(currentTheme?.textColor || '#1F2937');
  const [backgroundColor, setBackgroundColor] = useState(currentTheme?.backgroundColor || '#FFFFFF');
  const [logoUrl, setLogoUrl] = useState(currentTheme?.logoUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(currentTheme?.websiteUrl || '');
  const [unsubscribeUrl, setUnsubscribeUrl] = useState(currentTheme?.unsubscribeUrl || '');
  const [socialMediaUrls, setSocialMediaUrls] = useState(currentTheme?.socialMediaUrls || {
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentTheme?.name || '');
      setPrimaryColor(currentTheme?.primaryColor || '#FF5722');
      setSecondaryColor(currentTheme?.secondaryColor || '#FF8A65');
      setAccentColor(currentTheme?.accentColor || '#FFA000');
      setTextColor(currentTheme?.textColor || '#1F2937');
      setBackgroundColor(currentTheme?.backgroundColor || '#FFFFFF');
      setLogoUrl(currentTheme?.logoUrl || '');
      setWebsiteUrl(currentTheme?.websiteUrl || '');
      setUnsubscribeUrl(currentTheme?.unsubscribeUrl || '');
      setSocialMediaUrls(currentTheme?.socialMediaUrls || {
        twitter: '',
        facebook: '',
        linkedin: '',
        instagram: '',
      });
    }
  }, [isOpen, currentTheme]);

  const handleSocialMediaChange = (platform: keyof typeof socialMediaUrls, value: string) => {
    setSocialMediaUrls(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const theme: BrandTheme = {
        id: currentTheme?.id || uuidv4(),
        userId: user.uid,
        name,
        primaryColor,
        secondaryColor,
        accentColor,
        textColor,
        backgroundColor,
        logoUrl,
        websiteUrl,
        unsubscribeUrl,
        socialMediaUrls,
        createdAt: currentTheme?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await saveTheme(theme);
      setCurrentTheme(theme);
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background max-h-[90vh] flex flex-col ">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">{currentTheme ? 'Edit Brand Theme' : 'Create Brand Theme'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-sm font-medium">Name</Label>
            <div className="col-span-3 flex gap-2 items-center">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Colors Section */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="primaryColor" className="text-right text-sm font-medium">Primary Color</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className={colorPickerStyles.input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="secondaryColor" className="text-right text-sm font-medium">Secondary Color</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className={colorPickerStyles.input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accentColor" className="text-right text-sm font-medium">Accent Color</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className={colorPickerStyles.input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="textColor" className="text-right text-sm font-medium">Text Color</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className={colorPickerStyles.input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="backgroundColor" className="text-right text-sm font-medium">Background</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className={colorPickerStyles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* URLs Section */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logoUrl" className="text-right text-sm font-medium">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="websiteUrl" className="text-right text-sm font-medium">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unsubscribeUrl" className="text-right text-sm font-medium">Unsubscribe URL</Label>
                <Input
                  id="unsubscribeUrl"
                  value={unsubscribeUrl}
                  onChange={(e) => setUnsubscribeUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://example.com/unsubscribe"
                />
              </div>

              {/* Social Media URLs */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="twitter" className="text-right text-sm font-medium">X URL</Label>
                <Input
                  id="twitter"
                  value={socialMediaUrls.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  className="col-span-3"
                  placeholder="https://x.com/username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="facebook" className="text-right text-sm font-medium">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={socialMediaUrls.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  className="col-span-3"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkedin" className="text-right text-sm font-medium">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={socialMediaUrls.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  className="col-span-3"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instagram" className="text-right text-sm font-medium">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={socialMediaUrls.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  className="col-span-3"
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[12px] bg-[var(--primary-color)] hover:bg-[var(--secondary-color)] text-white text-sm font-medium px-4 py-2 h-9"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 