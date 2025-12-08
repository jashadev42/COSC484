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
  const otherUserName = sessionData?.other_user_first_name || "Your match";

  const loadMatchStatus = useCallback(
    async (sessionId) => {
      if (!sessionId || !currentUserId) return;
      try {
        const res = await fetchWithAuth("/matchmaking/me/session/match-status");
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
      
      // Only transition to in_session if there's actually a partner
      if (sessionInfo?.other_user_first_name) {
        setTimeout(() => setMatchmakingState("in_session"), 1500);
      }
      // Otherwise stay in "matched" state (showing "Looking for partner...")
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
      console.error("Failed to leave session:", err);
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
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 SESSION_FOUND EVENT RECEIVED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Data:', JSON.stringify(data, null, 2));
      console.log('Current matchmakingState:', matchmakingState);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      stopPolling();
      
      const sessionInfo = {
        id: data.session_id,
        host_uid: data.role === "host" ? currentUserId : data.partner_uid,
        guest_uid: data.role === "guest" ? currentUserId : data.partner_uid,
        other_user_uid: data.partner_uid,
        other_user_first_name: data.partner_first_name || null,
      };

      console.log('Constructed sessionInfo:', JSON.stringify(sessionInfo, null, 2));
      
      // If we're in "matched" state (waiting as host), we need to:
      // 1. Update sessionData with partner info
      // 2. Join the WebSocket room
      // 3. Load chats
      // 4. Transition to in_session
      // NEW CODE (Matchmaking.jsx)
// ...
      // If we're in "matched" state (waiting as host), we need to:
      // 1. Update sessionData with partner info
      // 2. Join the WebSocket room
      // 3. Load chats
      // 4. Transition to in_session
      if (matchmakingState === "matched") {
        console.log('✅ Host was waiting (matched state) - updating session and transitioning');
        
        // Update session data
        setSessionData(sessionInfo);
        setRole(data.role);
        
        // Join WebSocket room
        if (isConnected && sessionInfo.id) {
          console.log('Joining WebSocket room:', sessionInfo.id);
          emit("join_session", { session_id: sessionInfo.id });
        }
        
        // Load chats and match status
        await loadSessionChats();
        await loadMatchStatus(sessionInfo.id);
        
        // Use a slight delay to allow UI to update with partner name, 
        // then transition to in_session which allows chat/buttons
        if (sessionInfo?.other_user_first_name) {
          setTimeout(() => setMatchmakingState("in_session"), 1500);
        } else {
          // If for some reason partner name is missing, stay in matched state 
          // or handle error (but based on logs it should be present)
          setMatchmakingState("matched"); 
        }
      } else {
        // Guest joining - do normal transition
        console.log('🔄 Guest joining - doing normal transition');
        await transitionToSession(sessionInfo, data.role);
      }
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
    matchmakingState,
  ]);

  const pollForMatch = useCallback(async () => {
    if (!isSearchingRef.current) return;

    try {
      const response = await fetchWithAuth("/matchmaking/me/poll");
      if (!response.ok) throw new Error("Failed to poll for match");

      const result = await response.json();
      if (result.time_elapsed !== undefined) setTimeElapsed(result.time_elapsed);
      if (result.time_remaining !== undefined) setTimeRemaining(result.time_remaining);

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
  }, [fetchWithAuth, stopPolling, transitionToSession, resetToIdle]);

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
      await fetchWithAuth("/matchmaking/me/exit", { method: "DELETE" });
      resetToIdle();
    } catch (err) {
      console.error("Failed to cancel matchmaking:", err);
      setError(err.message);
    }
  };

  const skipUser = async () => {
    try {
      stopPolling();
      const response = await fetchWithAuth("/matchmaking/me/session", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error leaving session");

      if (isConnected && sessionData) {
        emit("leave_session", { session_id: sessionData.id });
      }

      // Immediately rejoin matchmaking
      resetToIdle();
      setTimeout(() => joinMatchmaking(), 100);
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
      navigate("/spark");
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
    // Always use the actual name from sessionData
    const name = sessionData?.other_user_first_name || "your match";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-neutral-900 border border-primary/20 rounded-3xl px-8 py-6 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-2xl font-bold text-pink- mb-2">
            Sparks are flying!
          </h2>
          <p className="text-lg text-white mb-6">
            You and <span className="font-semibold text-primary">{name}</span> matched!
          </p>
          <div className="space-y-3">
            <button
              onClick={handleContinueChat}
              className="w-full px-6 py-3 rounded-xl bg-primary text-black font-bold hover:opacity-90 transition"
            >
              Continue Chatting
            </button>
            <button
              onClick={handleContinueMatchmaking}
              className="w-full px-6 py-3 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 transition"
            >
              <span className="text-neutral-200">Keep Matching</span>
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
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Ready to Spark?</h2>
              <p className="text-neutral-400">Find someone to chat with in seconds</p>
            </div>
            <button
              onClick={joinMatchmaking}
              className="px-8 py-4 rounded-xl bg-primary text-black text-lg font-bold hover:opacity-90 transition"
            >
              Start Matchmaking
            </button>
            {error && (
              <div className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        );

      case "searching":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
            <div className="animate-pulse">
              <h2 className="text-2xl font-bold text-white mb-2">Finding your match...</h2>
              <div className="flex items-center justify-center gap-6 text-neutral-400">
                <div>
                  <span className="text-2xl font-bold text-primary">{timeElapsed}s</span>
                  <span className="text-sm ml-1">elapsed</span>
                </div>
                <span className="text-neutral-600">|</span>
                <div>
                  <span className="text-2xl font-bold text-primary">{timeRemaining}s</span>
                  <span className="text-sm ml-1">remaining</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mt-4">
                {timeRemaining > 0
                  ? "Looking for compatible candidates..."
                  : "Creating session as host..."}
              </p>
            </div>
            <button
              onClick={cancelMatchmaking}
              className="px-8 py-3 rounded-xl border border-neutral-700 text-white hover:bg-neutral-800 transition"
            >
              <span className="text-neutral-200">Cancel</span>
            </button>
          </div>
        );

      case "matched":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-white">
              {role === "host" ? "Session Created!" : "Match Found!"}
            </h2>
            <p className="text-neutral-400">
              {sessionData?.other_user_first_name ? (
                <>Connecting you with {sessionData.other_user_first_name}...</>
              ) : (
                <>Looking for partner...</>
              )}
            </p>
            <button
              onClick={cancelMatchmaking}
              className="px-8 py-3 rounded-xl border border-neutral-700 text-white hover:bg-neutral-800 transition"
            >
              <span className="text-neutral-200">Cancel</span>
            </button>
          </div>
        );

      case "in_session":
        return (
          <div className="h-full w-full flex flex-col relative">
            {renderMutualMatchModal()}

            {/* Header - matches ChatPage */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={exitMatchmaking}
                className="text-sm hover:text-white"
              >
                <span className="text-white">← Back</span>
              </button>

              <div className="flex items-center gap-3">
                {sessionData?.other_user_first_name ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-semibold">
                      {sessionData.other_user_first_name[0]}
                    </div>
                    <div className="text-right">
                      <h1 className="text-xl font-semibold text-white">
                        {sessionData.other_user_first_name}
                      </h1>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide">
                        In session
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-right">
                    <h1 className="text-xl font-semibold text-white">
                      Session created!
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Looking for partner...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages - matches ChatPage */}
            <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-2xl p-3 space-y-2">
              {chatMessages.length === 0 ? (
                <div className="text-center text-neutral-500 pt-8">
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
                        className="text-center text-neutral-500 text-sm py-2"
                      >
                        {msg.content}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={key}
                      className={`max-w-xs ${
                        isOwn ? "ml-auto text-right" : "mr-auto text-left"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isOwn
                            ? "bg-primary text-slate-900"
                            : "bg-neutral-800 text-neutral-50"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString()
                          : ""}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Match Status Indicator */}
              {matchStatus.isMutual && (
                <div className="text-center py-2">
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold animate-pulse">
                    ❤︎ Mutual Match!
                  </span>
                </div>
              )}
            </div>

            {/* Message Input - matches ChatPage */}
            <div className="mt-3 border-t border-neutral-800 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={
                    isConnected ? "Type a message..." : "Reconnecting..."
                  }
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isConnected}
                  className="px-4 py-2 rounded-xl bg-primary text-slate-900 text-sm font-semibold disabled:bg-neutral-700 disabled:text-neutral-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              {!isConnected && (
                <p className="mt-1 text-xs text-yellow-400">
                  WebSocket disconnected. Trying to reconnect…
                </p>
              )}
            </div>

            {/* Floating Action Buttons - Overlaid on top */}
            <div className="fixed bottom-40 right-6 flex gap-3 z-10">
              <button
                onClick={matchUser}
                disabled={matchStatus.youMatched}
                className={`w-10 h-10 rounded-full shadow-2xl flex items-center justify-center text-xl transition-all ${
                  matchStatus.youMatched
                    ? "bg-neutral-600 cursor-not-allowed opacity-50"
                    : "bg-primary hover:opacity-50  hover:scale-110 active:scale-95"
                }`}
                title={matchStatus.youMatched ? "Already matched" : "Match with this person"}
              >
                {matchStatus.youMatched ? "✓" : "❤︎"}
              </button>
              <button
                onClick={skipUser}
                className={`w-10 h-10 rounded-full shadow-2xl flex items-center justify-center text-xl transition-all ${
                    "bg-red-400 hover:opacity-50 hover:scale-110 active:scale-95"
                }`}
                title="Skip to next person"
              >
                ▶︎
              </button>
            </div>

            {error && (
              <div className="mt-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="h-full w-full">{renderContent()}</div>;
}