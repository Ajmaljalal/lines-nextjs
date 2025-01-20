import { BrandTheme } from "@/types/BrandTheme";
import { ContentData } from "@/types/EmailContent";


export enum AgentRole {
  DATA_COLLECTION = 'data_collection',
  CONTENT_EDITING = 'content_editing',
  DESIGN = 'design',
  SEND_PREPARATION = 'send_preparation',
  MARKETING_CONTENT_DRAFT = 'marketing_content_draft',
  MARKETING_HTML_GENERATION = 'marketing_html_generation'
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
