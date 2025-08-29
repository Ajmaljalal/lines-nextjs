import juice from "juice";
import sanitizeHtml from "sanitize-html";
import { getChatModel } from "../llm";
import { MarketingEmailState } from "../types";

export async function designEmail(state: MarketingEmailState): Promise<MarketingEmailState> {
  const chat = getChatModel();

  const system = `You are an expert email designer. Create production-ready, modern HTML emails that render well in Gmail, Outlook, and Apple Mail.
Requirements:
- Use table-based layout for reliability.
- Include responsive mobile-friendly structure where feasible.
- Inline CSS styles (or include <style> but ensure final HTML works when CSS is inlined).
- Respect brand tone, colors, fonts, and logo if provided; otherwise infer tasteful palette from content.
- Accessible: meaningful alt text for images, sufficient color contrast, semantic headings.
- Include a clear CTA button if content suggests one.
- Avoid JavaScript and external CSS. Prefer standard-safe attributes.
Output ONLY the HTML string.`;

  const input = {
    plainTextDraft: state.plainTextDraft ?? "",
    brandStyle: state.brandStyle ?? {},
    images: state.images ?? [],
    urls: state.urls ?? [],
  };

  const user = `Approved content and context (JSON):\n${JSON.stringify(input, null, 2)}\n\nPlease return only the final HTML.`;

  const ai = await chat.invoke([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const rawHtml = typeof ai.content === "string" ? ai.content : Array.isArray(ai.content) ? ai.content.map((c: any) => (typeof c === "string" ? c : c?.text ?? "")).join("\n") : String(ai.content ?? "");

  // Ensure inline CSS for email client compatibility
  const inlined = juice(rawHtml);

  // Sanitize while preserving inline styles and common email attributes
  const cleaned = sanitizeHtml(inlined, {
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedAttributes: {
      "*": [
        "style",
        "class",
        "align",
        "valign",
        "role",
        "aria-label",
        "aria-hidden",
        "width",
        "height",
        "border",
        "cellpadding",
        "cellspacing",
        "bgcolor",
        "color",
        "dir",
      ],
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height"],
      table: ["role", "cellpadding", "cellspacing", "border", "width", "align"],
      td: ["align", "valign", "width", "height", "colspan", "rowspan"],
      th: ["align", "valign", "colspan", "rowspan"],
      tr: ["align", "valign"],
    },
    // Permit typical email-safe tags. If absent, sanitize-html uses a conservative default.
    allowedTags: false as unknown as string[], // use library defaults and attribute rules
  });

  return {
    ...state,
    finalHtml: cleaned,
    stage: "design",
  };
}


