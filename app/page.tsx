'use client'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Header from '@/components/layouts/Header';
import { ContentData } from '@/types/EmailContent';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/core-ui-components/button';
import { Plus, Loader2, Mail, Newspaper } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ContentTypeModal } from '@/components/core-ui-components/content-type-modal';
import ContentCard from '@/components/dashboard/ContentCard';
import { EmptyState } from '@/components/core-ui-components/empty-state';

const styles = {
  container: `
    min-h-screen 
    bg-transparent
    backdrop-blur-[200px]
    flex 
    flex-col
  `,
  content: `
    w-full
    max-w-5xl
    mx-auto
    px-4
    py-8
    mt-20
  `,
  header: `
    flex 
    items-center 
    justify-between
    mb-6
  `,
  headerLeft: `
    space-y-1
  `,
  title: `
    text-2xl 
    font-semibold
    tracking-tight
  `,
  subtitle: `
    text-sm
    text-muted-foreground
  `,
  tableHeader: `
    flex 
    items-center 
    justify-between 
    px-4 
    py-3 
    bg-muted 
    rounded-t-lg 
    font-bold 
    text-sm 
    text-muted-foreground
  `,
  headerStatus: `
    w-24
  `,
  headerTopic: `
    flex-1
  `,
  headerDate: `
    w-48 
    text-right
  `,
  listContainer: `
    border 
    border-border-color
    rounded-[12px]
    bg-card 
    divide-y 
    divide-border
    overflow-hidden
  `,
  emptyState: `
    flex
    flex-col
    items-center
    justify-center
    py-24
    border
    border-dashed
    border-border-color
    rounded-[12px]
    bg-card
  `,
  tabContainer: `
    flex 
    gap-2 
    mb-4
    border
    border-border-color
    rounded-[12px]
    p-1
    bg-muted/30
  `,
  tab: `
    px-4 
    py-2 
    rounded-[8px]
    text-sm 
    font-medium 
    transition-all
    duration-200
    cursor-pointer
    flex-1
    text-center
  `,
  activeTab: `
    bg-[var(--primary-color)] 
    text-white
    shadow-sm
  `,
  inactiveTab: `
    text-muted-foreground 
    hover:bg-muted
  `
};

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [contents, setContents] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'newsletter' | 'marketing' | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchContents = async () => {
      try {
        const q = query(
          collection(db, 'emails'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedContents = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as ContentData[];
        setContents(fetchedContents);

        // Set initial active tab based on available content
        const hasMarketing = fetchedContents.some(content => content.contentType === 'marketing');
        const hasNewsletters = fetchedContents.some(content => content.contentType === 'newsletter');

        if (hasMarketing) {
          setActiveTab('marketing');
        } else if (hasNewsletters) {
          setActiveTab('newsletter');
        } else {
          setActiveTab('marketing'); // Default to marketing if no content
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [user, router]);

  const handleCreateNew = (type: 'newsletter' | 'marketing') => {
    const contentId = uuidv4();
    router.push(`/editor?id=${contentId}&type=${type}`);
    setShowModal(false);
  };

  const filteredContents = activeTab
    ? contents.filter(content => content.contentType === activeTab)
    : contents;

  const hasNewsletters = contents.some(content => content.contentType === 'newsletter');
  const hasMarketing = contents.some(content => content.contentType === 'marketing');

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>All Emails</h1>
            <p className={styles.subtitle}>
              Create and manage your email campaigns
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="
              bg-[var(--primary-color)]
              hover:bg-[var(--secondary-color)]
              text-white
              rounded-[12px]
              transition-colors
              duration-200
            "
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className={styles.tabContainer}>
              <div
                className={`${styles.tab} ${activeTab === 'marketing' ? styles.activeTab : styles.inactiveTab}`}
                onClick={() => setActiveTab('marketing')}
              >
                Marketing Emails {hasMarketing && `(${contents.filter(c => c.contentType === 'marketing').length})`}
              </div>
              <div
                className={`${styles.tab} ${activeTab === 'newsletter' ? styles.activeTab : styles.inactiveTab}`}
                onClick={() => setActiveTab('newsletter')}
              >
                Newsletters {hasNewsletters && `(${contents.filter(c => c.contentType === 'newsletter').length})`}
              </div>
            </div>
            <div className={styles.listContainer}>
              {filteredContents.length > 0 ? (
                <>
                  <div className={styles.tableHeader}>
                    <div className={styles.headerStatus}>Status</div>
                    <div className={styles.headerTopic}>Topic</div>
                    <div className={styles.headerDate}></div>
                  </div>
                  {filteredContents.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onClick={() => router.push(`/editor?id=${content.id}`)}
                    />
                  ))}
                </>
              ) : (
                <EmptyState
                  icon={activeTab === 'marketing' ? Mail : Newspaper}
                  title={`No ${activeTab === 'marketing' ? 'marketing emails' : 'newsletters'} yet`}
                  description={`Create your first ${activeTab === 'marketing' ? 'marketing email' : 'newsletter'} to get started`}
                  action={{
                    label: `Create ${activeTab === 'marketing' ? 'Marketing Email' : 'Newsletter'}`,
                    onClick: () => setShowModal(true),
                    icon: Plus
                  }}
                />
              )}
            </div>
          </>
        )}
      </main>
      <ContentTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleCreateNew}
      />
    </div>
  );
};

export default HomePage;