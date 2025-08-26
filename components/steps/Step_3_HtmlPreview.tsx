import React from 'react';
import { useContent } from '@/context/ContentContext';

const styles = {
  container: `
    w-full
    h-full
    flex
    flex-col
    gap-8
    mx-auto
    scrollbar-hide
    overflow-hidden
    relative
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
    h-full
    border-0
    scrollbar-hide
    overflow-hidden
    [&::-webkit-scrollbar]:hidden
    [-ms-overflow-style:'none']
    [scrollbar-width:none]
  `,

};

const ThirdStep_HtmlPreview: React.FC = () => {
  const { data } = useContent();

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
    <div className={styles.container}>
      <iframe
        srcDoc={data.htmlContent}
        className={styles.iframe}
        sandbox="allow-same-origin"
        title="Email Preview"
        style={{
          scrollbarWidth: 'thin'
        }}
      />
    </div>
  );
};

export default ThirdStep_HtmlPreview; 