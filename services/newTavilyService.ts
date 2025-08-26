import { webSearchService, WebSearchRequest } from './api/web-search-service';
import { urlExtractionService, UrlExtractionRequest } from './api/url-extraction-service';

// Interface compatibility with existing TavilyService
export interface TavilySearchResponse {
  results: {
    url: string;
    title: string;
    content: string;
  }[];
  query: string;
  response_time: number;
}

export interface TavilyExtractResponse {
  results: {
    url: string;
    raw_content: string;
  }[];
  failed_results: {
    url: string;
    error: string;
  }[];
  response_time: number;
}

export const NewTavilyService = {
  async searchWeb(query: string): Promise<TavilySearchResponse> {
    try {
      const request: WebSearchRequest = {
        query,
        searchDepth: 'advanced',
        maxResults: 5
      };

      const response = await webSearchService.searchWeb(request);

      if (response.error) {
        throw new Error(response.error);
      }

      // Transform response to match existing interface
      return {
        results: response.results.map(result => ({
          url: result.url,
          title: result.title,
          content: result.content
        })),
        query,
        response_time: 0 // API doesn't return this, so we use 0
      };
    } catch (error) {
      console.error('Error searching web with new Tavily service:', error);
      throw error;
    }
  },

  async extractContent(urls: string[]): Promise<TavilyExtractResponse> {
    try {
      const request: UrlExtractionRequest = {
        urls
      };

      const response = await urlExtractionService.extractContent(request);

      if (response.error) {
        throw new Error(response.error);
      }

      // Transform response to match existing interface
      return {
        results: response.results.map(result => ({
          url: result.url,
          raw_content: result.raw_content
        })),
        failed_results: [], // New API doesn't separate failures, they're just not in results
        response_time: 0 // API doesn't return this, so we use 0
      };
    } catch (error) {
      console.error('Error extracting content with new Tavily service:', error);
      throw error;
    }
  }
};
