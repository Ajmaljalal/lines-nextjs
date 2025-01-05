// app/welcome/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import Header from '@/components/layouts/Header';
import { Newsletter } from '@/types/Newsletter';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import NewsletterCard from '@/components/dashboard/NewsletterCard';
import { Button } from '@/components/core-ui-components/button';
import { Plus, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const styles = {
  container: `
    min-h-screen 
    bg-background 
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
    font-medium 
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
    rounded-lg 
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
  `
};

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchNewsletters = async () => {
      try {
        const q = query(
          collection(db, 'newsletters'),
          where('userId', '==', user.uid),
          orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const fetchedNewsletters = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Newsletter[];
        setNewsletters(fetchedNewsletters);
      } catch (error) {
        console.error('Error fetching newsletters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, [user, router]);

  const handleCreateNew = () => {
    const newsletterId = uuidv4();
    router.push(`/editor?id=${newsletterId}`);
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Newsletters</h1>
            <p className={styles.subtitle}>
              Manage and track all your newsletters
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
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
            New Newsletter
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : newsletters.length > 0 ? (
          <div className={styles.listContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.headerStatus}>Status</div>
              <div className={styles.headerTopic}>Topic</div>
              <div className={styles.headerDate}></div>
            </div>
            {newsletters.map((newsletter) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">No newsletters yet</p>
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create your first newsletter
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;