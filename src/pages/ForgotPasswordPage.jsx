import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthField from "../components/auth/AuthField.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useContext(AuthContext);
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    setError("");
    setRequestError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset(email.trim());
      if (!result.success) {
        setRequestError(
          result.message ||
            "We couldn't send reset instructions. Please try again.",
        );
        return;
      }
      setNotice(
        "If an account matches that address, reset instructions have been sent.",
      );
    } catch {
      setRequestError(
        "We couldn't send reset instructions right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      description="Enter your email to receive reset instructions."
      mobileMessage="Recover access."
      title="Reset your password"
      variant="signin"
    >
      <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
        {notice && (
          <p
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
          >
            {notice}
          </p>
        )}
        {requestError && (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {requestError}
          </p>
        )}
        <AuthField error={error} id="reset-email" label="Email">
          <input
            ref={emailRef}
            aria-describedby={error ? "reset-email-error" : undefined}
            aria-invalid={Boolean(error)}
            autoComplete="email"
            className={`h-11 w-full rounded-xl border px-3 text-base outline-none focus:ring-2 focus:ring-emerald-100 ${error ? "border-red-500" : "border-slate-200"}`}
            id="reset-email"
            name="reset-email"
            onChange={(event) => {
              setEmail(event.target.value);
              setNotice("");
              setRequestError("");
              if (error)
                setError(
                  /^\S+@\S+\.\S+$/.test(event.target.value.trim()) ? "" : error,
                );
            }}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </AuthField>
        <button
          className="h-[52px] w-full rounded-xl bg-[#16a34a] font-semibold text-white hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Sending…" : "Send reset instructions"}
        </button>
        <p className="text-center text-sm text-slate-600">
          <Link className="font-semibold text-teal-600" to="/signin">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
