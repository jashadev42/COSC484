import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);
// REMOVED: let hasRedirectedForAuthError = false;

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  
  // New state to prevent rapid, successive redirects
  const [isRedirecting, setIsRedirecting] = useState(false); 

  const apiUrl = typeof __API_URL__ !== "undefined" ? __API_URL__ : "";

  useEffect(() => {
    try {
        const raw = localStorage.getItem("authData");
        if (!raw) {
        setSession(null);
        setUser(null);
        return;
        }

        const parsed = JSON.parse(raw);

        const hasToken = Boolean(parsed?.session?.access_token);
        const hasUser = Boolean(parsed?.user);

        if (hasToken && hasUser) {
        setSession(parsed.session);
        setUser(parsed.user);
        } else {
        localStorage.removeItem("authData");
        setSession(null);
        setUser(null);
        }
    } catch (_) {
        localStorage.removeItem("authData");
        setSession(null);
        setUser(null);
    }
    }, []);


  const persist = useCallback((data) => {
    try {
      localStorage.setItem("authData", JSON.stringify(data));
    } catch (_) {}
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setUser(null);
    setOtpSent(false);
    setError("");
    try {
      localStorage.removeItem("authData");
    } catch (_) {}
  }, []);

    useEffect(() => {
        const hasToken = Boolean(session?.access_token);
        const hasUser = Boolean(user);

        if (!hasToken && hasUser) {
            signOut();
        }
    }, [session?.access_token, user, signOut]);


    const handleAuthError = useCallback(() => {
    if (isRedirecting) return;

    setIsRedirecting(true);

    Promise.resolve().then(() => {
        signOut();
        if (window.location.pathname !== "/auth/phone") {
            window.location.href = "/auth/phone";
        } else {
        setIsRedirecting(false);
        }
    });
    }, [signOut, isRedirecting]);

  const requestOtp = useCallback(
    async (phone) => {
      setError("");
      // ... (requestOtp implementation remains the same) ...
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
          if (res.status === 401 || res.status === 403) {
            handleAuthError();
          }
          const errorData = await res.json().catch(() => ({}));
          const msg =
            errorData.message || res.statusText || "Failed to send OTP";
          setError(msg);
          throw new Error(msg);
        }
        await res.json().catch(() => ({}));
        setOtpSent(true);
      } catch (e) {
        if (!String(e?.message || "").includes("Session expired")) {
          setError(e?.message || "Failed to send OTP. Please try again.");
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, handleAuthError]
  );

  const verifyOtp = useCallback(
    async ({ phone, code }) => {
      setError("");
      // ... (verifyOtp implementation remains the same) ...
      if (!phone || !code) {
        const msg = "Phone and 6 digit code are required";
        setError(msg);
        throw new Error(msg);
      }
      if (String(code).length < 6) {
        const msg = "OTP codes are 6 digits";
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
          if (res.status === 401 || res.status === 403) {
            handleAuthError();
          }
          const errorData = await res.json().catch(() => ({}));
          const msg =
            errorData.message ||
            `Authentication failed with status ${res.status}`;
          setError(msg);
          throw new Error(msg);
        }
        const data = await res.json();
        setSession(data?.session ?? null);
        setUser(data?.user ?? null);
        persist(data);
        setIsRedirecting(false); // Reset redirect flag on successful login
        return data;
      } catch (e) {
        if (!String(e?.message || "").includes("Session expired")) {
          setError(e?.message || "Failed to verify OTP");
        }
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, handleAuthError, persist]
  );

  const fetchWithAuth = useCallback(
    async (path, init = {}) => {
      const token = session?.access_token;
      const headers = new Headers(init.headers || {});
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const url = `${apiUrl}${
        path.startsWith("/") ? path : `/${path}`
      }`;

      const res = await fetch(url, { ...init, headers });

      if ((res.status === 401 || res.status === 403) && session?.access_token) {
        // Crucial Check: Only trigger redirect if a token was actually present
        // This prevents redirection on 401/403 for requests that were expected to fail
        // or if a component rendered before the context initialized.
        handleAuthError();
        throw new Error("Session expired. Please sign in again.");
      }

      return res;
    },
    [apiUrl, session?.access_token, handleAuthError]
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      session,
      user,
      otpSent,
      isAuthenticated: Boolean(session?.access_token && user),
      requestOtp,
      verifyOtp,
      fetchWithAuth,
      signOut,
      setError,
    }),
    [
      loading,
      error,
      session,
      user,
      otpSent,
      requestOtp,
      verifyOtp,
      fetchWithAuth,
      signOut,
    ]
  );
  console.log(value)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}