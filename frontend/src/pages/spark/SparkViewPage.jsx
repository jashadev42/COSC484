// src/pages/spark/SparkViewPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext.jsx";
import { useSocket } from "@contexts/SocketContext.jsx";

const phaseCopy = {
  idle: "Ready to search",
  joining: "Starting matchmaking…",
  searching: "Searching for a live match",
  host_waiting: "You are hosting a room",
  matched: "Match found!",
  leaving: "Leaving queue…",
  error: "Something went wrong",
};

const defaultConfig = {
  timeout_seconds: 15,
  poll_interval_seconds: 3,
};

export default function SparkViewPage() {
  const { fetchWithAuth } = useAuth();
  const {
    isConnected: socketReady,
    status: socketStatus,
    emit,
    subscribe,
    unsubscribe,
  } = useSocket();

  const [config, setConfig] = useState(defaultConfig);
  const [queuePhase, setQueuePhase] = useState("idle");
  const [queueEntry, setQueueEntry] = useState(null);
  const [queueError, setQueueError] = useState("");
  const [lastPoll, setLastPoll] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionAck, setSessionAck] = useState("");
  const [pendingSessionId, setPendingSessionId] = useState(null);

  const pollTimerRef = useRef(null);

  const pollIntervalMs = useMemo(
    () => (config?.poll_interval_seconds ?? defaultConfig.poll_interval_seconds) * 1000,
    [config?.poll_interval_seconds]
  );

  const runAuthedRequest = useCallback(
    async (path, init) => {
      const res = await fetchWithAuth(path, init);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data?.detail ||
          data?.message ||
          data?.error ||
          res.statusText ||
          "Request failed";
        throw new Error(message);
      }

      return data;
    },
    [fetchWithAuth]
  );

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const ensureSessionJoin = useCallback(
    (sessionId) => {
      if (!sessionId) return;
      if (socketReady) {
        emit("join_session", { session_id: sessionId });
      } else {
        setPendingSessionId(sessionId);
      }
    },
    [socketReady, emit]
  );

  useEffect(() => {
    if (pendingSessionId && socketReady) {
      emit("join_session", { session_id: pendingSessionId });
      setPendingSessionId(null);
    }
  }, [pendingSessionId, socketReady, emit]);

  const pollOnce = useCallback(async () => {
    try {
      const data = await runAuthedRequest("/matchmaking/me/poll");
      setLastPoll(data);

      if (data.status === "searching") {
        setQueuePhase("searching");
        return;
      }

      if (data.status === "matched") {
        stopPolling();
        setQueuePhase("matched");
        setCurrentSession(data.session ?? null);
        ensureSessionJoin(data.session?.id);
        return;
      }

      if (data.status === "timeout") {
        stopPolling();
        setQueuePhase("host_waiting");
        setCurrentSession(data.session ?? null);
        ensureSessionJoin(data.session?.id);
        return;
      }

      if (data.status === "cancelled") {
        stopPolling();
        setQueuePhase("idle");
        setQueueEntry(null);
        setCurrentSession(null);
        return;
      }
    } catch (error) {
      stopPolling();
      setQueuePhase("error");
      setQueueError(error.message || "Failed to poll matchmaking");
    }
  }, [ensureSessionJoin, runAuthedRequest, stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollOnce();
    pollTimerRef.current = setInterval(pollOnce, pollIntervalMs);
  }, [pollIntervalMs, pollOnce, stopPolling]);

  const joinQueue = useCallback(async () => {
    setQueueError("");
    setSessionAck("");
    setCurrentSession(null);
    setQueuePhase("joining");

    try {
      const data = await runAuthedRequest("/matchmaking/me/join", {
        method: "POST",
      });

      setQueueEntry(data.queue_entry ?? null);
      setQueuePhase("searching");
      startPolling();
    } catch (error) {
      setQueuePhase("idle");
      setQueueError(error.message || "Failed to join matchmaking queue");
    }
  }, [runAuthedRequest, startPolling]);

  const leaveQueue = useCallback(async () => {
    setQueueError("");
    setQueuePhase("leaving");
    stopPolling();

    try {
      await runAuthedRequest("/matchmaking/me/queue", { method: "DELETE" });
      setQueueEntry(null);
      setCurrentSession(null);
      setLastPoll(null);
      setQueuePhase("idle");
    } catch (error) {
      setQueuePhase("error");
      setQueueError(error.message || "Unable to leave matchmaking queue");
    }
  }, [runAuthedRequest, stopPolling]);

  const handleMatchFoundEvent = useCallback(
    (payload) => {
      setQueuePhase("matched");
      setCurrentSession((prev) =>
        prev ?? {
          id: payload?.session_id,
          guest_uid: payload?.guest_uid,
        }
      );
      ensureSessionJoin(payload?.session_id);
    },
    [ensureSessionJoin]
  );

  useEffect(() => {
    const unsubscribes = [
      { event: "match_found", handler: handleMatchFoundEvent },
      {
        event: "session_joined",
        handler: (payload) =>
          setSessionAck(`Joined live session ${payload?.session_id}`),
      },
      {
        event: "session_left",
        handler: (payload) =>
          setSessionAck(`Left session ${payload?.session_id}`),
      },
      {
        event: "error",
        handler: (payload) =>
          setQueueError(payload?.message || "Socket error"),
      },
    ];

    unsubscribes.forEach(({ event, handler }) => subscribe(event, handler));
    return () => {
      unsubscribes.forEach(({ event, handler }) => unsubscribe(event, handler));
    };
  }, [handleMatchFoundEvent, subscribe, unsubscribe]);

  useEffect(() => {
    let isMounted = true;
    runAuthedRequest("/matchmaking/config")
      .then((data) => {
        if (isMounted) setConfig((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [runAuthedRequest]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const queueStatusLabel = phaseCopy[queuePhase] ?? queuePhase;
  const canJoinQueue = queuePhase === "idle" || queuePhase === "error";
  const canLeaveQueue = ["searching", "host_waiting"].includes(queuePhase);
  const sessionReady = queuePhase === "matched" || queuePhase === "host_waiting";
  const searchingCountdown =
    queuePhase === "searching" && typeof lastPoll?.time_remaining === "number"
      ? lastPoll.time_remaining
      : null;

  const sessionIdDisplay = currentSession?.id ?? "—";

  return (
    <div className="h-full w-full px-4 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Choose your Spark</h1>
        <p className="text-sm text-neutral-400">
          Match live with someone who is online right now.
        </p>
      </header>

      <section className="space-y-4">
        <button
          className="w-full rounded-2xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition"
          type="button"
          onClick={joinQueue}
          disabled={!canJoinQueue}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-white">Normal mode</h2>
              <p className="text-sm text-neutral-400">
                Standard matchmaking. We&apos;ll look for someone compatible
                based on your prefs.
              </p>
            </div>
            <span className="text-xs text-emerald-400">
              {queuePhase === "searching" ? "Searching…" : "Tap to start"}
            </span>
          </div>
        </button>

        <button
          className="w-full rounded-2xl bg-neutral-900 px-4 py-4 text-left hover:bg-neutral-800 transition opacity-50 cursor-not-allowed"
          type="button"
          disabled
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-white">Speed dating</h2>
              <p className="text-sm text-neutral-400">
                Coming soon — rapid-fire three minute sessions.
              </p>
            </div>
            <span className="text-xs text-neutral-500">Soon</span>
          </div>
        </button>
      </section>

      <section className="rounded-3xl border border-neutral-800 px-5 py-6 space-y-4 bg-black/40">
        <header className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.4em] text-neutral-500">
            Live matchmaking
          </span>
          <h3 className="text-xl font-semibold text-white">{queueStatusLabel}</h3>
          <p className="text-sm text-neutral-400">
            Timeout {config.timeout_seconds}s • Poll every{" "}
            {config.poll_interval_seconds}s
          </p>
        </header>

        <div className="grid gap-3 text-sm text-neutral-300">
          <div className="flex items-center justify-between">
            <span>Socket</span>
            <span
              className={`font-mono ${
                socketReady ? "text-emerald-400" : "text-neutral-500"
              }`}
            >
              {socketStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>In queue since</span>
            <span className="font-mono">
              {queueEntry?.enqueued_at
                ? new Date(queueEntry.enqueued_at).toLocaleTimeString()
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Countdown</span>
            <span className="font-mono">
              {searchingCountdown !== null
                ? `${searchingCountdown}s`
                : queuePhase === "host_waiting"
                ? "Hosting"
                : "—"}
            </span>
          </div>
        </div>

        {queueError && (
          <p className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {queueError}
          </p>
        )}

        {sessionAck && (
          <p className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {sessionAck}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={joinQueue}
            disabled={!canJoinQueue}
            className="flex-1 rounded-2xl bg-white text-black font-semibold px-4 py-3 disabled:opacity-30"
          >
            Go live
          </button>
          <button
            type="button"
            onClick={leaveQueue}
            disabled={!canLeaveQueue}
            className="flex-1 rounded-2xl border border-neutral-700 px-4 py-3 text-sm text-neutral-200 disabled:opacity-30"
          >
            Leave queue
          </button>
        </div>

        {sessionReady && (
          <div className="space-y-2 rounded-2xl border border-neutral-700 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-neutral-300">
              <span>Session</span>
              <span className="font-mono">{sessionIdDisplay}</span>
            </div>
            <p className="text-xs text-neutral-400">
              We already pinged the socket to join the room. Head to chats to
              start talking.
            </p>
            <Link
              to="/app/chats"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300"
            >
              Open chats
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
