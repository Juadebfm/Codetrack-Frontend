import { createContext, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getMockData } from "../services/mockDataService.js";

const AuthContext = createContext(null);
const USERS_KEY = "codetrack-demo-users";
const SESSION_KEY = "codetrack-session";

const publicUser = (account) => {
    const user = { ...account };
    delete user.password_hash;
    return user;
};
const readJson = (storage, key, fallback) => {
    try {
        return JSON.parse(storage.getItem(key)) ?? fallback;
    } catch {
        storage.removeItem(key);
        return fallback;
    }
};
const readSession = () => readJson(sessionStorage, SESSION_KEY, null) ?? readJson(localStorage, SESSION_KEY, null);
const hashPassword = async (password) => {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export function AuthProvider({ children }) {
    const [mockUsers, setMockUsers] = useState(() => [...getMockData().mock_auth_users, ...readJson(localStorage, USERS_KEY, [])]);
    const [currentUser, setCurrentUser] = useState(readSession);

    const persistSession = useCallback((user, remember) => {
        const storage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;
        otherStorage.removeItem(SESSION_KEY);
        storage.setItem(SESSION_KEY, JSON.stringify(user));
        setCurrentUser(user);
    }, []);

    const signIn = useCallback(async (email, password, remember = false) => {
        const passwordHash = await hashPassword(password);
        const matchingUser = mockUsers.find((user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password_hash === passwordHash);
        if (!matchingUser) return { success: false, message: "Invalid email or password." };
        const user = publicUser(matchingUser);
        persistSession(user, remember);
        return { success: true, message: "Sign in successful.", user };
    }, [mockUsers, persistSession]);

    const signUp = useCallback(async ({ displayName, email, password }) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (mockUsers.some((user) => user.email.toLowerCase() === normalizedEmail)) return { success: false, message: "Email already in use." };
        const newUser = {
            id: crypto.randomUUID(), display_name: displayName.trim(), email: normalizedEmail,
            password_hash: await hashPassword(password), plan: "free",
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        };
        localStorage.setItem(USERS_KEY, JSON.stringify([...readJson(localStorage, USERS_KEY, []), newUser]));
        setMockUsers((users) => [...users, newUser]);
        const user = publicUser(newUser);
        persistSession(user, true);
        return { success: true, message: "Sign up successful.", user };
    }, [mockUsers, persistSession]);

    const signInWithProvider = useCallback((provider, remember = true) => {
        const user = publicUser(mockUsers[0]);
        persistSession(user, remember);
        return { success: true, message: `${provider} demo sign-in successful.`, user };
    }, [mockUsers, persistSession]);

    const signOut = useCallback(() => {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
    }, []);

    const value = useMemo(() => ({ currentUser, isAuthenticated: Boolean(currentUser), signIn, signInWithProvider, signOut, signUp }), [currentUser, signIn, signInWithProvider, signOut, signUp]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
export { AuthContext };
