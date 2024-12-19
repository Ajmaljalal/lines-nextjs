export enum AgentRole {
  PLANNER = 'planner',
  WRITER = 'writer',
  EDITOR = 'editor',
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'user' | 'assistant'; // Add this line
}

interface NewsletterData {
  topic?: string;
  content?: string;
  urls?: string[];
  style?: string;
  generatedContent?: string;
  htmlContent?: string;
  design?: {
    template?: string;
    colors?: string[];
  };
  recipients?: string[];
  scheduledDate?: Date;
}

export interface AgentContext {
  messages: any[];
  data: NewsletterData;
}

export interface NewsletterPlan {
  title: string;
  sections: {
    title: string;
    description: string;
    content?: string;
  }[];
  style: {
    tone: string;
    format: string;
    length: 'short' | 'medium' | 'long';
  };
}

export interface AgentResponse {
  content: string;
  error?: string;
  metadata?: Record<string, any>;
}
