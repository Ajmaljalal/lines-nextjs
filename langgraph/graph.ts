import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { MarketingEmailStateSchema } from "./types";
import { collectInputs } from "./nodes/collectInputs";
import { draftContent } from "./nodes/draftContent";
import { designEmail } from "./nodes/designEmail";

export function buildMarketingEmailGraph() {
  const checkpointer = new MemorySaver();

  const builder = new StateGraph(MarketingEmailStateSchema)
    .addNode("collectInputs", collectInputs)
    .addNode("draftContent", draftContent)
    .addNode("designEmail", designEmail)
    .addEdge(START, "collectInputs")
    .addEdge("collectInputs", "draftContent")
    .addEdge("draftContent", "designEmail")
    .addEdge("designEmail", END);

  return builder.compile({ checkpointer });
}


