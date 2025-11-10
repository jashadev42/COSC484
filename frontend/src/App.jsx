import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUpLanding from "./pages/SignUpLanding";
import PhoneAuthPage from "./pages/PhoneAuthPage";
import { AppRoutes } from "./pages/AppShell";

export default function App() {
  const isAuthed = true;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpLanding />} />
        <Route path="/auth/phone" element={<PhoneAuthPage />} />
      </Routes>

      {/* Auth-gated app area */}
      {isAuthed ? (
        <AppRoutes />
      ) : (
        <Routes>
          <Route path="/app/*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
