import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import AuthField from "../components/auth/AuthField.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { AuthContext } from "../contexts/AuthContext.jsx";

const CODE_LENGTH = 6;
const VERIFICATION_TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
const emptyCode = Array(CODE_LENGTH).fill("");
const emailPattern = /^\S+@\S+\.\S+$/;

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
  const { verifyEmailLink, verifyEmailCode, resendVerification } =
    useContext(AuthContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasToken = searchParams.has("token");
  const token = searchParams.get("token") ?? "";
  const initialEmail =
    typeof location.state?.email === "string" ? location.state.email : "";
  const initialExpiry =
    typeof location.state?.verificationExpiresAt === "number"
      ? location.state.verificationExpiresAt
      : null;
  const inputRefs = useRef([]);
  const emailRef = useRef(null);
  const linkRequestsRef = useRef(new Map());
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState(emptyCode);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResendSuccess, setIsResendSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [linkResult, setLinkResult] = useState({
    token,
    status: hasToken ? "loading" : "idle",
  });
  const [expiresAt, setExpiresAt] = useState(initialExpiry);
  const [currentTime, setCurrentTime] = useState(
    initialExpiry === null
      ? 0
      : initialExpiry - VERIFICATION_TOKEN_LIFETIME_MS,
  );
  const remainingTime =
    expiresAt === null ? null : Math.max(0, expiresAt - currentTime);
  const isExpired = remainingTime !== null && remainingTime === 0;
  const linkStatus = hasToken
    ? linkResult.token === token
      ? linkResult.status
      : "loading"
    : "idle";

  useEffect(() => {
    if (!hasToken) return undefined;

    let isActive = true;
    const pendingRequest =
      linkRequestsRef.current.get(token) ?? verifyEmailLink(token);
    linkRequestsRef.current.set(token, pendingRequest);

    pendingRequest
      .then((result) => {
        if (!isActive) return;

        setLinkResult({
          token,
          status: result.success ? "success" : "error",
        });
      })
      .catch(() => {
        if (isActive) setLinkResult({ token, status: "error" });
      })
      .finally(() => {
        if (linkRequestsRef.current.get(token) === pendingRequest) {
          linkRequestsRef.current.delete(token);
        }
      });

    return () => {
      isActive = false;
    };
  }, [hasToken, token, verifyEmailLink]);

  useEffect(() => {
    if (expiresAt === null) return undefined;

    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const timer = window.setInterval(updateTime, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const validateEmail = () => {
    if (!emailPattern.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      emailRef.current?.focus();
      return false;
    }

    setEmailError("");
    return true;
  };

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

    if (!validateEmail()) return;

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
      const result = await verifyEmailCode(email.trim(), verificationCode);
      if (!result.success) {
        setError(
          "That code is incorrect, expired, or has already been used. Request a new code to continue.",
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
    if (isResending || !validateEmail()) return;

    setIsResending(true);
    setResendMessage("");
    setIsResendSuccess(false);
    setError("");

    try {
      const result = await resendVerification(email.trim());
      if (!result.success) {
        toast.error(
          result.message || "We couldn't resend the code. Please try again.",
        );
        return;
      }

      setCode([...emptyCode]);
      setExpiresAt(Date.now() + VERIFICATION_TOKEN_LIFETIME_MS);
      setCurrentTime(Date.now());
      setIsResendSuccess(true);
      setResendMessage(
        "If an unverified account exists for this email, a new code has been sent.",
      );
      inputRefs.current[0]?.focus();
    } catch {
      toast.error("We couldn't resend the code right now. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const showSuccess = hasToken
    ? linkStatus === "success"
    : isVerified;
  const showLinkError = hasToken && linkStatus === "error";

  return (
    <AuthLayout
      description={
        showSuccess
          ? "Your email address has been confirmed."
          : hasToken
            ? linkStatus === "loading"
              ? "Confirming your email address."
              : "We couldn't confirm this verification link."
            : "Enter the 6-digit code we sent to your inbox."
      }
      mobileMessage="Verify email."
      title={
        showSuccess
          ? "Email verified"
          : hasToken
            ? "Verify your email"
            : "Check your email"
      }
      variant="signin"
    >
      {showSuccess ? (
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
      ) : hasToken ? (
        <div className="mt-6 space-y-5">
          {linkStatus === "loading" ? (
            <p className="text-sm text-slate-600" role="status">
              Verifying your email link…
            </p>
          ) : showLinkError ? (
            <>
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                role="alert"
              >
                This verification link is invalid, expired, or has already
                been used. Request a new code to continue.
              </p>
              <AuthField error={emailError} id="link-email" label="Email">
                <input
                  ref={emailRef}
                  aria-describedby={emailError ? "link-email-error" : undefined}
                  aria-invalid={Boolean(emailError)}
                  autoComplete="email"
                  className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${emailError ? "border-red-500" : "border-slate-200"}`}
                  id="link-email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setEmailError("");
                    setResendMessage("");
                  }}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                />
              </AuthField>
              {resendMessage && (
                <p
                  className={`text-sm ${isResendSuccess ? "text-emerald-700" : "text-red-600"}`}
                  role={isResendSuccess ? "status" : "alert"}
                >
                  {resendMessage}
                </p>
              )}
              <button
                className="h-[52px] w-full rounded-xl bg-[#16a34a] text-base font-semibold text-white shadow-[0_10px_20px_-12px_rgba(22,163,74,0.9)] transition hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                disabled={isResending}
                onClick={handleResend}
                type="button"
              >
                {isResending ? "Sending…" : "Request a new code"}
              </button>
              <p className="text-center text-sm text-slate-600">
                <Link
                  className="font-semibold text-teal-600 hover:text-teal-700"
                  to="/signin"
                >
                  Return to sign in
                </Link>
              </p>
            </>
          ) : null}
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
              <p>Enter the email address you used to sign up.</p>
            )}
            <p className="text-slate-500">Check your inbox and spam folder.</p>
          </div>

          <AuthField error={emailError} id="verification-email" label="Email">
            <input
              ref={emailRef}
              aria-describedby={
                emailError ? "verification-email-error" : undefined
              }
              aria-invalid={Boolean(emailError)}
              autoComplete="email"
              className={`h-11 w-full rounded-xl border bg-white px-3 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${emailError ? "border-red-500" : "border-slate-200"}`}
              id="verification-email"
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
                setResendMessage("");
              }}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </AuthField>

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
              className={`text-sm ${isResendSuccess ? "text-emerald-700" : "text-red-600"}`}
              role={isResendSuccess ? "status" : "alert"}
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
              disabled={isResending}
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
            {" · "}
            <Link
              className="font-semibold text-teal-600 hover:text-teal-700"
              to="/signin"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
