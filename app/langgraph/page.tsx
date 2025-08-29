"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function LangGraphTesterPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [finalHtml, setFinalHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const pushAssistant = (content: string) => setMessages((m) => [...m, { role: "assistant", content }]);
  const pushUser = (content: string) => setMessages((m) => [...m, { role: "user", content }]);

  const callApi = useCallback(async (payload: any) => {
    const res = await fetch("/api/agents/marketing-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Request failed");
    }
    return res.json();
  }, []);

  const startSession = useCallback(async () => {
    try {
      setLoading(true);
      setFinalHtml(null);
      setMessages([]);
      const r = await callApi({ input: {} });
      setThreadId(r.threadId);
      if (r.interrupt) {
        const val = r.interrupt?.[0]?.value;
        const q = typeof val === "string" ? val : val?.question;
        const draft = typeof val === "object" && val?.draft ? `\n\n${val.draft}` : "";
        pushAssistant((q || "Please provide input") + draft);
      } else if (r.state?.finalHtml) {
        setFinalHtml(r.state.finalHtml);
      }
    } catch (e: any) {
      pushAssistant(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  const sendReply = useCallback(async () => {
    if (!threadId) return;
    const value = inputRef.current?.value || "";
    if (!value) return;
    try {
      setLoading(true);
      pushUser(value);
      const r = await callApi({ threadId, resume: value });
      if (r.interrupt) {
        const val = r.interrupt?.[0]?.value;
        const q = typeof val === "string" ? val : val?.question;
        const draft = typeof val === "object" && val?.draft ? `\n\n${val.draft}` : "";
        pushAssistant((q || "Please provide input") + draft);
      } else if (r.state?.finalHtml) {
        setFinalHtml(r.state.finalHtml);
      }
      inputRef.current && (inputRef.current.value = "");
    } catch (e: any) {
      pushAssistant(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [callApi, threadId]);

  // Auto-start session on mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">LangGraph Marketing Email (MVP)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col h-[80vh] border rounded">
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "assistant" ? "text-gray-800" : "text-blue-700"}>
                <div className="text-xs uppercase mb-1">{m.role}</div>
                <div className="whitespace-pre-wrap text-sm">{m.content}</div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 space-y-2">
            <textarea
              ref={inputRef}
              className="w-full border rounded p-3 min-h-[80px]"
              placeholder="Type your reply (topic, audience, URLs, 'approve', etc.)"
              disabled={!threadId || loading}
            />
            <div className="flex gap-2">
              <button
                onClick={sendReply}
                className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                disabled={loading || !threadId}
              >
                Send
              </button>
              <button
                onClick={() => {
                  if (!threadId) return;
                  inputRef.current && (inputRef.current.value = "approve");
                  sendReply();
                }}
                className="px-4 py-2 rounded border"
                disabled={loading || !threadId}
              >
                Approve Draft
              </button>
            </div>
          </div>
        </div>
        {finalHtml && (
          <div className="h-[80vh] border rounded overflow-hidden">
            <div className="border-b p-2 text-sm font-medium">HTML Preview</div>
            <iframe srcDoc={finalHtml} className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
}


