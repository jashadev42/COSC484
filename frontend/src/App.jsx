// src/App.jsx
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

export default function App() {
  return (
    <div className="w-full h-full flex justify-center overflow-hidden">
      <div className="w-full max-w-[620px] h-full overflow-hidden">
        <AppRoutes />
      </div>
    </div>
  );
}