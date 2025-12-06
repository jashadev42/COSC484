// src/AppRoutes.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./contexts/AuthContext.jsx";

// Pages
import SignUpLanding from "./pages/auth/SignUpLanding.jsx";
import PhoneAuthFormComponent from "./PhoneAuthFormComponent.jsx";

import ProfileSetupPage from "./pages/onboarding/ProfileSetupPage.jsx";
import DevOnboardingPreview from "./pages/onboarding/DevOnboardingPreview.jsx";

import SparkViewPage from "./pages/spark/SparkViewPage.jsx";
import ChatListPage from "./pages/chat/ChatListPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";

// Layout
import AuthedAppLayout from "./layouts/AuthedAppLayout.jsx";

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<SignUpLanding />} />

      {/* Phone auth (OTP screen) */}
      <Route path="/auth/phone" element={<PhoneAuthFormComponent />} />

      {/* DEV ROUTE — onboarding without auth or backend */}
      <Route path="/dev/onboarding" element={<DevOnboardingPreview />} />

      {/* REAL onboarding – requires auth */}
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            <ProfileSetupPage />
          ) : (
            <Navigate to="/auth/phone" replace />
          )
        }
      />

      {/* Main app – requires auth */}
      <Route
        path="/app"
        element={
          isAuthenticated ? (
            <AuthedAppLayout />
          ) : (
            <Navigate to="/auth/phone" replace />
          )
        }
      >
        <Route index element={<SparkViewPage />} />
        <Route path="spark" element={<SparkViewPage />} />
        <Route path="chats" element={<ChatListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* DEV-ONLY VERSION OF THE APP, NO AUTH REQUIRED */}
      <Route path="/dev/app" element={<AuthedAppLayout />}>
        <Route index element={<SparkViewPage />} />
        <Route path="spark" element={<SparkViewPage />} />
        <Route path="chats" element={<ChatListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        
      </Route>

      {/* Catch-all → redirect home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
