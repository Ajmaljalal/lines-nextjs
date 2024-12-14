import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Button } from './ui/button';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-6
  `,
  formGroup: `
    space-y-2
  `,
  input: `
    w-full
    bg-zinc-700/50
    border-zinc-600
    text-zinc-200
    focus:border-zinc-500
    focus:ring-zinc-500
  `,
  textarea: `
    w-full
    bg-zinc-700/50
    border-zinc-600
    text-zinc-200
    min-h-[100px]
    focus:border-zinc-500
    focus:ring-zinc-500
  `,
};

const NewsletterForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [urls, setUrls] = useState('');
  const [style, setStyle] = useState('');

  return (
    <div className={styles.container}>
      <Input
        className={styles.input}
        placeholder="Enter the main newsletter/email topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Textarea
        className={styles.textarea}
        placeholder="Enter your newsletter content..."
        rows={6}
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
        rows={3}
        value={style}
        onChange={(e) => setStyle(e.target.value)}
      />
    </div>
  );
};

export default NewsletterForm;