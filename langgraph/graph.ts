import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { MarketingEmailStateSchema, MarketingEmailState } from "./types";
import { collectInputs } from "./nodes/collectInputs";
import { draftContent } from "./nodes/draftContent";
import { designEmail } from "./nodes/designEmail";

// Conditional routing functions based on completion flags
function shouldProceedToDraft(state: MarketingEmailState): string {
  return state.inputCollectionComplete ? "draftContent" : END;
}

function shouldProceedToDesign(state: MarketingEmailState): string {
  return state.contentDraftComplete ? "designEmail" : END;
}

export function buildMarketingEmailGraph() {
  const checkpointer = new MemorySaver();

  const builder = new StateGraph(MarketingEmailStateSchema)
    .addNode("collectInputs", collectInputs)
    .addNode("draftContent", draftContent)
    .addNode("designEmail", designEmail)
    .addEdge(START, "collectInputs")
    .addConditionalEdges("collectInputs", shouldProceedToDraft, {
      "draftContent": "draftContent",
      [END]: END
    })
    .addConditionalEdges("draftContent", shouldProceedToDesign, {
      "designEmail": "designEmail",
      [END]: END
    })
    .addEdge("designEmail", END);

  return builder.compile({ checkpointer });
}


