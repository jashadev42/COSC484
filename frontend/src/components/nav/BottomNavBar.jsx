// src/components/nav/BottomNavBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import SparkIcon from "../icons/SparkIcon.jsx";
import ChatIcon from "../icons/ChatIcon.jsx";
import UserIcon from "../icons/UserIcon.jsx";
import SettingsIcon from "../icons/SettingsIcon.jsx";

export default function BottomNavBar() {
  const baseClasses =
    "flex flex-col items-center justify-center flex-1 py-2 text-xs";

  return (
    <nav className="h-16 border-t border-neutral-900 flex text-neutral-400">
      <NavLink
        to="/app/spark"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? "text-amber-400" : "text-neutral-400"}`
        }
      >
        {({ isActive }) => (
          <>
            <SparkIcon
              filled={isActive}
              className="w-6 h-6 mb-0.5"
            />
          </>
        )}
      </NavLink>

      <NavLink
        to="/app/chats"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? "text-white" : "text-neutral-400"}`
        }
      >
        {({ isActive }) => (
          <>
            <ChatIcon filled={isActive} className="w-6 h-6 mb-0.5" />
          </>
        )}
      </NavLink>

      <NavLink
        to="/app/profile"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? "text-white" : "text-neutral-400"}`
        }
      >
        {({ isActive }) => (
          <>
            <UserIcon filled={isActive} className="w-6 h-6 mb-0.5" />
          </>
        )}
      </NavLink>

      <NavLink
        to="/app/settings"
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? "text-white" : "text-neutral-400"}`
        }
      >
        {({ isActive }) => (
          <>
            <SettingsIcon filled={isActive} className="w-6 h-6 mb-0.5" />
          </>
        )}
      </NavLink>
    </nav>
  );
}
