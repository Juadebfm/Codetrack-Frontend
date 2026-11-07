import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const CODE_LENGTH = 6;
const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const emptyCode = Array(CODE_LENGTH).fill("");

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const VerifyEmailPage = () => {
  const { verifyEmail, resendVerification } = useContext(AuthContext);
  const location = useLocation();
  const email =
    typeof location.state?.email === "string" ? location.state.email : "";
  const initialExpiry =
    typeof location.state?.verificationExpiresAt === "number"
      ? location.state.verificationExpiresAt
      : null;
  const inputRefs = useRef([]);
  const [code, setCode] = useState(emptyCode);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState(initialExpiry);
  const [currentTime, setCurrentTime] = useState(
    initialExpiry === null
      ? 0
      : initialExpiry - VERIFICATION_TOKEN_LIFETIME_MS,
  );
  const remainingTime =
    expiresAt === null ? null : Math.max(0, expiresAt - currentTime);
  const isExpired = remainingTime !== null && remainingTime === 0;

  useEffect(() => {
    if (expiresAt === null) return undefined;

    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const updateCode = (index, value) => {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH - index);
    const nextCode = [...code];

    if (!digits) {
      nextCode[index] = "";
    } else {
      digits.split("").forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });
    }

    setCode(nextCode);
    setError("");

    if (digits) {
      const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handlePaste = (event, index) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;

    event.preventDefault();
    updateCode(index, digits);
    const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const verificationCode = code.join("");

    if (isExpired) {
      setError("This code has expired. Request a new code to continue.");
      return;
    }

    if (verificationCode.length !== CODE_LENGTH) {
      setError("Enter all 6 digits from the email.");
      const firstEmptyIndex = code.findIndex((digit) => !digit);
      inputRefs.current[firstEmptyIndex === -1 ? 0 : firstEmptyIndex]?.focus();
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await verifyEmail(verificationCode);
      if (!result.success) {
        setError(
          result.message ||
            "We couldn't verify that code. Check it and try again.",
        );
        return;
      }

      setIsVerified(true);
    } catch {
      setError("We couldn't verify your email right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;

    setIsResending(true);
    setResendMessage("");
    setError("");

    try {
      const result = await resendVerification(email);
      if (!result.success) {
        setResendMessage(
          result.message || "We couldn't resend the code. Please try again.",
        );
        return;
      }

      setCode([...emptyCode]);
      setExpiresAt(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);
      setCurrentTime(Date.now());
      setResendMessage(
        "If an unverified account exists for this email, a new code has been sent.",
      );
      inputRefs.current[0]?.focus();
    } catch {
      setResendMessage("We couldn't resend the code right now. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      description={
        isVerified
          ? "Your email address has been confirmed."
          : "Enter the 6-digit code we sent to your inbox."
      }
      mobileMessage="Verify email."
      title={isVerified ? "Email verified" : "Check your email"}
      variant="signin"
    >
      {isVerified ? (
        <div className="mt-6 space-y-5">
          <p
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
            role="status"
          >
            Your account is ready. You can now log in.
          </p>
          <Link
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            to="/signin"
          >
            Continue to log in
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm leading-6 text-slate-600">
            {email ? (
              <p>
                We sent a verification code to{" "}
                <span className="font-semibold text-slate-900">{email}</span>.
              </p>
            ) : (
              <p>
                We sent a verification code to the email address you used to
                sign up.
              </p>
            )}
            <p className="text-slate-500">Check your inbox and spam folder.</p>
          </div>

          <fieldset
            aria-describedby={
              error ? "verification-code-error" : "verification-code-help"
            }
          >
            <legend className="mb-2 block text-sm font-medium text-slate-900">
              Verification code
            </legend>
            <div className="flex max-w-sm justify-between gap-2 sm:gap-3">
              {code.map((digit, index) => (
                <input
                  aria-invalid={Boolean(error)}
                  aria-label={`Verification code digit ${index + 1} of ${CODE_LENGTH}`}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  className={`h-12 min-w-0 w-10 rounded-xl border bg-white text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:w-12 ${error ? "border-red-500" : "border-slate-200"}`}
                  inputMode="numeric"
                  key={index}
                  maxLength={CODE_LENGTH}
                  onChange={(event) => updateCode(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={(event) => handlePaste(event, index)}
                  pattern="[0-9]*"
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  value={digit}
                />
              ))}
            </div>
            <p
              className="mt-2 text-sm text-slate-500"
              id="verification-code-help"
            >
              The code contains 6 numbers.
            </p>
            {error && (
              <p
                className="mt-2 text-sm text-red-600"
                id="verification-code-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </fieldset>

          <p
            aria-live="off"
            className={`text-sm ${isExpired ? "text-red-600" : "text-slate-500"}`}
          >
            {remainingTime === null
              ? "Your code expires 24 hours after it is sent."
              : isExpired
                ? "This code has expired."
                : `Code expires in ${formatCountdown(remainingTime)}.`}
          </p>

          {resendMessage && (
            <p
              className={`text-sm ${resendMessage.startsWith("If an unverified") ? "text-emerald-700" : "text-red-600"}`}
              role={
                resendMessage.startsWith("If an unverified") ? "status" : "alert"
              }
            >
              {resendMessage}
            </p>
          )}

          <button
            className="h-[52px] w-full rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            disabled={isSubmitting || isExpired}
            type="submit"
          >
            {isSubmitting ? "Verifying…" : "Verify email"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Didn’t get the code?{" "}
            <button
              className="font-semibold text-teal-600 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-wait disabled:opacity-60"
              disabled={!email || isResending}
              onClick={handleResend}
              type="button"
            >
              {isResending ? "Sending…" : "Resend code"}
            </button>
          </p>

          <p className="text-center text-sm text-slate-600">
            Need to start again?{" "}
            <Link
              className="font-semibold text-teal-600 hover:text-teal-700"
              to="/signup"
            >
              Back to sign up
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
