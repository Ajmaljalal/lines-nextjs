## LangGraph Marketing Email Generator — Implementation Plan

### 1) Goal & Scope
- Build a LangGraph-based agent that:
  - Collects user inputs (topic, content, URLs, images, brand look/style, audience).
  - Enriches content via URL extraction (and optional web search if desired).
  - Drafts persuasive marketing email copy adapted to audience and brand.
  - Assembles production-ready HTML suitable for common email clients.
  - Returns artifacts: subject, preheader, HTML, and metadata.

### 2) High-level Architecture
- Agent: LangGraph graph orchestrating nodes for normalization, data collection, enrichment, drafting, design, assembly, QA, and finalize.
- Model provider: OpenAI (default), configurable via env (can swap to others).
- Tools/services (reuse existing where possible):
  - URL extraction via existing service (see `services/api/url-extraction-service.ts` and `app/api/services/url-extraction/route.ts`).
  - Web search (optional) via existing Tavily service.
  - HTML generation leveraging current HTML generation service or new templating with inline CSS for email clients.
- API: `app/api/agents/marketing-email/route.ts` to trigger/stream runs.
- Storage: Firestore (existing `config/firebase*`) for optional run persistence and saved outputs.
- UI: Integrate with existing steps flow (`components/steps/*`) and chat context as needed.

### 3) Dependencies
Add these packages (exact versions optional; pin in `package.json` as desired):
- Core graph/LLM:
  - `@langchain/langgraph`
  - `@langchain/core`
  - `@langchain/openai`
  - `zod` (schema validation for state)
- Email HTML utilities:
  - `juice` (inline CSS)
  - `html-to-text` (plaintext fallback)
  - `sanitize-html` (defensive sanitization)
- Optional helpers:
  - `linkedom` or `jsdom` (DOM parsing if needed)

Installation (non-interactive):
- npm i @langchain/langgraph @langchain/core @langchain/openai zod juice html-to-text sanitize-html

### 4) State & Types
Create or extend shared types for the agent state.
- Location: `server/agents/marketing-email/types.ts` (new) and reuse `lines/agents/types.ts` where appropriate.
- `MarketingEmailState` (Zod schema + TS type):
  - Inputs:
    - `topic: string`
    - `audience: string | undefined`
    - `contentDraft: string | undefined`
    - `urls: string[] | undefined`
    - `images: { url: string; alt?: string }[] | undefined`
    - `brandStyle: { tone?: string; palette?: string[]; fonts?: string[]; logoUrl?: string } | undefined`
    - `constraints: { maxLength?: number; complianceNotes?: string } | undefined`
  - Working data:
    - `extractedFacts: string[]`
    - `researchNotes: string | undefined`
    - `draftCopy: { subject: string; preheader: string; bodyMarkdown: string } | undefined`
    - `selectedTemplateKey: string | undefined`
    - `compiledHtml: string | undefined`
    - `plainText: string | undefined`
    - `warnings: string[]`
  - Output:
    - `result: { subject: string; preheader: string; html: string; text: string; metadata?: Record<string, unknown> } | undefined`

### 5) Graph Nodes
Implement as pure functions taking `(state) => updatedState`. Keep side-effects contained in service wrappers.
- `normalizeInputs`:
  - Validate with Zod; trim strings; dedupe URLs; basic URL validation.
  - Decide next edge: if missing required inputs, branch to `collectMissingInputs` (optional, see UI integration).
- `collectMissingInputs` (optional human-in-the-loop):
  - If UI flow already ensures completeness, skip this node.
- `extractFromUrls`:
  - Call existing URL extraction service; merge unique facts/quotes/snippets into `extractedFacts`.
- `optionalWebSearch` (if enabled via flag):
  - Use existing Tavily web search; add brief bullets to `researchNotes`.
