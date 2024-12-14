import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { X, Settings } from 'lucide-react';
import { Button } from './ui/button';

const styles = {
  column: `
    right-4
    top-24
    w-[550px]
    rounded-[10px]
    p-4
    transition-all
    duration-300
    bg-zinc-800/50
    relative
    z-100
    pointer-events-auto`,

  columnCollapsed: `
    right-7
    top-20
    w-12
    min-w-[48px]
    rounded-lg
    p-2
    overflow-hidden
    transition-all
    duration-300
    relative
    z-100
    pointer-events-auto`,

  container: `
    space-y-6`,

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
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [style, setStyle] = useState('');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      {isCollapsed ? (
        <div className={styles.columnCollapsed} style={{ position: 'fixed' }}>
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
      ) : (
        <div className={styles.column} style={{ position: 'fixed' }}>
          <div className={styles.container}>
            <Button
              variant="ghost"
              size="icon"
              className={styles.toggleButton}
              onClick={toggleCollapse}
            >
              <X className="w-4 h-4" />
            </Button>
            <Input
              className={styles.input}
              placeholder="Enter the main newsletter/email topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Textarea
              className={styles.textarea}
              placeholder="Enter your newsletter content..."
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Textarea
              className={styles.textarea}
              placeholder="Enter URLs to extract content from..."
              rows={3}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
            />
            <Textarea
              className={styles.textarea}
              placeholder="Describe your preferred style, theme, and colors..."
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterForm;
