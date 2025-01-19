'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Mail, Newspaper } from 'lucide-react';

interface ContentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'newsletter' | 'marketing') => void;
}

const styles = {
  optionsContainer: `
    flex
    gap-4
    p-6
  `,
  option: `
    flex-1
    flex
    flex-col
    items-center
    gap-4
    p-6
    border
    border-border
    rounded-[12px]
    hover:border-[var(--primary-color)]
    hover:bg-muted/50
    cursor-pointer
    transition-all
    duration-200
  `,
  iconContainer: `
    w-12
    h-12
    rounded-full
    bg-[var(--primary-color)]
    text-white
    flex
    items-center
    justify-center
  `,
  title: `
    font-medium
    text-lg
  `,
  description: `
    text-sm
    text-muted-foreground
    text-center
  `
};

export const ContentTypeModal: React.FC<ContentTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[12px] overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">Choose Content Type</DialogTitle>
        </DialogHeader>
        <div className={styles.optionsContainer}>
          <button className={styles.option} onClick={() => onSelect('newsletter')}>
            <div className={styles.iconContainer}>
              <Newspaper className="w-6 h-6" />
            </div>
            <span className={styles.title}>Newsletter</span>
            <p className={styles.description}>
              Create a newsletter with curated content and updates for your subscribers
            </p>
          </button>
          <button className={styles.option} onClick={() => onSelect('marketing')}>
            <div className={styles.iconContainer}>
              <Mail className="w-6 h-6" />
            </div>
            <span className={styles.title}>Marketing Email</span>
            <p className={styles.description}>
              Create a targeted marketing email to promote your products or services
            </p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 