- `draftContent`:
  - Prompt LLM with topic, audience, `extractedFacts`, `researchNotes`, and any `contentDraft`.
  - Produce: subject, preheader, and body in Markdown (sections, bullets, CTA, social proof).
- `selectDesign`:
  - Choose `selectedTemplateKey` based on `brandStyle` (fall back to default).
- `assembleHtml`:
  - Convert Markdown to HTML blocks (can do lightweight conversion or rely on model to output HTML blocks directly).
  - Merge with template partials (header/footer/CTA), insert logo, brand colors, fonts.
  - Inline CSS via `juice`.
  - Add CID-safe or absolute `images` with proper `alt`.
- `validateEmailHtml`:
  - Basic linting: total size, disallowed CSS, missing alt text, unoptimized images.
  - Create plaintext fallback with `html-to-text`.
  - Append any `warnings`.
- `reviseIfNeeded`:
  - If constraints violated (length, missing CTA), lightly prompt model to revise `draftCopy` or adjust HTML.
- `finalize`:
  - Set `result = { subject, preheader, html, text, metadata }` and return.

### 6) Graph Topology
- Start → `normalizeInputs`
- Conditional: needs URLs? → `extractFromUrls` else skip
- Optional: `optionalWebSearch` if flag enabled
- Then `draftContent` → `selectDesign` → `assembleHtml` → `validateEmailHtml`
- Conditional: issues found? → `reviseIfNeeded` → back to `assembleHtml` | else → `finalize`
- End

### 7) Graph Construction (Outline)
- File: `server/agents/marketing-email/graph.ts`
```ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { MarketingEmailStateSchema, MarketingEmailState } from "./types";

export function buildMarketingEmailGraph() {
  const graph = new StateGraph<MarketingEmailState>({ channels: MarketingEmailStateSchema });

  graph
    .addNode("normalizeInputs", normalizeInputs)
    .addNode("extractFromUrls", extractFromUrls)
    .addNode("optionalWebSearch", optionalWebSearch)
    .addNode("draftContent", draftContent)
    .addNode("selectDesign", selectDesign)
    .addNode("assembleHtml", assembleHtml)
    .addNode("validateEmailHtml", validateEmailHtml)
    .addNode("reviseIfNeeded", reviseIfNeeded)
    .addNode("finalize", finalize);

  graph.addEdge(START, "normalizeInputs");

  graph.addConditionalEdges("normalizeInputs", decideAfterNormalize, {
    need_urls: "extractFromUrls",
    skip_urls: "draftContent",
  });

  graph.addEdge("extractFromUrls", "draftContent");

  graph.addConditionalEdges("draftContent", () => "selectDesign", { selectDesign: "selectDesign" });
  graph.addEdge("selectDesign", "assembleHtml");
  graph.addEdge("assembleHtml", "validateEmailHtml");

  graph.addConditionalEdges("validateEmailHtml", decideAfterValidation, {
    revise: "reviseIfNeeded",
    done: "finalize",
  });

  graph.addEdge("reviseIfNeeded", "assembleHtml");
  graph.addEdge("finalize", END);

  return graph.compile();
}
```

### 8) Prompts & Tools
- Prompts:
  - `draftContent` system/developer prompt: role, tone, compliance, brand guardrails.
  - Few-shot examples for structure (subject, preheader, headline, body sections, CTA, footer).
  - Compact revision prompt for `reviseIfNeeded`.
- Tool wrappers (if using LangChain Tools):
  - `fetchUrlsTool` → wraps existing URL extraction HTTP endpoint or internal service.
  - `webSearchTool` → wraps Tavily service.

### 9) Templates & Styling
- Directory: `server/agents/marketing-email/templates/`
  - `base.html` (table layout, safe CSS)
  - `themes/default.ts` (colors, fonts, button styles) and optional brand-driven themes.
- Composition:
  - Keep layout table-based; avoid unsupported CSS.
  - Inline all CSS with `juice`.
  - Provide light/dark friendly color sets if feasible; prioritize deliverability.

