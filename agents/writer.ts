import { BaseAgent } from './base';
import { AgentContext, AgentResponse, NewsletterPlan } from './types';

export class WriterAgent extends BaseAgent {
  private plan: NewsletterPlan;

  constructor(context: AgentContext, plan: NewsletterPlan) {
    super(context);
    this.plan = plan;
  }

  protected generatePrompt(): string {
    return `As a professional newsletter writer, write the newsletter content based on the following plan:
    ${JSON.stringify(this.plan)}

    Follow these guidelines:
    - Match the specified tone and style
    - Create engaging and well-structured content
    - Include all planned sections
    - Maintain consistency throughout

    Previous context: ${JSON.stringify(this.context.messages)}`;
  }

  protected processResponse(response: string): AgentResponse {
    return {
      content: response,
      metadata: {
        type: 'newsletter_content',
        plan: this.plan
      }
    };
  }
}
