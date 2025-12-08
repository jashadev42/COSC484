import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Auth state - ONLY session token
  const [session, setSession] = useState(null);
  
  // Loading states
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const expiryTimerRef = useRef(null);

  const apiUrl = typeof __API_URL__ !== "undefined" ? __API_URL__ : "";

  // ========== STORAGE ==========

  const persist = useCallback((sessionData) => {
    try {
      localStorage.setItem("authSession", JSON.stringify(sessionData));
    } catch (_) {}
  }, []);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem("authSession");
    } catch (_) {}
  }, []);

  // ========== TOKEN VALIDATION ==========

  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const exp = payload?.exp;
      if (!exp) return false;
      
      // Token valid if expires in more than 30 seconds
      return exp * 1000 - Date.now() > 30000;
    } catch (e) {
      return false;
    }
  }, []);

  // ========== EXPIRY TIMER ==========

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const scheduleTokenExpiry = useCallback((token) => {
    clearExpiryTimer();
    
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const exp = payload?.exp;
      if (!exp) return;

      const msUntilExpiry = exp * 1000 - Date.now();

      if (msUntilExpiry <= 0) {
        signOut();
        return;
      }

      // Logout 30 seconds before expiry
      const timeoutMs = Math.max(msUntilExpiry - 30000, 0);
      
      expiryTimerRef.current = setTimeout(() => {
        console.log("Token expired, signing out...");
        signOut();
      }, timeoutMs);
    } catch (e) {
      console.error("Failed to schedule token expiry:", e);
    }
  }, [clearExpiryTimer]);

  // ========== AUTH ACTIONS ==========

  const signOut = useCallback(() => {
    console.log("Signing out...");
    clearExpiryTimer();
    setSession(null);
    setOtpSent(false);
    setError("");
    clearPersisted();
  }, [clearExpiryTimer, clearPersisted]);

  // ========== HYDRATION (runs once on mount) ==========

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authSession");
      
      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw);
      const token = parsed?.access_token;

      // Validate token
      if (!token || !isTokenValid(token)) {
        console.log("Stored token invalid/expired, clearing...");
        clearPersisted();
        setHydrated(true);
        return;
      }

      // Token valid, restore session
      setSession(parsed);
      scheduleTokenExpiry(token);
      console.log("Session restored from localStorage");
    } catch (err) {
      console.error("Failed to hydrate auth:", err);
      clearPersisted();
    } finally {
      setHydrated(true);
    }
  }, []); // Only run once on mount

  // ========== API HELPERS ==========

  const fetchWithAuth = useCallback(
    async (path, init = {}) => {
      const token = session?.access_token;

      if (!token || !isTokenValid(token)) {
        signOut();
        throw new Error("Not authenticated");
      }

      const headers = new Headers(init.headers || {});
      headers.set("Authorization", `Bearer ${token}`);

      const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;

      const res = await fetch(url, { ...init, headers });

      if (res.status === 401 || res.status === 403) {
        signOut();
        throw new Error("Session expired");
      }

      return res;
    },
    [apiUrl, session?.access_token, isTokenValid, signOut]
  );

  const requestOtp = useCallback(
    async (phone) => {
      setError("");

      if (!phone) {
        const msg = "Phone number cannot be blank";
        setError(msg);
        throw new Error(msg);
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${apiUrl}/auth/phone/otp?phone=${encodeURIComponent(phone)}`
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const msg = errorData.detail || errorData.message || "Failed to send OTP";
          setError(msg);
          throw new Error(msg);
        }

        setOtpSent(true);
      } catch (e) {
        setError(e?.message || "Failed to send OTP");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl]
  );

  const verifyOtp = useCallback(
    async ({ phone, code }) => {
      setError("");

      if (!phone || !code) {
        const msg = "Phone and code are required";
        setError(msg);
        throw new Error(msg);
      }

      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/auth/phone/otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const msg = errorData.detail || errorData.message || "Authentication failed";
          setError(msg);
          throw new Error(msg);
        }

        const data = await res.json();
        const sessionData = data?.session;
        const token = sessionData?.access_token;

        if (!token) {
          throw new Error("No token received");
        }

        // Store session
        setSession(sessionData);
        persist(sessionData);
        scheduleTokenExpiry(token);

        console.log("OTP verified, session created");
        return data;
      } catch (e) {
        setError(e?.message || "Failed to verify OTP");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, persist, scheduleTokenExpiry]
  );

  // ========== COMPUTED VALUES ==========

  const isAuthenticated = Boolean(session?.access_token);

  // ========== CONTEXT VALUE ==========

  const value = useMemo(
    () => ({
      // State
      loading,
      error,
      session,
      otpSent,
      hydrated,
      isAuthenticated,
      
      // Actions
      requestOtp,
      verifyOtp,
      fetchWithAuth,
      signOut,
      setError,
      setOtpSent,
    }),
    [
      loading,
      error,
      session,
      otpSent,
      hydrated,
      isAuthenticated,
      requestOtp,
      verifyOtp,
      fetchWithAuth,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}