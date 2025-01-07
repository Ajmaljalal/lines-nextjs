import { Newsletter } from "@/types/Newsletter";


export enum AgentRole {
  DATA_COLLECTION = 'data_collection',
  CONTENT_EDITING = 'content_editing',
  DESIGN = 'design',
}

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'user' | 'assistant';
}

export interface AgentContext {
  messages: AgentMessage[];
  data: Newsletter;
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
