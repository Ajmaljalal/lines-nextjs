import { RouterAgent } from './agents/router_agent';
import { AgentContext } from './agents/types';

export async function testRouterAgent() {
    // Create a basic context
    const context: AgentContext = {
        messages: [],
        metadata: {},
        userId: '123',
        newsletterId: '456'
    };

    // Initialize the router agent
    const router = new RouterAgent(context);

    // Test cases - array of different prompts to test
    const testPrompts = [
        "Please write a new newsletter about AI developments",
        "Please remove the first article and also change the title of the second article to 'AI is changing the world'",
        "Awesome, please now design the newsletter",
        "change the theme and colors to a more modern and colorful one",
        "Send this newsletter to my subscribers"
    ];

    // Test each prompt
    for (const prompt of testPrompts) {
        console.log("\n---Testing prompt:", prompt, "---");
        try {
            const result = await router.execute(prompt);
            console.log("Router Response:", result);
        } catch (error) {
            console.error("Error:", error);
        }
    }
}
