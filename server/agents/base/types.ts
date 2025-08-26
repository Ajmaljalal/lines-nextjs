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

export interface BrandTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  logoUrl?: string;
  websiteUrl?: string;
  unsubscribeUrl?: string;
  socialMediaUrls?: Record<string, string>;
}

export interface ContentData {
  id?: string;
  userId?: string;
  topic?: string;
  userProvidedContent?: string;
  generatedContent?: string;
  htmlContent?: string;
  urls?: string[];
  style?: string;
  webSearch?: boolean;
  webSearchContent?: Array<{
    title: string;
    content: string;
    url: string;
  }>;
  urlsExtractedContent?: string[];
  contentType?: string;
  senderName?: string;
  fromEmail?: string;
  subject?: string;
  recipients?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentContext {
  messages: AgentMessage[];
  data: ContentData;
  brandTheme?: BrandTheme | null;
}

export interface AgentResponse {
  content: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AgentInput {
  data: ContentData;
  messages?: AgentMessage[];
  brandTheme?: BrandTheme;
  userInput?: string;
}

export interface AgentOutput {
  content: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface IAgent {
  execute(input: AgentInput): Promise<AgentOutput>;
  getCapabilities(): AgentCapability[];
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface AgentConfig {
  framework?: 'langchain' | 'langgraph' | 'mastra' | 'native';
  temperature?: number;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export type AgentType =
  | 'data-collection'
  | 'content-generation'
  | 'content-editing'
  | 'html-generation'
  | 'design'
  | 'send-preparation';

export type AgentFramework = 'langchain' | 'langgraph' | 'mastra' | 'native';
