import { AgentContext, AgentResponse } from './types';

export abstract class BaseAgent {
  protected context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  protected abstract generatePrompt(userInput: string): string;
  protected abstract processResponse(response: string): Promise<AgentResponse>;

  public async execute(input: string): Promise<AgentResponse> {
    try {
      // Add user message to context
      this.context.messages.push({
        role: 'user',
        content: input,
        type: 'user'
      });

      // Generate and execute the prompt
      const prompt = this.generatePrompt(input);
      const response = await this.executePrompt(prompt);

      // Add assistant message to context
      this.context.messages.push({
        role: 'assistant',
        content: response,
        type: 'assistant'
      });

      // Process and return the response
      return await this.processResponse(response);
    } catch (error) {
      console.error('Agent execution error:', error);
      return {
        content: "I apologize, but I encountered an error while processing your request. Could you please try again?",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected async executePrompt(prompt: string): Promise<string> {
    throw new Error('executePrompt must be implemented by derived classes');
  }
} 