import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNewsletter } from '../../context/NewsletterContext';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-8
    max-w-3xl
    mx-auto
    px-4
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
    focus:border-zinc-600
    focus:ring-1
    focus:ring-zinc-600
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

const FirstStep_DataCollection: React.FC = () => {
  const { data, updateData } = useNewsletter();
  const [topic, setTopic] = useState(data.topic);
  const [content, setContent] = useState(data.content);
  const [urls, setUrls] = useState(data.urls.join('\n'));
  const [style, setStyle] = useState(data.style);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTopic = e.target.value;
    setTopic(newTopic);
    updateData({ topic: newTopic });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateData({ content: newContent });
  };

  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newUrls = e.target.value;
    setUrls(newUrls);
    updateData({ urls: newUrls.split('\n').filter(url => url.trim()) });
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    updateData({ style: newStyle });
  };

  return (
    <form className={styles.container}>
      <div className={styles.formGroup}>
        <Label className={styles.label}>
          Newsletter Topic <span className="text-red-500">*</span>
        </Label>
        <Input
          className={styles.input}
          placeholder="Enter the main topic or subject..."
          value={topic}
          onChange={handleTopicChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>
          Content <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          className={styles.textarea}
          placeholder="Write or paste your newsletter content here..."
          rows={6}
          value={content}
          onChange={handleContentChange}
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>
          Reference URLs <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          className={styles.textarea}
          placeholder="Add URLs to extract content from (one per line)..."
          rows={3}
          value={urls}
          onChange={handleUrlsChange}
        />
      </div>

      <div className={styles.formGroup}>
        <Label className={styles.label}>
          Style Preferences <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          className={styles.textarea}
          placeholder="Describe your preferred style, theme, and colors..."
          rows={3}
          value={style}
          onChange={handleStyleChange}
        />
      </div>
    </form>
  );
};

export default FirstStep_DataCollection;