import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

export default function ChatListPage() {
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [photoMap, setPhotoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadChats() {
      setLoading(true);
      setError("");

      try {
        const res = await fetchWithAuth("/user/me/chats");
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load chats");
        }

        const data = await res.json();
        if (!cancelled) setChats(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load chats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChats();
    return () => {
      cancelled = true;
    };
  }, [fetchWithAuth]);

  const loadPhotoForUser = useCallback(
    async (uid) => {
      if (!uid || photoMap[uid]) return;
      try {
        const res = await fetchWithAuth(`/profile/${uid}/photos`);
        if (!res.ok) return;
        const photos = await res.json();
        const first =
          Array.isArray(photos) && photos.length > 0 ? photos[0] : null;

        setPhotoMap((prev) => ({
          ...prev,
          [uid]: first,
        }));
      } catch {}
    },
    [fetchWithAuth, photoMap]
  );

  useEffect(() => {
    chats.forEach((c) => {
      if (c.other_user_uid) loadPhotoForUser(c.other_user_uid);
    });
  }, [chats, loadPhotoForUser]);

  const viewChats = useMemo(() => {
    return chats.map((c) => {
      const u = c.other_user || {};
      const photoMeta = c.other_user_uid ? photoMap[c.other_user_uid] : null;

      return {
        id: c.id,
        otherUserUid: c.other_user_uid,
        name: u.fname || u.first_name || "Unknown",
        age: u.age || "",
        matchedAt: c.last_message_at
          ? new Date(c.last_message_at).toLocaleDateString()
          : "",
        lastMessage: c.last_message?.content || "",
        avatarUrl: photoMeta?.url || null,
      };
    });
  }, [chats, photoMap]);

  function handleOpenChat(chat) {
    navigate(`/chats/${chat.id}`);
  }

  return (
    <div className="h-full w-full overflow-y-auto">
      {/* <h1 className="text-2xl font-semibold mb-4">Your chats</h1> */}

      {loading && <p className="text-neutral-400">Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && viewChats.length === 0 && !error && (
        <p className="text-sm text-center text-neutral-400">
        Go and find your spark!
        </p>
      )}

      {!loading && viewChats.length > 0 && (
        <ul className="flex flex-col space-y-1">
          {viewChats.map((chat, i) => (
            <li key={chat.id}>
              <button
                onClick={() => handleOpenChat(chat)}
                className={`w-full flex ${i % 2 == 0 ? "bg-neutral-800" : ""} items-center gap-3 rounded-2xl p-2 text-left transition`}
              >
                {chat.avatarUrl ? (
                  <img
                    src={chat.avatarUrl}
                    alt={chat.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full flex items-center justify-center text-base font-semibold bg-neutral-700">
                    {chat.name[0]}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">
                      {chat.name}
                      {chat.age ? `, ${chat.age}` : ""}
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