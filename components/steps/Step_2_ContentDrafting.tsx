import React, { useEffect, useState } from 'react';
import { ContentDrafterAgent } from '@/agents/content_drafter_agent';
import { useNewsletter } from '@/context/NewsletterContext';
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
  const { data } = useNewsletter();
  const content = data.generatedContent ? JSON.parse(data.generatedContent) : null;

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