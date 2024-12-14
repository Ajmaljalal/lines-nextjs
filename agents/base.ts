import { AgentContext, AgentResponse } from './types';

export abstract class BaseAgent {
  protected context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  protected abstract generatePrompt(): string

  protected abstract processResponse(response: string): AgentResponse;

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (input) {
        this.context.messages.push({
          role: 'user',
          content: input
        });
      }

      const prompt = this.generatePrompt();
      const response = await this.callOpenAI(prompt);

      this.context.messages.push({
        role: 'assistant',
        content: response
      });

      return this.processResponse(response);
    } catch (error) {
      console.error('Agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...this.context.messages,
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    return data.content;
  }
}
