import { ChatOpenAI } from "@langchain/openai";

export function getChatModel() {
  const modelName = process.env.OPENAI_MODEL || "gpt-4o";
  const temperature = Number(process.env.OPENAI_TEMPERATURE ?? 0.5);
  return new ChatOpenAI({ model: modelName, temperature });
}


