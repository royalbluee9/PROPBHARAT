import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "pb_session_token";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip if handling Google OAuth callback
    if (window.location.hash?.includes("session_id=")) { setLoading(false); return; }
    checkAuth();
  }, [checkAuth]);

  const loginWithEmail = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { user: u, session_token } = res.data;
    localStorage.setItem(TOKEN_KEY, session_token);
    setUser(u);
    if (!u.phone) setShowPhoneModal(true);
    return u;
  };

  const registerWithEmail = async (name, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password });
    const { user: u, session_token } = res.data;
    localStorage.setItem(TOKEN_KEY, session_token);
    setUser(u);
    if (!u.phone) setShowPhoneModal(true);
    return u;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleGoogleSession = async (sessionId) => {
    const res = await axios.post(`${API}/auth/google-session`, { session_id: sessionId });
    const { user: u, session_token } = res.data;
    localStorage.setItem(TOKEN_KEY, session_token);
    setUser(u);
    if (!u.phone) setShowPhoneModal(true);
    return u;
  };

  const completeProfile = async (phone) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await axios.put(`${API}/auth/complete-profile`, { phone },
      { headers: { Authorization: `Bearer ${token}` } });
    setUser(res.data);
    setShowPhoneModal(false);
    if (pendingAction) { pendingAction(); setPendingAction(null); }
    return res.data;
  };

  const logout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      await axios.post(`${API}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("[Auth] Logout request failed:", err?.message);
    }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const requireAuth = (action) => {
    if (!user) {
      setPendingAction(() => action);
      setShowAuthModal(true);
      return false;
    }
    if (!user.phone) {
      setPendingAction(() => action);
      setShowPhoneModal(true);
      return false;
    }
    return true;
  };

  const onAuthSuccess = () => {
    setShowAuthModal(false);
    if (user && !user.phone) { setShowPhoneModal(true); return; }
    if (pendingAction && user?.phone) { pendingAction(); setPendingAction(null); }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, showAuthModal, setShowAuthModal, showPhoneModal, setShowPhoneModal,
      loginWithEmail, registerWithEmail, loginWithGoogle, handleGoogleSession,
      completeProfile, logout, requireAuth, onAuthSuccess, getHeaders,
      setPendingAction, checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
