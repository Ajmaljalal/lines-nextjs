// components/PreviewSection.tsx
import React from 'react';
import { Button } from './ui/button';

const styles = {
  container: `
    h-full
    flex
    items-center
    justify-center
    text-zinc-400
    text-sm`,
  footer: `
    mt-8
    flex
    justify-end
  `,
  button: `
    bg-orange-500
    hover:bg-orange-600
    text-white
  `,
};

interface NewsletterPreviewProps {
  onComplete: () => void;
}

const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({ onComplete }) => {
  return (
    <div className={styles.container}>
      <div>Newsletter preview will appear here</div>
      <div className={styles.footer}>
        <Button
          className={styles.button}
          onClick={onComplete}
        >
          Mark as Complete
        </Button>
      </div>
    </div>
  );
};

export default NewsletterPreview;