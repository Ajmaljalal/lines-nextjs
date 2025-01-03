import { Construction } from 'lucide-react';

const styles = {
  container: `
    flex 
    flex-col 
    items-center 
    justify-center 
    min-h-[calc(100vh-80px)]
    p-4
    text-center
  `,
  icon: `
    w-16 
    h-16 
    text-muted-foreground 
    mb-4
  `,
  title: `
    text-2xl 
    font-semibold 
    mb-2
  `,
  description: `
    text-muted-foreground
    max-w-md
  `
};

const UnderConstruction = () => {
  return (
    <div className={styles.container}>
      <Construction className={styles.icon} />
      <h1 className={styles.title}>Under Construction</h1>
      <p className={styles.description}>
        This page is currently under development. Please check back later for updates.
      </p>
    </div>
  );
};

export default UnderConstruction; 