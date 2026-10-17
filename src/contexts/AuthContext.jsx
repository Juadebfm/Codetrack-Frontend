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
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://codetrack-backend-o1n5.onrender.com/api/v1"
).replace(/\/$/, "");

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
      body: JSON.stringify({ email: password }),
    });
    setCurrentUser(response.user);
    return response;
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
      };
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      const query = new URLSearchParams({ token });
      const response = await apiRequest(`/auth/verify-email?${query}`);

      return { success: true, ...response };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        status: error.status,
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
      verifyEmail,
    }),
    [currentUser, isLoading, signIn, signOut, signUp, verifyEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.PropTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext };
