import React from 'react';

const styles = {
  container: `
    h-full
    flex
    items-center
    justify-center
    text-zinc-400
    text-sm
  `,
};

interface NewsletterPreviewProps {
  onComplete: () => void;
}

const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({ onComplete }) => {
  return (
    <div className={styles.container}>
      <div>Newsletter preview will appear here</div>
    </div>
  );
};

export default NewsletterPreview;