import React, { memo, useCallback, useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '../core-ui-components/button';
import { useBrandTheme } from '@/context/BrandThemeContext';
import { BrandThemeModal } from '../brand-theme/BrandThemeModal';

const BrandThemeButton = () => {
  const { currentTheme } = useBrandTheme();
  const [showBrandThemeModal, setShowBrandThemeModal] = useState(false);


  const toggleBrandThemeModal = useCallback((value: boolean) => {
    setShowBrandThemeModal(value);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-muted hover:bg-background text-sm font-medium h-9 px-4">
      <Button
        variant="ghost"
        onClick={() => toggleBrandThemeModal(true)}
        className="flex items-center gap-2 bg-muted hover:bg-background text-sm font-medium h-9 px-4"
      >
        <Palette className="w-4 h-4 text-muted-foreground" />
        {currentTheme ? (
          <span className="text-foreground">
            <span className="text-muted-foreground">Brand and Theme</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Brand and Theme</span>
        )}
      </Button>
      <BrandThemeModal isOpen={showBrandThemeModal} onClose={() => toggleBrandThemeModal(false)} />
    </div>
  );
};

export default memo(BrandThemeButton); 