import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

import SignUpLanding from "../auth/pages/SignUpLanding.jsx";
import PhoneOtpPage from "../auth/pages/PhoneOtpPage.jsx";
import ProfileSetupPage from "../pages/ProfileSetupPage.jsx";
import DevOnboardingPreview from "../pages/DevOnboardingPreview.jsx";
import SparkViewPage from "../pages/SparkViewPage.jsx";
import ChatListPage from "../pages/ChatListPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
import MatchmakingPage from "../pages/MatchmakingPage.jsx";
import ProfileScreen from "../pages/ProfileScreen.jsx";
import AuthedAppLayout from "../layouts/AuthedAppLayout.jsx";
import ChatPage from "../pages/ChatPage.jsx";
import { LoadingWheel } from "@components/LoadingWheel.jsx";


// Hook to check onboarding status
function useOnboardingStatus() {
  const { isAuthenticated, fetchWithAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      setOnboardingComplete(false);
      return;
    }

    let mounted = true;

    async function checkOnboarding() {
      try {
        const res = await fetchWithAuth("/user/me");
        if (!res.ok) {
          if (mounted) {
            setOnboardingComplete(false);
            setChecking(false);
          }
          return;
        }

        const user = await res.json();
        const hasOnboarding = Boolean(
          user?.first_name && 
          user?.last_name && 
          user?.birthdate
        );

        if (mounted) {
          setOnboardingComplete(hasOnboarding);
          setChecking(false);
        }
      } catch (err) {
        console.error("Failed to check onboarding:", err);
        if (mounted) {
          setOnboardingComplete(false);
          setChecking(false);
        }
      }
    }

    checkOnboarding();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, fetchWithAuth]);

  return { checking, onboardingComplete };
}

// Protected route (requires auth + onboarding)
function ProtectedRoute({ children }) {
  const { isAuthenticated, hydrated } = useAuth();
  const { checking, onboardingComplete } = useOnboardingStatus();

  if (!hydrated || (isAuthenticated && checking)) {
    return <LoadingWheel />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/phone" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// Onboarding route (requires auth only)
function OnboardingRoute({ children }) {
  const { isAuthenticated, hydrated } = useAuth();
  const { checking, onboardingComplete } = useOnboardingStatus();

  if (!hydrated || (isAuthenticated && checking)) {
    return <LoadingWheel />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/phone" replace />;
  }

  if (onboardingComplete) {
    return <Navigate to="/spark" replace />;
  }

  return children;
}

// Public route (redirects if authenticated + onboarded)
function PublicRoute({ children }) {
  const { isAuthenticated, hydrated } = useAuth();
  const { checking, onboardingComplete } = useOnboardingStatus();

  if (!hydrated) {
    return <LoadingWheel />;
  }

  // If authenticated, check onboarding
  if (isAuthenticated) {
    if (checking) {
      return <LoadingWheel />;
    }

    if (onboardingComplete) {
      return <Navigate to="/spark" replace />;
    }

    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <SignUpLanding />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/phone"
        element={
          <PublicRoute>
            <PhoneOtpPage />
          </PublicRoute>
        }
      />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <ProfileSetupPage />
          </OnboardingRoute>
        }
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AuthedAppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/spark" element={<SparkViewPage />} />
        <Route path="/matchmaking" element={<MatchmakingPage />} />
        <Route path="/chats/:chatId" element={<ChatPage />} />
        <Route path="/chats" element={<ChatListPage />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Dev routes */}
      <Route path="/dev/onboarding" element={<DevOnboardingPreview />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/spark" replace />} />
    </Routes>
  );
}