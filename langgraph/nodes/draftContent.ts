import { z } from "zod";
import { interrupt } from "@langchain/langgraph";
import { getChatModel } from "../llm";
import { MarketingEmailState } from "../types";

const DraftSchema = z.object({
  subject: z.string(),
  preheader: z.string(),
  body: z.string(),
});

export async function draftContent(state: MarketingEmailState): Promise<MarketingEmailState> {
  const chat = getChatModel();
  const system = `You are an expert marketing copywriter. Draft a concise email based on inputs.
Output JSON only matching the schema: { subject, preheader, body }.
Use brand tone if provided. Keep body as plain text with short paragraphs and bullets.`;

  const prompt = `Inputs:
topic: ${state.topic ?? ""}
audience: ${state.audience ?? ""}
urls: ${(state.urls ?? []).join(", ")}
images: ${JSON.stringify(state.images ?? [])}
brandStyle: ${JSON.stringify(state.brandStyle ?? {})}
seedDraft: ${state.contentDraft ?? ""}`;

  const draft = await chat.withStructuredOutput(DraftSchema).invoke([
    { role: "system", content: system },
    { role: "user", content: prompt },
  ]);

  const plainTextDraft = `Subject: ${draft.subject}\nPreheader: ${draft.preheader}\n\n${draft.body}`;

  const approval = interrupt({
    question: "Review the draft. Reply 'approve' to proceed or provide edits.",
    draft: plainTextDraft,
  });

  const finalPlain = typeof approval === "string" && approval.trim().toLowerCase() === "approve"
    ? plainTextDraft
    : String(approval ?? plainTextDraft);

  return {
    ...state,
    plainTextDraft: finalPlain,
    confirmedPlainText: typeof approval === "string" && approval.trim().toLowerCase() === "approve",
    stage: "draft",
  };
}


