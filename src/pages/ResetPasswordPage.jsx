import { useContext, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthField from "../components/auth/AuthField.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const ResetPasswordPage = () => {
  const { resetPassword } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const formRef = useRef(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setConfirmError("");
    setRequestError("");

    if (!token) {
      setRequestError("This reset link is missing its token. Request a new one.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setPasswordError("Use a password between 8 and 128 characters.");
      formRef.current?.elements.namedItem("password")?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("The passwords do not match.");
      formRef.current?.elements.namedItem("confirmPassword")?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(token, password);
      if (!result.success) {
        setRequestError(result.message || "We couldn't reset your password. Request a new link and try again.");
        return;
      }

      setIsComplete(true);
    } catch {
      setRequestError("We couldn't reset your password right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      description={isComplete
        ? "Your password has been changed."
        : "Choose a new password for your account."}
      mobileMessage="Secure your account."
      title={isComplete ? "Password updated" : "Create a new password"}
      variant="signin"
    >
      {isComplete ? (
        <div className="mt-6 space-y-5">
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
            role="status"
          >
            Your password was reset successfully. Log in with your new password.
          </p>
          <Link
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            to="/signin"
          >
            Continue to log in
          </Link>
        </div>
      ) : !token ? (
        <div className="mt-6 space-y-5">
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            role="alert"
          >
            This reset link is incomplete or invalid. Request a new one to continue.
          </p>
          <Link
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#16a34a] text-base font-semibold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            to="/forgot-password"
          >
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit} ref={formRef}>
          {requestError && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {requestError}
            </p>
          )}
          <AuthField error={passwordError} id="password" label="New password">
            <PasswordField
              describedBy="password-help"
              error={passwordError}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
                setRequestError("");
              }}
              placeholder="At least 8 characters"
              value={password}
            />
            <p className="mt-1.5 text-sm text-slate-500" id="password-help">
              Use 8 to 128 characters.
            </p>
          </AuthField>
          <AuthField error={confirmError} id="confirmPassword" label="Confirm new password">
            <PasswordField
              error={confirmError}
              id="confirmPassword"
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setConfirmError("");
                setRequestError("");
              }}
              placeholder="Enter your new password again"
              value={confirmPassword}
            />
          </AuthField>
          <button
            className="h-[52px] w-full rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving password…" : "Reset password"}
          </button>
          <p className="text-center text-sm text-slate-600">
            Remembered it?{" "}
            <Link className="font-semibold text-teal-600 hover:text-teal-700" to="/signin">
              Back to log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
