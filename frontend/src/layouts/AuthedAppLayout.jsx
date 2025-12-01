// src/layouts/AuthedAppLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavBar from "../components/nav/BottomNavBar.jsx";
import TitleBarComponent from "../TitleBarComponent.jsx";

export default function AuthedAppLayout() {
  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Your title bar at the top */}
      <header className="border-b border-neutral-900">
        <TitleBarComponent />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <BottomNavBar />
    </div>
  );
}
