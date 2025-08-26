'use client'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Header from '@/components/layouts/Header';
import { ContentData } from '@/types/EmailContent';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/core-ui-components/button';
import { Plus, Loader2, Mail } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { EmailTypeModal } from '@/components/core-ui-components/email-type-modal';
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
    border-gray-300
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
    justify-start
  `,
  tab: `
    px-4 
    py-2 
    text-sm 
    font-medium 
    transition-all
    duration-200
    cursor-pointer
    text-center
    border-1
    border-gray-300
    rounded-[12px]
    hover:bg-muted/50
  `,
  activeTab: `
    border-[var(--primary-color)]
    text-[var(--primary-color)]
    bg-muted/30
    font-semibold
  `,
  inactiveTab: `
    text-muted-foreground 
    hover:text-foreground
  `
};

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [contents, setContents] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


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


      } catch (error) {
        console.error('Error fetching contents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [user, router]);

  const handleCreateNew = (type: 'marketing') => {
    const contentId = uuidv4();
    router.push(`/editor?id=${contentId}&type=${type}`);
    setShowModal(false);
  };

  const filteredContents = contents.filter(content => content.contentType === 'marketing');



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
        ) : contents.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No emails yet"
            description="Create your first email campaign to get started"
            action={{
              label: "Create Email",
              onClick: () => setShowModal(true),
              icon: Plus
            }}
          />
        ) : (
          <>

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
                  icon={Mail}
                  title="No emails yet"
                  description="Create your first email campaign to get started"
                  action={{
                    label: "Create Email",
                    onClick: () => setShowModal(true),
                    icon: Plus
                  }}
                />
              )}
            </div>
          </>
        )}
      </main>
      <EmailTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleCreateNew}
      />
    </div>
  );
};

export default HomePage;