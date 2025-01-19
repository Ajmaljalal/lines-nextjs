import React from 'react';
import { useContent } from '@/context/ContentContext';
import { Loader2 } from 'lucide-react';

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
  loadingContainer: `
    flex
    flex-col
    items-center
    justify-center
    gap-4
    h-full
  `,
  sectionLabel: `
    text-xs
    font-medium
    text-[var(--primary-color)]
    uppercase
    tracking-wider
    mb-2
  `,
  section: `
    space-y-4
    bg-muted
    p-6
    rounded-[12px]
  `,
  sectionTitle: `
    text-xl
    font-semibold
    text-foreground
  `,
  subtitle: `
    text-sm
    text-muted-foreground
  `,
  content: `
    text-foreground
    leading-relaxed
  `
};

const SecondStep_ContentDrafting: React.FC = () => {
  const { data } = useContent();
  const content = data.generatedContent ? JSON.parse(data.generatedContent) : null;

  const renderLoadingState = () => {
    switch (data.loadingState) {
      case 'webSearch':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <p className="text-zinc-400">Searching the web for relevant content...</p>
          </div>
        );
      case 'urlExtraction':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <p className="text-zinc-400">Extracting content from provided URLs...</p>
          </div>
        );
      case 'contentGeneration':
        return (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <p className="text-zinc-400">Curating content...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (data.loadingState) {
    return (
      <div className={`${styles.container} h-full flex items-center justify-center`}>
        {renderLoadingState()}
      </div>
    );
  }

  if (!content) {
    return (
      <div className={styles.container}>
        <div className="text-zinc-400">
          No content generated yet. Please complete the previous step first.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.sectionLabel}>Newsletter Header</div>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{content.header.title}</h2>
          {content.header.subtitle && (
            <p className={styles.subtitle}>{content.header.subtitle}</p>
          )}
        </div>
      </div>

      <div>
        <div className={styles.sectionLabel}>Main Content Sections</div>
        {content.sections.map((section: any, index: number) => (
          <div key={index} className="mt-4">
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <div className={styles.content}>{section.content}</div>
              {section.url && (
                <a
                  href={section.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--primary-color)] hover:underline mt-2 block"
                >
                  Source: {section.url}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className={styles.sectionLabel}>Newsletter Footer</div>
        <div className={styles.section}>
          <div className={styles.content}>{content.footer.content}</div>
          {content.footer.callToAction && (
            <div className="mt-4 text-[var(--primary-color)]">
              {content.footer.callToAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondStep_ContentDrafting; 