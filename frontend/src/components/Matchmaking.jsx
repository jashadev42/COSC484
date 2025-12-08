import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@contexts/SocketContext";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function Matchmaking() {
  const { session, fetchWithAuth } = useAuth();
  const { socket, isConnected, emit, subscribe, unsubscribe } = useSocket();
  const navigate = useNavigate();

  const [matchmakingState, setMatchmakingState] = useState("idle");
  const [sessionData, setSessionData] = useState(null);
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [config, setConfig] = useState({
    timeout_seconds: 15,
    poll_interval_seconds: 3,
  });
  const [matchStatus, setMatchStatus] = useState({
    youMatched: false,
    theyMatched: false,
    isMutual: false,
  });
  const [mutualMatchInfo, setMutualMatchInfo] = useState(null);

  const pollIntervalRef = useRef(null);
  const isSearchingRef = useRef(false);

  const currentUserId = session?.user?.id;
  const otherUserName = sessionData?.other_user_first_name || null;

  const loadMatchStatus = useCallback(
    async (sessionId) => {
      if (!sessionId || !currentUserId) return;
      try {
        const res = await fetchWithAuth(
          "/matchmaking/me/session/match-status"
        );
        if (!res.ok) return;
        const data = await res.json();
        setMatchStatus({
          youMatched: data.you_matched || false,
          theyMatched: data.they_matched || false,
          isMutual: data.is_mutual || false,
        });
      } catch (e) {
        console.error("Failed to load match status", e);
      }
    },
    [fetchWithAuth, currentUserId]
  );

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    isSearchingRef.current = false;
  }, []);

  const resetToIdle = useCallback(() => {
    stopPolling();
    setMatchmakingState("idle");
    setSessionData(null);
    setRole(null);
    setMessage("");
    setChatMessages([]);
    setTimeElapsed(0);
    setTimeRemaining((prev) => prev || 15);
    setError(null);
    setMatchStatus({ youMatched: false, theyMatched: false, isMutual: false });
    setMutualMatchInfo(null);
  }, [stopPolling]);

  const loadSessionChats = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/matchmaking/me/session/chats");
      if (!res.ok) return;
      const data = await res.json();
      setChatMessages(data || []);
    } catch (e) {
      console.error("Failed to load session chats", e);
    }
  }, [fetchWithAuth]);

  const transitionToSession = useCallback(
    async (sessionInfo, userRole) => {
      stopPolling();
      setSessionData(sessionInfo);
      setRole(userRole);

      if (isConnected && sessionInfo?.id) {
        emit("join_session", { session_id: sessionInfo.id });
      }

      await loadSessionChats();
      await loadMatchStatus(sessionInfo.id);

      setMatchmakingState("matched");
      setTimeout(() => setMatchmakingState("in_session"), 1500);
    },
    [stopPolling, isConnected, emit, loadSessionChats, loadMatchStatus]
  );

  const leaveSessionSilently = useCallback(async () => {
  try {
    stopPolling();
    const response = await fetchWithAuth("/matchmaking/me/exit", {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error leaving session");

    if (isConnected && sessionData) {
      emit("leave_session", { session_id: sessionData.id });
    }
  } catch (err) {
    console.error("Failed to leave session before continuing chat:", err);
  }
}, [stopPolling, fetchWithAuth, isConnected, emit, sessionData]);


  useEffect(() => {
    fetchWithAuth("/matchmaking/me/config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error);
  }, [fetchWithAuth]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChatReceived = (data) => {
      setChatMessages((prev) => [...prev, data]);
    };

    const handleSessionFound = async (data) => {
      stopPolling();
      const sessionInfo = {
        id: data.session_id,
        host_uid: data.role === "host" ? currentUserId : data.partner_uid,
        guest_uid: data.role === "guest" ? currentUserId : data.partner_uid,
        other_user_uid: data.partner_uid,
      };
      await transitionToSession(sessionInfo, data.role);
    };

    const handleMatchInteraction = (data) => {
      const isFromCurrentUser = data.from_uid === currentUserId;
      if (isFromCurrentUser) {
        setMatchStatus((prev) => ({
          ...prev,
          youMatched: true,
          isMutual: data.is_mutual,
        }));
      } else {
        setMatchStatus((prev) => ({
          ...prev,
          theyMatched: true,
          isMutual: data.is_mutual,
        }));
      }
    };

    const handleMutualMatch = (data) => {
      setMatchStatus({
        youMatched: true,
        theyMatched: true,
        isMutual: true,
      });

      if (data && data.chat_id) {
        setMutualMatchInfo({
          chatId: data.chat_id,
          partnerName: otherUserName || null,
        });
      }
    };

    subscribe("chat_received", handleChatReceived);
    subscribe("session_found", handleSessionFound);
    subscribe("match_interaction", handleMatchInteraction);
    subscribe("mutual_match", handleMutualMatch);

    return () => {
      unsubscribe("chat_received", handleChatReceived);
      unsubscribe("session_found", handleSessionFound);
      unsubscribe("match_interaction", handleMatchInteraction);
      unsubscribe("mutual_match", handleMutualMatch);
    };
  }, [
    socket,
    isConnected,
    currentUserId,
    subscribe,
    unsubscribe,
    transitionToSession,
    stopPolling,
    otherUserName,
  ]);

  const pollForMatch = useCallback(
    async () => {
      if (!isSearchingRef.current) return;

      try {
        const response = await fetchWithAuth("/matchmaking/me/poll");
        if (!response.ok) throw new Error("Failed to poll for match");

        const result = await response.json();
        if (result.time_elapsed !== undefined) setTimeElapsed(result.time_elapsed);
        if (result.time_remaining !== undefined)
          setTimeRemaining(result.time_remaining);

        switch (result.status) {
          case "searching":
            break;
          case "found":
          case "timeout":
            stopPolling();
            await transitionToSession(result.session, result.role);
            break;
          case "cancelled":
            if (result.message === "User not in queue and not in session") {
              resetToIdle();
            } else {
              stopPolling();
              setError("Matchmaking was cancelled");
              setMatchmakingState("idle");
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    },
    [fetchWithAuth, stopPolling, transitionToSession, resetToIdle]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetchWithAuth("/matchmaking/me/session");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.config) {
          setConfig(data.config);
        }

        if (data.state === "in_session") {
          await transitionToSession(data.session, data.role);
        } else if (data.state === "searching") {
          isSearchingRef.current = true;
          setMatchmakingState("searching");
          setTimeElapsed(data.time_elapsed);
          setTimeRemaining(data.time_remaining);

          if (!pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(
              () => pollForMatch(),
              data.config.poll_interval_seconds * 1000
            );
          }
        } else {
          resetToIdle();
        }
      } catch (e) {
        console.error("Initialization error:", e);
      }
    };

    init();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [fetchWithAuth, transitionToSession, resetToIdle, stopPolling, pollForMatch]);

  const matchUser = async () => {
    try {
      const response = await fetchWithAuth("/matchmaking/me/session/match", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to match user");
      setMatchStatus((prev) => ({ ...prev, youMatched: true }));
    } catch (error) {
      setError(error.message);
    }
  };

  const joinMatchmaking = async () => {
    try {
      setError(null);
      isSearchingRef.current = true;
      setMatchmakingState("searching");
      setTimeElapsed(0);
      setTimeRemaining(config.timeout_seconds);
      setChatMessages([]);

      const response = await fetchWithAuth("/matchmaking/me/join", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to join matchmaking");

      await pollForMatch();

      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(
          () => pollForMatch(),
          config.poll_interval_seconds * 1000
        );
      }
    } catch (err) {
      setError(err.message);
      resetToIdle();
    }
  };

  const cancelMatchmaking = async () => {
    try {
      stopPolling();
      await fetchWithAuth("/matchmaking/me/queue", { method: "DELETE" });
      resetToIdle();
    } catch (err) {
      console.error("Failed to cancel matchmaking:", err);
      setError(err.message);
    }
  };

  const leaveSession = async () => {
    try {
      stopPolling();
      const response = await fetchWithAuth("/matchmaking/me/session", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error leaving session");

      if (isConnected && sessionData) {
        emit("leave_session", { session_id: sessionData.id });
      }

      resetToIdle();
    } catch (err) {
      setError(err.message);
    }
  };

  const exitMatchmaking = async () => {
    try {
      stopPolling();
      const response = await fetchWithAuth("/matchmaking/me/exit", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to exit matchmaking");

      if (isConnected && sessionData) {
        emit("leave_session", { session_id: sessionData.id });
      }

      resetToIdle();
    } catch (err) {
      console.error("Exit matchmaking error:", err);
      resetToIdle();
      setError(err.message || "Error exiting matchmaking");
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !sessionData) return;
    emit("chat_message", {
      session_id: sessionData.id,
      content: message.trim(),
    });
    setMessage("");
  };

const handleContinueChat = async () => {
  if (!mutualMatchInfo?.chatId) return;
  const chatId = mutualMatchInfo.chatId;

  await leaveSessionSilently();
  resetToIdle();
  navigate(`/chats/${chatId}`);
};


  const handleContinueMatchmaking = async () => {
    if (sessionData && isConnected) {
      await leaveSessionSilently();
    }
    setMutualMatchInfo(null);
    resetToIdle();
    joinMatchmaking();
  };

  const renderMutualMatchModal = () => {
    if (!mutualMatchInfo) return null;
    const name = mutualMatchInfo.partnerName || "your match";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl px-6 py-5 max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold text-pink-400 mb-1">
            Sparks are flying!
          </h2>
          <p className="text-lg text-white mb-3">
            You and {name} matched!
          </p>
          <div className="space-y-2">
            <button
              onClick={handleContinueChat}
              className="w-full px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold"
            >
              Click here to continue chatting
            </button>
            <button
              onClick={handleContinueMatchmaking}
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-neutral-100"
            >
              Click here to continue matchmaking
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (matchmakingState) {
      case "idle":
        return (
          <div className="matchmaking-idle">
            <h2>Ready to Connect?</h2>
            <p>Click below to find someone to chat with</p>
            <button
              onClick={joinMatchmaking}
              className="btn-primary bg-primary text-slate-900"
            >
              Start Matchmaking
            </button>
            {error && <div className="error text-red-500 mt-4">{error}</div>}
          </div>
        );
      case "searching":
        return (
          <div className="matchmaking-searching">
            <div className="spinner" />
            <h2>Finding a Match...</h2>
            <div className="timer-display">
              <div className="time-stat">
                <span className="time-value">{timeElapsed}s</span>
                <span className="time-label">elapsed</span>
              </div>
              <div className="time-divider">|</div>
              <div className="time-stat">
                <span className="time-value">{timeRemaining}s</span>
                <span className="time-label">remaining</span>
              </div>
            </div>
            <p className="search-status">
              {timeRemaining > 0
                ? "Looking for compatible users..."
                : "Creating session as host..."}
            </p>
            <button onClick={cancelMatchmaking} className="bg-secondary">
              Cancel
            </button>
          </div>
        );
      case "matched":
        return (
          <div className="matchmaking-matched">
            <div className="success-icon">✓</div>
            <h2>Match Found!</h2>
            <p>
              You are the <strong>{role}</strong>
            </p>
            {sessionData?.id && (
              <p className="session-meta">
                Session:{" "}
                <span className="session-id">{sessionData.id}</span>
              </p>
            )}
            {otherUserName && (
              <p>
                You will be chatting with{" "}
                <strong>{otherUserName}</strong>
              </p>
            )}
            <p>Connecting to chat...</p>
          </div>
        );
      case "in_session":
        return (
          <div className="chat-session relative">
            {renderMutualMatchModal()}
            <div className="chat-header">
              <div>
                <h2>
                  {otherUserName
                    ? `Chat with ${otherUserName}`
                    : "Chat Session"}
                </h2>
                <div className="session-meta">
                  <span className="role-badge">{role}</span>
                  {sessionData?.id && (
                    <span className="session-id">
                      Session: {sessionData.id}
                    </span>
                  )}
                </div>
              </div>
              <div className="button-group flex gap-2">
                <button
                  onClick={matchUser}
                  className={`px-4 py-2 rounded ${
                    matchStatus.youMatched
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-400 hover:bg-green-500"
                  }`}
                  disabled={matchStatus.youMatched}
                >
                  {matchStatus.youMatched ? "✓ Matched" : "❤️ Match"}
                </button>
                <button
                  onClick={leaveSession}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
                >
                  Skip
                </button>
                <button
                  onClick={exitMatchmaking}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
                >
                  Exit Matchmaking
                </button>
              </div>
            </div>
            <div className="chat-messages max-h-96 overflow-y-auto p-4 space-y-2">
              {chatMessages.length === 0 ? (
                <div className="no-messages text-center text-gray-500">
                  <p>No messages yet. Say hi 👋</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isOwn = msg.author_uid === currentUserId;
                  const key = msg.id || `${idx}-${msg.created_at || "no-ts"}`;
                  if (msg.is_system || msg.system) {
                    return (
                      <div
                        key={key}
                        className="message system text-center text-slate-500 py-2"
                      >
                        {msg.content}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={key}
                      className={`message ${
                        isOwn ? "own ml-auto" : "other mr-auto"
                      } max-w-xs`}
                    >
                      <div
                        className={`message-content ${
                          isOwn
                            ? "bg-primary text-dark"
                            : "bg-dark text-primary"
                        } rounded-lg p-3`}
                      >
                        <span>{msg.content}</span>
                      </div>
                      <div className="message-time text-xs text-gray-400 mt-1">
                        {new Date(
                          msg.created_at
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
              <div className="match-status flex gap-1">
                {matchStatus.isMutual && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm animate-pulse">
                    🎉 Mutual Match!
                  </span>
                )}
              </div>
            </div>
            <div className="chat-input flex gap-1 p-2 border-t">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                disabled={!isConnected}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || !isConnected}
                className="px-6 py-2 bg-primary text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-dark"
              >
                Send
              </button>
            </div>
            {!isConnected && (
              <div className="connection-warning bg-yellow-100 text-yellow-800 p-3 text-center">
                ⚠️ WebSocket disconnected. Reconnecting...
              </div>
            )}
            {error && (
              <div className="error text-red-500 p-3 text-center">
                {error}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="matchmaking-container p-4">{renderContent()}</div>;
}