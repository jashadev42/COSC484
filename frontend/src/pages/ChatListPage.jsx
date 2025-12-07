import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@contexts/SocketContext.jsx";

const getLogId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function ChatListPage() {
  const { isConnected, status, emit, subscribe, unsubscribe } = useSocket();
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [logs, setLogs] = useState([]);

  const appendLog = useCallback((entry) => {
    setLogs((prev) => [
      {
        id: getLogId(),
        ts: new Date().toLocaleTimeString(),
        ...entry,
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    const handleSessionJoined = (payload) => {
      setActiveSessionId(payload?.session_id ?? null);
      appendLog({ type: "session", text: `Joined session ${payload?.session_id}` });
    };

    const handleSessionLeft = (payload) => {
      if (activeSessionId === payload?.session_id) {
        setActiveSessionId(null);
      }
      appendLog({ type: "session", text: `Left session ${payload?.session_id}` });
    };

    const handleChatReceived = (payload) => {
      appendLog({
        type: "chat",
        text: `[${payload?.session_id}] ${payload?.author_uid}: ${payload?.content}`,
      });
    };

    const handleError = (payload) => {
      appendLog({ type: "error", text: payload?.message ?? "Unknown socket error" });
    };

    subscribe("session_joined", handleSessionJoined);
    subscribe("session_left", handleSessionLeft);
    subscribe("chat_received", handleChatReceived);
    subscribe("error", handleError);

    return () => {
      unsubscribe("session_joined", handleSessionJoined);
      unsubscribe("session_left", handleSessionLeft);
      unsubscribe("chat_received", handleChatReceived);
      unsubscribe("error", handleError);
    };
  }, [subscribe, unsubscribe, appendLog, activeSessionId]);

  const canSendMessage = useMemo(
    () => Boolean(isConnected && activeSessionId && messageInput.trim()),
    [isConnected, activeSessionId, messageInput]
  );

  const joinSession = useCallback(() => {
    if (!sessionIdInput.trim()) {
      appendLog({ type: "error", text: "Session ID required" });
      return;
    }
    emit("join_session", { session_id: sessionIdInput.trim() });
  }, [sessionIdInput, emit, appendLog]);

  const leaveSession = useCallback(() => {
    if (!activeSessionId) return;
    emit("leave_session", { session_id: activeSessionId });
  }, [activeSessionId, emit]);

  const sendMessage = useCallback(() => {
    if (!canSendMessage) return;
    emit("chat_message", {
      session_id: activeSessionId,
      content: messageInput.trim(),
    });
    setMessageInput("");
  }, [emit, activeSessionId, messageInput, canSendMessage]);

  return (
    <div className="h-full w-full px-4 py-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Chats</h1>
        <p className="text-xs text-neutral-500">
          Socket status: <span className="font-mono">{status}</span>
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">
          Session Controls
        </h2>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            placeholder="Active session UUID"
            className="flex-1 rounded-xl bg-neutral-900 px-3 py-2 text-sm"
            value={sessionIdInput}
            onChange={(e) => setSessionIdInput(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl border border-emerald-600 px-3 py-2 text-sm text-emerald-400 disabled:opacity-40"
              disabled={!isConnected}
              onClick={joinSession}
            >
              Join
            </button>
            <button
              type="button"
              className="rounded-xl border border-red-600 px-3 py-2 text-sm text-red-400 disabled:opacity-40"
              disabled={!isConnected || !activeSessionId}
              onClick={leaveSession}
            >
              Leave
            </button>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Connected session: <span className="font-mono">{activeSessionId ?? "—"}</span>
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-800 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">
          Send Message
        </h2>
        <textarea
          rows={2}
          className="w-full rounded-xl bg-neutral-900 px-3 py-2 text-sm"
          placeholder="Type something to send to chat_message…"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button
          type="button"
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          disabled={!canSendMessage}
          onClick={sendMessage}
        >
          Emit chat_message
        </button>
      </section>

      <section className="space-y-2 rounded-2xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300 uppercase">
            Live Log
          </h2>
          <span className="text-xs text-neutral-500">{logs.length} events</span>
        </div>
        <ul className="space-y-2 text-sm">
          {logs.length === 0 && (
            <li className="text-neutral-600">No events yet. Join a session to see activity.</li>
          )}
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded-xl bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-200"
            >
              [{log.ts}] {log.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
