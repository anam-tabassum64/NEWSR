// FILE: frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  authForgotPassword,
  authGoogle,
  authGetMe,
  authLogin,
  authLogout,
  authRegister,
  authResetPassword,
  authUpdatePreferences,
} from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "newspulse_token";

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    preferences: user.preferences || {
      topics: [],
      languages: [],
      bookmarks: [],
      click_history: [],
    },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const data = await authGetMe();
        setUser(normalizeUser(data.user));
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    setAuthError(null);

    try {
      const data = await authLogin(email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(normalizeUser(data.user));
      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }

  async function signup(name, email, password) {
    setAuthError(null);
    const data = await authRegister(name, email, password);
    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(normalizeUser(data.user));
    }
    return data;
  }

  async function googleLogin(credential) {
    setAuthError(null);
    const data = await authGoogle(credential);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    return data;
  }

  async function logout() {
    try {
      await authLogout();
    } catch (error) {
      // Even if the backend fails, we still clear the local session.
    }

    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  }

  async function forgotPassword(email) {
    setAuthError(null);
    return authForgotPassword(email);
  }

  async function resetPassword(resetToken, newPassword) {
    setAuthError(null);
    return authResetPassword(resetToken, newPassword);
  }

  async function updatePreferences(prefs) {
    if (!token) {
      return null;
    }

    const data = await authUpdatePreferences(prefs);
    setUser((current) =>
      current
        ? {
            ...current,
            preferences: data.preferences,
          }
        : current
    );
    return data;
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      login,
      signup,
      googleLogin,
      logout,
      forgotPassword,
      resetPassword,
      updatePreferences,
    }),
    [user, token, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
