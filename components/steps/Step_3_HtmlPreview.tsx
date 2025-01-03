import React, { useEffect, useState } from 'react';
import { HtmlGeneratorAgent } from '@/agents/html_generator_agent';
import { useNewsletter } from '@/context/NewsletterContext';
import { Loader2 } from 'lucide-react';

const styles = {
  container: `
    w-full
    flex
    flex-col
    gap-8
    max-w-4xl
    mx-auto
    p-4
    rounded-[12px]
  `,
  loadingContainer: `
    flex
    flex-col
    items-center
    justify-center
    gap-4
  `,
  iframe: `
    w-full
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
            id: data.id,
            userId: data.userId,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            topic: data.topic || '',
            urls: data.urls || [],
            style: data.style || '',
            content: data.generatedContent,
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

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          <p className="text-zinc-400">Generating HTML preview...</p>
        </div>
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
    <div
      dangerouslySetInnerHTML={{ __html: data.htmlContent }}
      className={styles.container}
    />
  );
};

export default ThirdStep_HtmlPreview; 