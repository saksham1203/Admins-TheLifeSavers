import axios from "axios";
import { Preferences } from "@capacitor/preferences";

// Dynamic API_URL selection based on the environment
const API_URL = import.meta.env.VITE_API_URL;

// Axios instance
const dashboardAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Async helper to get token from Capacitor Preferences
const getAuthToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: "token" });
  return value;
};

// Interceptor with async token injection workaround
dashboardAPI.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token && config?.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API to get donors
export const getDonors = async (
  country: string,
  state: string,
  district: string,
  city: string,
  bloodGroup: string
) => {
  const { data } = await dashboardAPI.get(
    `/users?country=${country}&state=${state}&district=${district}&city=${city}&bloodGroup=${bloodGroup}`
  );
  return data;
};

// API to verify password
export const verifyPassword = async (password: string) => {
  const { data } = await dashboardAPI.post(`/verify-password`, { password });
  return data;
};
