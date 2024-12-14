import { BaseAgent } from './base';
import { AgentResponse, NewsletterPlan } from './types';

export class PlannerAgent extends BaseAgent {
  protected generatePrompt(): string {
    return `As a newsletter planning expert, create a detailed plan for the newsletter based on the user's input. 
    Consider the following aspects:
    - Target audience and tone
    - Content structure and sections
    - Key points to cover
    - Style and format

    Previous context: ${JSON.stringify(this.context.messages)}
    
    Create a comprehensive plan that will guide the writing process.`;
  }

  protected processResponse(response: string): AgentResponse {
    try {
      const plan = JSON.parse(response) as NewsletterPlan;
      return {
        content: response,
        plan,
        metadata: {
          type: 'newsletter_plan',
          sections: plan.sections.length
        }
      };
    } catch (error) {
      return {
        content: response,
        error: 'Failed to parse newsletter plan'
      };
    }
  }
}
