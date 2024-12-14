// components/PreviewSection.tsx
import React from 'react';

const styles = {
  container: `
    h-full
    flex
    items-center
    justify-center
    text-zinc-400
    text-sm`,
};

const NewsletterPreview: React.FC = () => {
  return (
    <div className={styles.container}>
      Newsletter preview will appear here
    </div>
  );
};

export default NewsletterPreview;