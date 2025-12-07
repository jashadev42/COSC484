import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@contexts/AuthContext";

const DEV_CHATS = [
  {
    session_id: "abc123",
    user: { first_name: "Alex", age: 22, avatar_color: "#f97316" },
    last_message: {
      text: "Had fun talking last night 😊",
      timestamp: "2025-11-24T12:00:00Z",
    },
  },
  {
    session_id: "xyz999",
    user: { first_name: "Jordan", age: 21, avatar_color: "#22c55e" },
    last_message: {
      text: "Let’s grab coffee sometime?",
      timestamp: "2025-11-23T10:15:00Z",
    },
  },
];

export default function ChatListPage() {
  const { fetchWithAuth } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const devMockEnabled = true; // TURN OFF FOR PRODUCTION

  useEffect(() => {
    if (!devMockEnabled) return;
    setChats(DEV_CHATS);
    setLoading(false);
  }, [devMockEnabled]);

  useEffect(() => {
    if (devMockEnabled) return undefined;

    let cancelled = false;
    async function loadChats() {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/matchmaking/me/session/chats");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load chats");
        }
        const data = await res.json().catch(() => []);
        if (!cancelled) setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChats();
    return () => {
      cancelled = true;
    };
  }, [devMockEnabled, fetchWithAuth]);

  const viewChats = useMemo(
    () =>
      chats.map((c) => ({
        id: c.session_id,
        name: c.user?.first_name ?? "Unknown",
        age: c.user?.age ?? "",
        matchedAt: c.last_message?.timestamp?.split("T")[0] ?? "",
        lastMessage: c.last_message?.text ?? "",
        avatarColor: c.user?.avatar_color ?? "#888",
      })),
    [chats]
  );

  function handleOpenChat(chat) {
    console.log("Open chat", chat);
    alert(`Open chat with ${chat.name} (TODO)`);
  }

  return (
    <div className="h-full w-full px-4 py-3">
      <h1 className="text-2xl font-semibold mb-4">Your chats</h1>

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && viewChats.length === 0 && (
        <p className="text-sm text-center text-neutral-400">Go find your spark.</p>
      )}

      {!loading && viewChats.length > 0 && (
        <ul className="space-y-3">
          {viewChats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => handleOpenChat(chat)}
                className="w-full flex items-center gap-3 rounded-2xl border-t border-neutral-800 p-2 text-left transition"
              >
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold"
                  style={{ backgroundColor: chat.avatarColor }}
                >
                  {chat.name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">
                      {chat.name}
                      {chat.age ? `, ${chat.age}` : ""}
                    </p>
                    <p className="text-xs text-neutral-400">Matched {chat.matchedAt}</p>
                  </div>

                  <p className="text-sm text-neutral-400 truncate">
                    {chat.lastMessage || "Say hi 👋"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@contexts/AuthContext";

export default function ChatListPage() {
  const { fetchWithAuth } = useAuth();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const devMockEnabled = true; // TURN OFF FOR PRODUCTION

useEffect(() => {
  if (devMockEnabled) {
    setChats([
      {
        session_id: "abc123",
        user: {
          first_name: "Alex",
          age: 22,
          avatar_color: "#f97316"
        },
        last_message: {
          text: "Had fun talking last night 😊",
          timestamp: "2025-11-24T12:00:00Z"
        }
      },
      {
        session_id: "xyz999",
        user: {
          first_name: "Jordan",
          age: 21,
          avatar_color: "#22c55e"
        },
        last_message: {
          text: "Let’s grab coffee sometime?",
          timestamp: "2025-11-23T10:15:00Z"
        }
      }
    ]);
    setLoading(false);
    return;
  }
}, []);


  useEffect(() => {
    let cancelled = false;

    async function loadChats() {
      setLoading(true);

      try {
        const res = await fetchWithAuth(
          "/matchmaking/me/session/chats"
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load chats");
        }

        const data = await res.json().catch(() => []);

        if (!cancelled) setChats(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChats();
    return () => { cancelled = true };
  }, [fetchWithAuth]);

  // Convert backend → what the UI expects
  const viewChats = useMemo(() => {
    return chats.map((c) => ({
      id: c.session_id,
      name: c.user?.first_name ?? "Unknown",
      age: c.user?.age ?? "",
      matchedAt: c.last_message?.timestamp?.split("T")[0] ?? "",
      lastMessage: c.last_message?.text ?? "",
      avatarColor: c.user?.avatar_color ?? "#888",
    }));
  }, [chats]);

  function handleOpenChat(chat) {
    console.log("Open chat", chat);
    alert(`Open chat with ${chat.name} (TODO)`);
  }

  return (
    <div className="h-full w-full px-4 py-3">
      <h1 className="text-2xl font-semibold mb-4">Your chats</h1>

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && viewChats.length === 0 && (
        <p className="text-sm text-center text-neutral-400">
          Go find your spark.
        </p>
      )}

      {!loading && viewChats.length > 0 && (
        <ul className="space-y-3">
          {viewChats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => handleOpenChat(chat)}
                className="w-full flex items-center gap-3 rounded-2xl border-t border-neutral-800 p-2 text-left transition"
              >
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold"
                  style={{ backgroundColor: chat.avatarColor }}
                >
                  {chat.name[0]}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">
                      {chat.name}{chat.age ? `, ${chat.age}` : ""}
                    </p>
                    <p className="text-xs text-neutral-400">
                      Matched {chat.matchedAt}
                    </p>
                  </div>

                  <p className="text-sm text-neutral-400 truncate">
                    {chat.lastMessage || "Say hi 👋"}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
