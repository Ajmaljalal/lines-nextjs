"use client";

import { useCallback, useRef, useState } from "react";

type InterruptPayload = any;

export default function LangGraphTesterPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [finalHtml, setFinalHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const appendLog = (msg: string) => setLog((l) => [msg, ...l]);

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
      setLog([]);
      const r = await callApi({ input: {} });
      setThreadId(r.threadId);
      appendLog("Session started");
      if (r.interrupt) {
        const q = typeof r.interrupt?.[0]?.value === "string" ? r.interrupt[0].value : r.interrupt?.[0]?.value?.question;
        setQuestion(q || "Please provide input");
      } else if (r.state?.finalHtml) {
        setFinalHtml(r.state.finalHtml);
      }
    } catch (e: any) {
      appendLog(`Error: ${e.message}`);
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
      const r = await callApi({ threadId, resume: value });
      if (r.interrupt) {
        const q = typeof r.interrupt?.[0]?.value === "string" ? r.interrupt[0].value : r.interrupt?.[0]?.value?.question;
        setQuestion(q || "Please provide input");
      } else if (r.state?.finalHtml) {
        setFinalHtml(r.state.finalHtml);
        setQuestion("");
      } else {
        setQuestion("");
      }
      inputRef.current && (inputRef.current.value = "");
    } catch (e: any) {
      appendLog(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [callApi, threadId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LangGraph Marketing Email (MVP)</h1>
        <button
          onClick={startSession}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Working..." : "Start New Session"}
        </button>
      </div>

      {question && (
        <div className="space-y-3">
          <div className="text-sm text-gray-700">{question}</div>
          <textarea
            ref={inputRef}
            className="w-full border rounded p-3 min-h-[100px]"
            placeholder="Type your reply (e.g., topic, audience, 'approve', etc.)"
          />
          <div className="flex gap-2">
            <button
              onClick={sendReply}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              disabled={loading || !threadId}
            >
              Send Reply
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
              Quick Approve
            </button>
          </div>
        </div>
      )}

      {finalHtml && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-medium mb-2">HTML Preview</h2>
            <div className="border rounded overflow-hidden">
              <iframe srcDoc={finalHtml} className="w-full h-[600px]" />
            </div>
          </div>
          <div>
            <h2 className="font-medium mb-2">Raw HTML</h2>
            <pre className="border rounded p-3 whitespace-pre-wrap text-xs">
              {finalHtml}
            </pre>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Logs</h2>
        <ul className="text-xs space-y-1">
          {log.map((l, i) => (
            <li key={i} className="text-gray-600">{l}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


