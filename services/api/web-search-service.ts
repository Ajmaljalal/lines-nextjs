export interface WebSearchRequest {
  query: string;
  includeImages?: boolean;
  includeAnswer?: boolean;
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
}

export interface WebSearchResult {
  title: string;
  content: string;
  url: string;
  score?: number;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  answer?: string;
  error?: string;
}

class WebSearchService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async searchWeb(request: WebSearchRequest): Promise<WebSearchResponse> {
    const response = await fetch(`${this.baseUrl}/api/services/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const webSearchService = new WebSearchService();
