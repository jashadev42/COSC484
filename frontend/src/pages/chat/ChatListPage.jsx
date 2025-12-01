// src/pages/chat/ChatListPage.jsx
import React from "react";

export default function ChatListPage() {
  // Later you'll fetch this from an endpoint
  const dummyChats = [
    {
      id: 1,
      name: "Alex, 23",
      lastMessage: "Had fun talking last night 🙂",
      matchedAt: "Nov 20",
    },
    {
      id: 2,
      name: "Taylor, 21",
      lastMessage: "Send me that playlist!",
      matchedAt: "Nov 18",
    },
  ];

  return (
    <div className="h-full w-full px-4 py-3 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Chats</h1>

      <div className="space-y-3">
        {dummyChats.map((chat) => (
          <button
            key={chat.id}
            className="w-full flex items-center border-t border-neutral-800 gap-3 rounded-2xl px-3 py-3 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm">
              {chat.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{chat.name}</span>
                <span className="text-xs text-neutral-500">
                  Matched {chat.matchedAt}
                </span>
              </div>
              <p className="text-sm text-neutral-400 truncate">
                {chat.lastMessage}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
