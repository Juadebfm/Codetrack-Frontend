import { useContext } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext.jsx";
import DashBoardPage from "./pages/DashBoardPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";

const ProtectedRoute = () => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? <Outlet /> : <Navigate replace to="/signin" />;
};

const GuestRoute = () => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? <Navigate replace to="/dashboard" /> : <Outlet />;
};

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<GuestRoute />}>
                <Route element={<SignInPage />} path="/signin" />
                <Route element={<SignUpPage />} path="/signup" />
                <Route element={<ForgotPasswordPage />} path="/forgot-password" />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<DashBoardPage />} path="/dashboard" />
            </Route>
            <Route element={<LegalPage />} path="/legal" />
            <Route element={<Navigate replace to="/signin" />} path="*" />
        </Routes>
    </BrowserRouter>
);

export default App;
