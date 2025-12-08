import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { useSocket } from "@contexts/SocketContext";
import { LoadingWheel } from "@components/LoadingWheel";

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, session } = useAuth();
  const { socket, isConnected, emit, subscribe, unsubscribe } = useSocket();

  const currentUserId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [otherUserPhoto, setOtherUserPhoto] = useState(null);

  const otherUserName =
    chat?.other_user?.fname ||
    chat?.other_user?.first_name ||
    "Your match";

  const loadChat = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetchWithAuth(`/user/me/chats/${chatId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.detail || data.message || "Failed to load chat";
        throw new Error(msg);
      }

      const data = await res.json();
      setChat(data || null);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setError(e.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, chatId]);

  const loadOtherUserPhoto = useCallback(
    async (uid) => {
      if (!uid || otherUserPhoto) return; // <--- guard
      try {
        const res = await fetchWithAuth(`/profile/${uid}/photos`);
        if (!res.ok) return;
        const photos = await res.json();
        const first =
          Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        setOtherUserPhoto(first);
      } catch {}
    },
    [fetchWithAuth, otherUserPhoto]
  );

  useEffect(() => {
    if (!chat?.other_user_uid) return;
    loadOtherUserPhoto(chat.other_user_uid);
  }, [chat?.other_user_uid, loadOtherUserPhoto]);


  useEffect(() => {
    if (!chatId) return;
    if (!session?.user?.id) return;
    loadChat();
  }, [chatId, session, loadChat]);

  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;

    emit("join_chat", { chat_id: chatId });

    const handleChatReceived = (data) => {
      if (!data || data.chat_id !== chatId) return;
      setMessages((prev) => [...prev, data]);
    };

    subscribe("chat_received", handleChatReceived);

    return () => {
      unsubscribe("chat_received", handleChatReceived);
    };
  }, [socket, isConnected, chatId, emit, subscribe, unsubscribe]);

  const sendMessage = () => {
    if (!input.trim() || !chatId || !isConnected) return;
    emit("chat_message", { chat_id: chatId, content: input.trim() });
    setInput("");
  };

  if (!chatId) {
    return (
      <div className="p-4">
        <p className="text-red-400">Invalid chat ID.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm hover:text-white"
        >
            <span className="text-white">← Back</span>
        </button>

        <div className="flex items-center gap-3">
          {otherUserPhoto?.url ? (
            <img
              src={otherUserPhoto.url}
              alt={otherUserName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-semibold">
              {otherUserName[0]}
            </div>
          )}

          <div className="text-right">
            <h1 className="text-xl font-semibold text-white">
              Chat with {otherUserName}
            </h1>
            {chat?.status && (
              <p className="text-xs text-neutral-400 uppercase tracking-wide">
                {chat.status}
              </p>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <LoadingWheel/>
      )}

      {!loading && error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex-1 overflow-y-auto border border-neutral-800 rounded-2xl p-3 space-y-2 ">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 pt-8">
                <p>No messages yet. Say hi 👋</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.author_uid === currentUserId;
                const key = msg.id || `${idx}-${msg.created_at || "no-ts"}`;

                if (msg.is_system || msg.system) {
                  return (
                    <div
                      key={key}
                      className="text-center text-slate-500 text-sm py-2"
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
          </div>

          <div className="mt-3 border-t border-neutral-800 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={
                  isConnected ? "Type a message..." : "Reconnecting..."
                }
                disabled={!isConnected}
                className="flex-1 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-sm text-white focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !isConnected}
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
        </>
      )}
    </div>
  );
}
