import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Small helper to decode JWT payload (without external libs)
function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Backend issues claims with:
// - sub: userId
// - unique_name: phone number
// - role: role
// - exp: expiration (unix seconds)
function parseToken(token) {
  const payload = decodeJwt(token);
  if (!payload) return { payload: null, userId: null, role: null, exp: null };
  const userId = payload.sub || payload.nameid || null;
  const role = payload.role || null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  return { payload, userId, role, exp };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  // Load from localStorage once on mount
  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    const uJson = localStorage.getItem("auth_user");

    if (t) {
      const { userId: uid, role: rl, exp } = parseToken(t);
      const nowSec = Math.floor(Date.now() / 1000);
      if (exp && exp < nowSec) {
        // token expired
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } else {
        setToken(t);
        setUserId(uid || null);
        setRole(rl || null);
      }
    }

    if (uJson) {
      try {
        setUser(JSON.parse(uJson));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Update derived userId/role when token changes (set programmatically)
  useEffect(() => {
    if (!token) {
      setUserId(null);
      setRole(null);
      return;
    }
    const { userId: uid, role: rl } = parseToken(token);
    setUserId(uid || null);
    setRole(rl || null);
  }, [token]);

  const isAuthenticated = !!token;

  const value = useMemo(() => ({
    token,
    user,
    userId,
    role,
    isAuthenticated,
    // Set auth after login
    setAuth: ({ token: newToken, user: newUser }) => {
      if (newToken) {
        localStorage.setItem("auth_token", newToken);
        setToken(newToken);
      }
      if (newUser) {
        localStorage.setItem("auth_user", JSON.stringify(newUser));
        setUser(newUser);
      }
    },
    // Clear auth
    logout: () => {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setToken(null);
      setUser(null);
      setUserId(null);
      setRole(null);
    },
  }), [token, user, userId, role, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
