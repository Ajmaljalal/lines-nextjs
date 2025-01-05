import axios from 'axios';

const TAVILY_API_KEY = process.env.NEXT_PUBLIC_TAVILY_API_KEY;
const TAVILY_API_BASE_URL = 'https://api.tavily.com/v1';

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

export interface TavilySearchResponse {
  results: {
    url: string;
    title: string;
    content: string;
  }[];
  query: string;
  response_time: number;
}

export const TavilyService = {
  async searchWeb(query: string): Promise<TavilySearchResponse> {
    try {
      const response = await axios.post(`${TAVILY_API_BASE_URL}/search`, {
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "advanced",
        include_answer: false,
        include_images: true,
        include_domains: [],
        exclude_domains: [],
      });
      return response.data;
    } catch (error) {
      console.error('Error searching web with Tavily:', error);
      throw error;
    }
  },

  async extractContent(urls: string[]): Promise<TavilyExtractResponse> {
    try {
      const response = await axios.post(`${TAVILY_API_BASE_URL}/extract`, {
        api_key: TAVILY_API_KEY,
        urls,
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting content with Tavily:', error);
      throw error;
    }
  },
}; 