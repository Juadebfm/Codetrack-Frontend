import { useState } from "react";
import PropTypes from "prop-types";

const VerificationRecoveryToast = ({ message, onResend, onSignIn }) => {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async (event) => {
    event.stopPropagation();
    setIsResending(true);
    const succeeded = await onResend();
    if (!succeeded) setIsResending(false);
  };

  const handleSignIn = (event) => {
    event.stopPropagation();
    onSignIn();
  };

  return (
    <div className="space-y-3">
      <p>{message}</p>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-md bg-white/15 px-3 py-1.5 text-sm font-semibold text-inherit transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-70"
          disabled={isResending}
          onClick={handleResend}
          type="button"
        >
          {isResending ? "Sending…" : "Resend verification"}
        </button>
        {onSignIn && (
          <button
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-inherit underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={handleSignIn}
            type="button"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
};

VerificationRecoveryToast.propTypes = {
  message: PropTypes.string.isRequired,
  onResend: PropTypes.func.isRequired,
  onSignIn: PropTypes.func,
};

export default VerificationRecoveryToast;
