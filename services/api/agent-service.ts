import { ContentData } from '@/types/EmailContent';
import { BrandTheme } from '@/types/BrandTheme';

export interface ChatAgentRequest {
  message: string;
  context: {
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    data: ContentData;
  };
  brandTheme?: BrandTheme;
}

export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface ContentGenerationRequest {
  data: ContentData;
  brandTheme?: BrandTheme;
}

export interface ContentGenerationResponse {
  content: string[];
  error?: string;
}

export interface HtmlGenerationRequest {
  data: ContentData;
  brandTheme?: BrandTheme;
}

export interface HtmlGenerationResponse {
  content: string;
  error?: string;
}

class AgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  private async makeRequest<T>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/agents/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async dataCollection(request: ChatAgentRequest): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('data-collection', request);
  }

  async contentGeneration(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    return this.makeRequest<ContentGenerationResponse>('content-generation', request);
  }

  async contentEditing(request: ChatAgentRequest): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('content-editing', request);
  }

  async htmlGeneration(request: HtmlGenerationRequest): Promise<HtmlGenerationResponse> {
    return this.makeRequest<HtmlGenerationResponse>('html-generation', request);
  }

  async design(request: ChatAgentRequest): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('design', request);
  }

  async sendPreparation(request: ChatAgentRequest): Promise<AgentResponse> {
    return this.makeRequest<AgentResponse>('send-preparation', request);
  }
}

export const agentService = new AgentService();
