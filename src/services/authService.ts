import axios, { AxiosResponse } from 'axios';
import { Preferences } from '@capacitor/preferences';

// Choose API URL based on environment
const API_URL = import.meta.env.VITE_API_URL;

// Async helper to get token from Capacitor Preferences
const getAuthToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: 'token' });
  return value;
};

// Login Request
export const loginRequest = async (data: { identifier: string; password: string; rememberMe: boolean }) => {
  try {
    const response: AxiosResponse<any> = await axios.post(`${API_URL}/login`, data, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error('Login request failed:', error);
    const errorMessage = error.response?.data?.message || 'Failed to login';
    throw new Error(errorMessage);
  }
};

// Send OTP
export const sendOtp = (email: string): Promise<AxiosResponse<any>> => {
  return axios.post(`${API_URL}/send-verification-otp`, { email }, { withCredentials: true })
    .catch(error => {
      console.error('Failed to send OTP:', error);
      throw error;
    });
};

// Verify OTP
export const verifyOtp = (email: string, otp: string): Promise<AxiosResponse<any>> => {
  return axios.post(`${API_URL}/verify-otp`, { email, otp }, { withCredentials: true })
    .catch(error => {
      console.error('Failed to verify OTP:', error);
      throw error;
    });
};

// Verify Password
export const verifyPassword = async (password: string) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await axios.post(
      `${API_URL}/verify-password`,
      { password },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Password verification failed:', error);
    const errorMessage = error.response?.data?.message || 'Failed to verify password';
    throw new Error(errorMessage);
  }
};
