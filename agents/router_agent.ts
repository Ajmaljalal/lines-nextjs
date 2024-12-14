import { z } from "zod";
import { BaseAgent } from './base';
import { AgentContext, AgentResponse } from './types';
import { ChatGroq } from '@langchain/groq';

// Define the schema for router response
const routerResponseSchema = z.object({
  agent: z.enum(['content_writer', 'content_editor', 'html_designer', 'html_editor', 'newsletter_sender'] as const),
  task: z.enum(['write_content', 'edit_content', 'design_html', 'edit_html', 'send_newsletter'] as const)
});

export class RouterAgent extends BaseAgent {
  private model: ChatGroq;

  constructor(context: AgentContext) {
    super(context);
    this.model = new ChatGroq({
      temperature: 0,
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
    });
  }

  protected generatePrompt(): string {
    return `As an AI task router, analyze the user's input and determine the most appropriate agent to handle it.
    Choose from these agents:
    - content_writer: Writes a draft newsletter content based on provided raw string content
    - content_editor: Reviews and improves existing draft newsletter content based user feedback
    - html_designer: Puts draft newsletter content into HTML format
    - html_editor: Reviews and improves existing HTML newsletter content based user feedback
    - newsletter_sender: Sends the newsletter to the provided email address
    - general_assistant: General assistant for any other tasks that are are related to the newsletter but not covered by the other agents
    
    Previous context: ${JSON.stringify(this.context.messages)}

    Respond with:
    - agent: The agent role (content_writer, content_editor, html_designer, html_editor, newsletter_sender, general_assistant)
    - task: the task (write_content, edit_content, design_html, edit_html, send_newsletter)
    
    Examples:
    user: Please write a new newsletter about AI developments
    agent: content_writer
    task: write_content

    user: Please remove the first article and also change the title of the second article to 'AI is changing the world'
    agent: content_editor
    task: edit_content

    user: Awesome, please now design the newsletter
    agent: html_designer
    task: design_html

    user: change the theme and colors to a more modern and colorful one
    agent: html_editor
    task: edit_html

    user: Send this newsletter to my subscribers
    agent: newsletter_sender
    task: send_newsletter
    `;


  }

  public async execute(input?: string): Promise<AgentResponse> {
    try {
      if (input) {
        this.context.messages.push({
          role: 'user',
          content: input,
          type: 'user'
        });
      }

      const prompt = this.generatePrompt();
      const messages = this.context.messages.map(msg => ({
        ...msg,
        type: msg.role
      }));

      // Create a structured output chain
      const structuredModel = this.model.withStructuredOutput(routerResponseSchema);

      // Call the model with structured output
      const response = await structuredModel.invoke([
        ...messages,
        { role: 'user', content: prompt, type: 'user' }
      ]);

      // The result will be automatically validated against the schema

      this.context.messages.push({
        role: 'assistant',
        content: JSON.stringify(response),
        type: 'assistant'
      });

      return {
        content: JSON.stringify(response),
        metadata: {
          type: 'router_decision',
          selectedAgent: response.agent,
          task: response.task
        }
      };
    } catch (error) {
      console.error('Router agent execution error:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  protected processResponse(response: string): AgentResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        content: response,
        metadata: {
          type: 'router_decision',
          selectedAgent: parsed.agent,
          task: parsed.task
        }
      };
    } catch (error) {
      return {
        content: response,
        error: 'Failed to parse router response'
      };
    }
  }
}
