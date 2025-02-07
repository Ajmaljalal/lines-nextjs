import React from 'react';
import { ContentData } from '@/types/EmailContent';
import { Badge } from '../core-ui-components/badge';
import { Button } from '../core-ui-components/button';
import { ArrowRight } from 'lucide-react';

interface NewsletterRowProps {
  newsletter: ContentData;
  onClick: () => void;
}

const NewsletterRow: React.FC<NewsletterRowProps> = ({ newsletter, onClick }) => {
  return (
    <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-300 hover:bg-muted/50 transition-all cursor-pointer`} onClick={onClick}>
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
        >
          {newsletter.status === 'sent' ? 'View' : 'Edit'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default NewsletterRow; 