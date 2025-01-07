import React, { useState, useEffect } from 'react';
import { Textarea } from '../core-ui-components/textarea';
import { Input } from '../core-ui-components/input';
import { Label } from '../core-ui-components/label';
import { useNewsletter } from '@/context/NewsletterContext';
import { Button } from '../core-ui-components/button';
import { Switch } from '../core-ui-components/switch';

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
  labelContainer: `
    flex
    items-center
    justify-between
  `,
  labelGroup: `
    flex
    items-center
    gap-4
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
  const [topic, setTopic] = useState<string>(data.topic || '');
  const [content, setContent] = useState<string>(data.userProvidedContent || '');
  const [style, setStyle] = useState<string>(data.style || '');
  const [currentUrl, setCurrentUrl] = useState('');
  const [webSearch, setWebSearch] = useState<boolean>(data.webSearch || false);

  const isReadOnly = data.status === 'sent';

  useEffect(() => {
    setTopic(data.topic || '');
    setContent(data.userProvidedContent || '');
    setStyle(data.style || '');
    setWebSearch(data.webSearch || false);
  }, [data.topic, data.userProvidedContent, data.style, data.webSearch]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTopic = e.target.value;
    setTopic(newTopic);
    updateData({ topic: newTopic });
  };

  const handleWebSearchChange = (checked: boolean) => {
    setWebSearch(checked);
    updateData({ webSearch: checked });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateData({ userProvidedContent: newContent });
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      if (!url.protocol || !['http:', 'https:'].includes(url.protocol)) {
        return false;
      }
      if (!url.hostname || url.hostname.length < 3) {
        return false;
      }
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
        <div className={styles.labelContainer}>
          <div className={styles.labelGroup}>
            <Label>
              Newsletter / Email Topic <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={webSearch}
                onCheckedChange={handleWebSearchChange}
                disabled={isReadOnly}
              />
              <span className="text-sm text-zinc-400">Web Search</span>
            </div>
          </div>
        </div>
        <Input
          placeholder="What is the main topic you want to write about?"
          value={topic}
          onChange={handleTopicChange}
          required
          disabled={isReadOnly}
          className={isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
        />
      </div>

      <div className={styles.formGroup}>
        <Label>
          Content <span className="text-zinc-500 text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          placeholder="Paste your content here if you already have something in mind..."
          rows={15}
          value={content}
          onChange={handleContentChange}
          disabled={isReadOnly}
          className={isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
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
                {!isReadOnly && (
                  <button
                    onClick={() => removeUrl(url)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            placeholder="Enter web URLs to extract content from..."
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            disabled={isReadOnly}
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
          placeholder="Describe your preferred look and feel of the email design. (e.g. modern, minimalist, pretty, serious, casual, professional, creative, bold, colorful, dark, light, etc.)"
          rows={3}
          value={style}
          onChange={handleStyleChange}
          disabled={isReadOnly}
          className={isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
        />
      </div>
    </form>
  );
};

export default FirstStep_DataCollection;