import { useMutation } from "@tanstack/react-query";
import { sendOtpToEmail, resetPassword } from "../services/forgotPasswordService";

// Hook to handle sending OTP to the email
export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await sendOtpToEmail(email);
    },
  });
};

// Hook to handle password reset
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
      return await resetPassword(email, otp, newPassword);
    },
  });
};
