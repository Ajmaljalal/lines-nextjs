import React from 'react';
import { useNewsletter } from '@/context/NewsletterContext';

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
  const { data } = useNewsletter();

  if (!data.htmlContent) {
    return (
      <div className={styles.container}>
        <div className="text-zinc-400">
          No HTML content available. Please complete the previous step first.
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