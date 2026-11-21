import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";

// Initiate the context
const AuthContext = createContext(null);

// Connect to the backend so the be can help the fe to collect info from db
const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

// a function that does the actual request
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let payload = {};

  try {
    payload = await response.json();
  } catch {
    // empty : we just want to have to create another error catcher should the BE respond with a non-json response
  }

  if (!response.ok) {
    const error = new Error(
      payload.error?.message || "Something went wrong. Please try again",
    );
    error.status = response.status;
    error.code = payload.error?.code;
    throw error;
  }

  return payload;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsloading] = useState(true);

  // check who is currently logged to verify them, if their session has expired call a new session rerfresh token for them, if not (if they are not a valid user) return then to a login/register
  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      try {
        let response;
        try {
          response = await apiRequest("/auth/me");
        } catch (error) {
          if (error.status !== 401) throw error;
          await apiRequest("/auth/refresh", { method: "POST" });
          response = await apiRequest("/auth/me");
        }

        if (isActive) setCurrentUser(response.user);
      } catch {
        if (isActive) setCurrentUser(null);
      } finally {
        if (isActive) setIsloading(false);
      }
    }

    loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setCurrentUser(response.user);
    return { success: true, ...response };
  }, []);

  const signUp = useCallback(async ({ displayName, email, password }) => {
    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ displayName, email, password }),
      });

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const verifyEmailLink = useCallback(async (token) => {
    try {
      const query = new URLSearchParams({ token });
      const response = await apiRequest(`/auth/verify-email?${query}`);

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const verifyEmailCode = useCallback(async (email, code) => {
    try {
      const response = await apiRequest("/auth/verify-email/code", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    try {
      const response = await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      const response = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });

      setCurrentUser(null);
      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const response = await apiRequest("/auth/logout", { method: "POST" });
      setCurrentUser(null);

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
        code: error.code,
      };
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isLoading,
      signIn,
      signUp,
      signOut,
      verifyEmailLink,
      verifyEmailCode,
      resendVerification,
      requestPasswordReset,
      resetPassword,
    }),
    [
      currentUser,
      isLoading,
      signIn,
      signOut,
      signUp,
      verifyEmailLink,
      verifyEmailCode,
      resendVerification,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.PropTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext };
