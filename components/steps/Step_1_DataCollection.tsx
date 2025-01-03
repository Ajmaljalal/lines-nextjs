import React, { useState } from 'react';
import { Textarea } from '../core-ui-components/textarea';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useNewsletter } from '../../context/NewsletterContext';
import { Button } from '../core-ui-components/button';

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

  urlList: `
    flex
    flex-wrap
    gap-2
    mb-2
  `,
  urlChip: `
    bg-zinc-700/50
    text-zinc-200
    px-3
    py-1
    rounded-full
    text-sm
    flex
    items-center
    gap-2
  `,
  addButton: `
    bg-[var(--primary-color)]
    border-none
    focus:ring-1
    focus:ring-primary/30
    rounded-[8px]
    transition-all
    duration-200
  `,
};

const FirstStep_DataCollection: React.FC = () => {
  const { data, updateData } = useNewsletter();
  const [topic, setTopic] = useState(data.topic);
  const [content, setContent] = useState(data.content);
  const [style, setStyle] = useState(data.style);
  const [currentUrl, setCurrentUrl] = useState('');

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

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      // Check if it has a valid protocol (http or https)
      if (!url.protocol || !['http:', 'https:'].includes(url.protocol)) {
        return false;
      }
      // Check if it has a valid hostname
      if (!url.hostname || url.hostname.length < 3) {
        return false;
      }
      // Check for at least one dot in hostname (e.g., example.com)
      if (!url.hostname.includes('.')) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const addUrl = () => {
    if (!currentUrl.trim()) return;

    const urlToAdd = currentUrl.trim();

    if (!isValidUrl(urlToAdd)) {
      console.error('Invalid URL - Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (data.urls.includes(urlToAdd)) {
      console.log('URL already exists');
      return;
    }

    const newUrls = [...data.urls, urlToAdd];
    updateData({ urls: newUrls });
    setCurrentUrl('');
  };

  const removeUrl = (urlToRemove: string) => {
    const newUrls = data.urls.filter(url => url !== urlToRemove);
    updateData({ urls: newUrls });
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newStyle = e.target.value;
    setStyle(newStyle);
    updateData({ style: newStyle });
  };

  return (
    <form className={styles.container}>
      <div className={styles.formGroup}>
        <Label>
          Newsletter / Email Topic <span className="text-red-500">*</span>
        </Label>
        <Input
          // className={styles.input}
          placeholder="What is the main topic you want to write about?"
          value={topic}
          onChange={handleTopicChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          Content <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="Your newsletter/email content, if you already have something in mind..."
          rows={6}
          value={content}
          onChange={handleContentChange}
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          Reference URLs <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>

        {data.urls.length > 0 && (
          <div className={styles.urlList}>
            {data.urls.map((url, index) => (
              <div key={index} className={styles.urlChip}>
                <span className="truncate max-w-[300px]">{url}</span>
                <button
                  onClick={() => removeUrl(url)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            placeholder="Enter web URLs to extract content from and press Enter or Add..."
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <Button
            type="button"
            onClick={addUrl}
            className={`
              ${styles.addButton}
              absolute
              right-[8px]
              top-1/2
              -translate-y-1/2
              h-[calc(100%-16px)]
              min-w-[50px]
              text-xs
              px-2.5
              text-white
            `}
          >
            Add
          </Button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <Label>
          Style Preferences <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
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