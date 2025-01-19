import { BrandTheme } from "@/types/BrandTheme";
import { ContentData } from "@/types/EmailContent";



interface Newsletter {
  id: string;
  userId: string;
  topic: string;
  userProvidedContent: string;
  webSearch: boolean;
  webSearchContent: {
    title: string;
    content: string;
    url: string;
  }[];
  urlsExtractedContent: string[];
  urls: string[];
  style: string;
  generatedContent?: string;
  htmlContent?: string;
  recipients?: string[];
  subject?: string;
  fromEmail?: string;
  senderName?: string;
  status: 'draft' | 'sent';
  createdAt: Date;
  updatedAt: Date;
  loadingState?: 'webSearch' | 'urlExtraction' | 'contentGeneration' | null;
}

export enum AgentRole {
  DATA_COLLECTION = 'data_collection',
  CONTENT_EDITING = 'content_editing',
  DESIGN = 'design',
  SEND_PREPARATION = 'send_preparation'
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'user' | 'assistant';
}

export interface AgentContext {
  messages: AgentMessage[];
  data: ContentData;
  brandTheme?: BrandTheme | null;
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
