import axios, { AxiosResponse } from "axios";
import { Preferences } from "@capacitor/preferences";

// Dynamic API_URL selection based on the environment
const API_URL = import.meta.env.VITE_API_URL;

// Axios instance
const forgotPasswordAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Set Content-Type and (optionally) auth headers
forgotPasswordAPI.interceptors.request.use(
  async (config) => {
    config.headers["Content-Type"] = "application/json";

    // Optionally include token if your forgot/reset routes are protected
    const { value: token } = await Preferences.get({ key: "token" });
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Sends an OTP to the user's email for password reset.
 */
export const sendOtpToEmail = async (email: string): Promise<AxiosResponse<any>> => {
  try {
    const { data } = await forgotPasswordAPI.post("/forgot-password", { email });
    return data;
  } catch (error: any) {
    console.error("Failed to send OTP:", error);
    const errorMessage = error.response?.data?.message || "Failed to send OTP";
    throw new Error(errorMessage);
  }
};

/**
 * Resets the password using the provided OTP and new password.
 */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<AxiosResponse<any>> => {
  try {
    const { data } = await forgotPasswordAPI.post("/reset-password", {
      email,
      otp,
      newPassword,
    });
    return data;
  } catch (error: any) {
    console.error("Failed to reset password:", error);
    const errorMessage = error.response?.data?.message || "Failed to reset password";
    throw new Error(errorMessage);
  }
};
