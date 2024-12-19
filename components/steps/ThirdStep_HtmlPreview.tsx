import React, { useEffect, useState } from 'react';
import { HtmlGeneratorAgent } from '@/agents/html_generator_agent';
import { useNewsletter } from '@/context/NewsletterContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-8
    max-w-4xl
    mx-auto
  `,
  loadingContainer: `
    flex
    flex-col
    items-center
    justify-center
    gap-4
    h-full
  `,
  previewContainer: `
    bg-white
    rounded-lg
    shadow-lg
    overflow-hidden
  `,
  toolbar: `
    flex
    items-center
    justify-between
    p-4
    border-b
    border-zinc-200
    bg-zinc-50
  `,
  iframe: `
    w-full
    h-[calc(100vh-200px)]
    border-0
  `
};

const ThirdStep_HtmlPreview: React.FC = () => {
  const { data, updateData } = useNewsletter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateHtml = async () => {
      if (!data.generatedContent) {
        setError('No content available to generate HTML');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const agent = new HtmlGeneratorAgent({
          messages: [],
          data: {
            topic: data.topic || '',
            content: data.content || '',
            urls: data.urls || [],
            style: data.style || '',
            generatedContent: data.generatedContent,
            design: data.design
          }
        });

        const response = await agent.execute();

        if (response.error) {
          throw new Error(response.error);
        }

        updateData({ htmlContent: response.content });
      } catch (err) {
        console.error('HTML generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate HTML');
      } finally {
        setIsLoading(false);
      }
    };

    if (data.htmlContent) {
      setIsLoading(false);
      return;
    }

    generateHtml();
  }, [data.generatedContent]);

  const handleDownload = () => {
    if (!data.htmlContent) return;

    const blob = new Blob([data.htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
        <p className="text-zinc-400">Generating HTML preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="text-red-400">
          Error generating HTML: {error}
        </div>
      </div>
    );
  }

  if (!data.htmlContent) {
    return (
      <div className={styles.container}>
        <div className="text-zinc-400">
          No HTML content available. Please generate content first.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.previewContainer}>
        <div className={styles.toolbar}>
          <h3 className="text-zinc-800 font-medium">Newsletter Preview</h3>
          <Button onClick={handleDownload} variant="outline">
            Download HTML
          </Button>
        </div>
        <iframe
          className={styles.iframe}
          srcDoc={data.htmlContent}
          title="Newsletter Preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

export default ThirdStep_HtmlPreview; 