import React from 'react';
import { ContentData } from '@/types/EmailContent';
import { Badge } from '../core-ui-components/badge';
import { Button } from '../core-ui-components/button';
import { ArrowRight } from 'lucide-react';

interface ContentCardProps {
  content: ContentData;
  onClick: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onClick }) => {
  return (
    <div className={`
      flex 
      items-center
      justify-between
      px-4 
      py-3
      hover:bg-muted/50
      transition-all
      cursor-pointer
      border-gray-300
    `}
      onClick={onClick}
    >
      <div className="w-24">
        <Badge variant={content.status === 'sent' ? 'success' : 'info'}>
          {content.status}
        </Badge>
      </div>
      <div className="flex-1 font-medium">
        {content.topic || 'Untitled Content'}
      </div>
      <div className="w-48 flex items-center justify-end space-x-4">
        <Button
          variant="ghost"
          size="sm"
        >
          {content.status === 'sent' ? 'View' : 'Edit'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ContentCard; 