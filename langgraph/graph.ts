import { StateGraph, START, END } from "@langchain/langgraph";
import { MarketingEmailState, MarketingEmailStateSchema } from "./types";
import { collectInputs } from "./nodes/collectInputs";
import { draftContent } from "./nodes/draftContent";
import { designEmail } from "./nodes/designEmail";

export function buildMarketingEmailGraph() {
  const graph = new StateGraph<MarketingEmailState>({ channels: MarketingEmailStateSchema });

  graph
    .addNode("collectInputs", collectInputs)
    .addNode("draftContent", draftContent)
    .addNode("designEmail", designEmail);

  graph.addEdge(START, "collectInputs");
  graph.addEdge("collectInputs", "draftContent");
  graph.addEdge("draftContent", "designEmail");
  graph.addEdge("designEmail", END);

  return graph.compile();
}