### 10) API Endpoint
- File: `app/api/agents/marketing-email/route.ts`
  - `POST` accepts `MarketingEmailState` inputs (subset: topic, audience, contentDraft, urls, images, brandStyle, constraints).
  - Starts a graph run; stream intermediate events or return final result with optional `warnings`.
  - Auth middleware from `lib/auth-middleware.ts`.
  - Consistent error formatting via `lib/error-handler.ts`.

### 11) Services Layer
- File: `services/agent-service.ts` (extend or new `services/marketingEmailService.ts`)
  - `runMarketingEmailAgent(inputs)` → orchestrates graph, returns output.
  - Optionally persist run metadata and outputs via Firestore.

### 12) UI Integration
- Reuse existing step components:
  - Map to: `Step_1_DataCollection` (inputs), `Step_2_ContentDrafting` (preview draft), `Step_3_HtmlPreview` (render compiled HTML), `Step_4_SendEmail`.
- Add option to select “Marketing Email Agent” in UI (e.g., new entry or toggle in `components/layouts/NavigationBar.tsx` or relevant screen) to route flows to the new API endpoint.
- Show warnings and plaintext preview; enable quick edits before send.

### 13) Environment & Config
- Env vars: `OPENAI_API_KEY` (or other provider keys), feature flags like `ENABLE_MARKETING_WEB_SEARCH`.
- `next.config.mjs`: ensure any needed remote image domains are allowed.
- Vercel: confirm `vercel.json` routes do not conflict; add env vars.

### 14) Testing Strategy
- Unit tests (node functions):
  - `normalizeInputs`, `extractFromUrls` (mock service), `draftContent` (prompt shape), `assembleHtml`, `validateEmailHtml`.
- Integration tests:
  - Full happy path with fixed small inputs (deterministic via low temperature and seeded prompts where possible).
- Snapshot tests for HTML (allow minor diffs only in dynamic fields like dates).

### 15) Observability & Errors
- Use existing `server/utils/logger.ts` and `server/utils/error-handler.ts`.
- Emit node-level timings and token usage estimates where available.
- Surface actionable error messages to UI (invalid URL, oversized images, etc.).

### 16) Security & Compliance
- Sanitize user-provided HTML/URLs with `sanitize-html` and strict URL validation.
- Timeouts and size caps on fetch/extraction.
- Strip tracking pixels unless explicitly enabled by user.
- Ensure PII-safe prompts; provide opt-outs.

### 17) Rollout Plan
- Feature flag the new agent in UI.
- Dogfood internally; validate on multiple email clients (Gmail, Outlook, Apple Mail).
- Gradual rollout to subset of users; monitor feedback and deliverability metrics.

### 18) Deliverables Checklist
- server/agents/marketing-email/
  - `types.ts` (state schema, TS types)
  - `graph.ts` (graph construction)
  - `nodes/` (normalize, extractFromUrls, draftContent, selectDesign, assembleHtml, validateEmailHtml, reviseIfNeeded, finalize)
  - `templates/` (base and themes)
- app/api/agents/marketing-email/
  - `route.ts` (POST; stream or return final)
- services/
  - `marketingEmailService.ts` (runner + persistence)
- UI wiring to existing steps, plus a switch to use this agent
- Tests: unit + integration + HTML snapshot
- Docs: this `plan.md`, plus README section for setup and usage

### 19) Initial Timeline (suggested)
- Day 1: Types, graph skeleton, normalize/extract nodes.
- Day 2: Drafting prompts, design selection, basic template.
- Day 3: HTML assembly with inlining, validation, plaintext fallback.
- Day 4: API route, service wrapper, integration test.
- Day 5: UI wiring, polish, docs, and rollout gating.

---
This plan is tailored to the current repo to maximize reuse of existing services and step components while introducing a robust LangGraph agent for marketing email generation.
