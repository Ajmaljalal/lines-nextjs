import { MarketingEmailState } from "../types";

export async function designEmail(state: MarketingEmailState): Promise<MarketingEmailState> {
  return {
    ...state,
    stage: "design",
  };
}


