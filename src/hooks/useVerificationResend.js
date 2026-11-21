import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./useAuth.js";

export function useVerificationResend() {
  const { resendVerification } = useAuth();
  const navigate = useNavigate();

  return useCallback(
    async (email, toastId) => {
      try {
        const result = await resendVerification(email);
        if (!result.success) {
          toast.error(
            result.message ||
              "We couldn't resend a verification code. Please try again.",
          );
          return false;
        }

        toast.dismiss(toastId);
        navigate("/verify-email", {
          replace: true,
          state: { email },
        });
        return true;
      } catch {
        toast.error(
          "We couldn't resend a verification code right now. Please try again.",
        );
        return false;
      }
    },
    [navigate, resendVerification],
  );
}
