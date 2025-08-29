import { MarketingEmailState } from "../types";

export async function draftContent(state: MarketingEmailState): Promise<MarketingEmailState> {
  return {
    ...state,
    stage: "draft",
  };
}


