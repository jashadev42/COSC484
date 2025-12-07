// src/App.jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";
import TitleBarComponent from "./components/TitleBarComponent";

export default function App() {
  return (
    <div className="w-full min-h-screen">
      <AppRoutes />
    </div>
  );
}
