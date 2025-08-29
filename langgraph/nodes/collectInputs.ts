import { MarketingEmailState } from "../types";

export async function collectInputs(state: MarketingEmailState): Promise<MarketingEmailState> {
  return {
    ...state,
    stage: "collect",
  };
}


