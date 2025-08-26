export interface UrlExtractionRequest {
  urls: string[];
}

export interface UrlExtractionResult {
  url: string;
  title?: string;
  raw_content: string;
  status_code?: number;
}

export interface UrlExtractionResponse {
  results: UrlExtractionResult[];
  error?: string;
}

class UrlExtractionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async extractContent(request: UrlExtractionRequest): Promise<UrlExtractionResponse> {
    const response = await fetch(`${this.baseUrl}/api/services/url-extraction`, {
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

export const urlExtractionService = new UrlExtractionService();
