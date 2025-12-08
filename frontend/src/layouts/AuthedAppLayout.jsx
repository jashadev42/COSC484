import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  SparkIcon,
  ChatIcon,
  ProfileIcon,
  SettingsIcon,
} from "../auth/components/NavIcons.jsx";
import TitleBarComponent from '@components/TitleBarComponent.jsx'

export default function AuthedAppLayout() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden text-white pt-8 pb-4">
      <TitleBarComponent />

      <main className="flex-1 overflow-y-auto px-4">
        <Outlet />
      </main>

      <nav className="h-14 mt-2 border-t border-neutral-800 flex items-center justify-around flex-shrink-0">
        <BottomNavLink to="/spark">
          <SparkIcon />
        </BottomNavLink>
        <BottomNavLink to="/chats">
          <ChatIcon />
        </BottomNavLink>
        <BottomNavLink to="/profile">
          <ProfileIcon />
        </BottomNavLink>
        <BottomNavLink to="/settings">
          <SettingsIcon />
        </BottomNavLink>
      </nav>
    </div>
  );
}

function BottomNavLink({ to, label, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center text-xs gap-0.5",
          isActive ? "text-amber-400" : "text-neutral-400",
        ].join(" ")
      }
    >
      {children}
      <span>{label}</span>
    </NavLink>
  );
}