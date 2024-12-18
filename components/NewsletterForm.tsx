import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-8
  `,
  formGroup: `
    space-y-2.5
  `,
  label: `
    text-sm
    font-medium
    text-zinc-300
    ml-1
  `,
  input: `
    w-full
    bg-zinc-800/50
    border-zinc-700/50
    text-zinc-200
    placeholder:text-zinc-500
    focus:border-[var(--primary-color)]
    focus:ring-1
    focus:ring-[var(--primary-color)]
    rounded-[12px]
    transition-colors
    duration-200
  `,
  textarea: `
    w-full
    bg-zinc-800/50
    border-zinc-700/50
    text-zinc-200
    placeholder:text-zinc-500
    focus:border-zinc-600
    focus:ring-1
    focus:ring-zinc-600
    resize-none
    transition-colors
    duration-200
  `,
};

interface NewsletterFormProps {
  onComplete: () => void;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ onComplete }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [style, setStyle] = useState('');

  return (
    <div className={styles.container}>
      <div className={styles.formGroup}>
        <Label className={styles.label}>Newsletter Topic</Label>
        <Input
          className={styles.input}
          placeholder="Enter the main topic or subject..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>Content</Label>
        <Textarea
          className={styles.textarea}
          placeholder="Write your newsletter content here..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>Reference URLs</Label>
        <Textarea
          className={styles.textarea}
          placeholder="Add URLs to extract content from (one per line)..."
          rows={3}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>Style Preferences</Label>
        <Textarea
          className={styles.textarea}
          placeholder="Describe your preferred style, theme, and colors..."
          rows={3}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
      </div>
    </div>
  );
};

export default NewsletterForm;