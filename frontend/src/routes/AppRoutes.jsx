// frontend/src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import SignUpLanding from "../auth/pages/SignUpLanding.jsx";
import PhoneOtpPage from "../auth/pages/PhoneOtpPage.jsx";

import ProfileSetupPage from "../pages/ProfileSetupPage.jsx";
import DevOnboardingPreview from "../pages/DevOnboardingPreview.jsx";
import SparkViewPage from "../pages/SparkViewPage.jsx";
import ChatListPage from "../pages/ChatListPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
import PreferencesPage from "../pages/PreferencesPage.jsx";

import MatchmakingPage from "../pages/MatchmakingPage.jsx";
import ProfileScreen from "../pages/ProfileScreen.jsx";
import AuthedAppLayout from "../layouts/AuthedAppLayout.jsx";
import ChatPage from "../pages/ChatPage.jsx";

export default function AppRoutes() {
  const location = useLocation();
  const state = location.state;
  const modalBackground = state && state.background;

  return (
    <>
      {/* Public / auth flow */}
      <Routes location = {modalBackground || location}>
        <Route path="/" element={<SignUpLanding />} />
        <Route path="/onboarding" element={<ProfileSetupPage />} />

        {/* Authed app shell with bottom nav */}
        <Route element={<AuthedAppLayout />}>
          <Route path="/spark" element={<SparkViewPage />} />
          <Route path="/matchmaking" element={<MatchmakingPage />} />
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/preferences" element={<PreferencesPage />} />
      </Route>

        {/* Dev only routes */}
        <Route path="/dev/onboarding" element={<DevOnboardingPreview />} />

      {/* Backwards compatibility for legacy /app links */}
      <Route path="/app/*" element={<Navigate to="/spark" replace />} />
      <Route path="*" element={<Navigate to="/spark" replace />} />
    </Routes>

     {/* Public */}
     {/* Modal Route (implementing for SignUpLanding -> PhoneOtpPage modal sheet) */}
     {modalBackground && (
       <Routes>
        <Route path= "/auth/phone" element={<PhoneOtpPage />}/>
       </Routes>
     )}
   </>
  );
}
