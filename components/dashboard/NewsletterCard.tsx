import React from 'react';
import { Newsletter } from '@/types/Newsletter';
import { Badge } from '../core-ui-components/badge';
import { Button } from '../core-ui-components/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NewsletterRowProps {
  newsletter: Newsletter;
}

const NewsletterRow: React.FC<NewsletterRowProps> = ({ newsletter }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/editor?id=${newsletter.id}`);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-all">
      <div className="w-24">
        <Badge variant={newsletter.status === 'sent' ? 'success' : 'info'}>
          {newsletter.status}
        </Badge>
      </div>
      <div className="flex-1 font-medium">
        {newsletter.topic || 'Untitled Newsletter'}
      </div>
      <div className="w-48 flex items-center justify-end space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
        >
          {newsletter.status === 'sent' ? 'View' : 'Edit'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default NewsletterRow; 