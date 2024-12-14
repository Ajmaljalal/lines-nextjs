import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';

export class EditorAgent extends BaseAgent {
  private content: string;

  constructor(context: AgentContext, content: string) {
    super(context);
    this.content = content;
  }

  protected generatePrompt(): string {
    return `As a professional editor, review and improve the following newsletter content:
    ${this.content}

    Focus on:
    - Grammar and spelling
    - Clarity and readability
    - Tone consistency
    - Overall structure

    Previous context: ${JSON.stringify(this.context.messages)}

    Provide the improved version of the content.`;
  }

  protected processResponse(response: string): AgentResponse {
    return {
      content: response,
      metadata: {
        type: 'edited_content',
        originalLength: this.content.length,
        editedLength: response.length
      }
    };
  }
}
