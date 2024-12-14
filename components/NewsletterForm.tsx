import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ChevronRight, X, Settings } from 'lucide-react';
import { Button } from './ui/button';

const styles = {
  column: `
    w-1/6
    min-w-[300px]
    max-w-[500px]
    rounded-lg
    p-4
    overflow-y-auto
    transition-all
    duration-300
    border
    border-zinc-700
    relative`,

  columnCollapsed: `
    w-12
    min-w-[48px]
    rounded-lg
    p-2
    overflow-hidden
    transition-all
    duration-300
    relative`,

  container: `
    space-y-6
    relative`,

  collapsedContainer: `
    flex
    justify-center`,

  formGroup: `
    space-y-2`,

  input: `
    w-full
    bg-zinc-700
    border-zinc-600
    text-zinc-200`,

  textarea: `
    w-full
    bg-zinc-700
    border-zinc-600
    text-zinc-200
    min-h-[100px]`,

  toggleButton: `
    w-8
    h-8
    flex
    items-center
    justify-center
    bg-zinc-700
    hover:bg-zinc-600
    rounded-full
    border
    border-zinc-600
    cursor-pointer
    transition-all
    duration-300
    hover:scale-110
    shadow-md
    z-10`,

  collapsedToggleButton: `
    w-8
    h-8
    flex
    items-center
    justify-center
    bg-zinc-700
    hover:bg-zinc-600
    rounded-full
    border
    border-zinc-600
    cursor-pointer
    transition-all
    duration-300
    hover:scale-110
    shadow-md
    z-10`
};

const NewsletterForm: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={styles.columnCollapsed}>
        <div className={styles.collapsedContainer}>
          <Button
            variant="ghost"
            size="icon"
            className={styles.collapsedToggleButton}
            onClick={toggleCollapse}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.column}>
      <div className={styles.container}>
        <Button
          variant="ghost"
          size="icon"
          className={styles.toggleButton}
          onClick={toggleCollapse}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className={styles.formGroup}>
          <Input
            className={styles.input}
            placeholder="Enter the main topic..."
          />
        </div>

        <div className={styles.formGroup}>
          <Textarea
            className={styles.textarea}
            placeholder="Enter your newsletter content..."
          />
        </div>

        <div className={styles.formGroup}>
          <Textarea
            className={styles.textarea}
            placeholder="Enter URLs to extract content from..."
          />
        </div>

        <div className={styles.formGroup}>
          <Textarea
            className={styles.textarea}
            placeholder="Describe your preferred style, theme, and colors..."
          />
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;
