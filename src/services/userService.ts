// services/userService.ts
import axios, { AxiosResponse } from 'axios';
import { Preferences } from '@capacitor/preferences';

// Dynamic API_URL selection based on the environment
const API_URL = import.meta.env.VITE_API_URL;

// Axios instance with base URL and credentials
const userAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor: Inject token from Capacitor Preferences
userAPI.interceptors.request.use(
  async (config) => {
    const { value: token } = await Preferences.get({ key: 'token' });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Update user data by user ID.
 * @param userId - ID of the user to update.
 * @param formData - Data to update the user with.
 * @returns A promise resolving to the updated user data.
 */
export const updateUserDataService = async (
  userId: string,
  formData: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await userAPI.put(`/users/${userId}`, formData);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update user data:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update user data';
    throw new Error(errorMessage);
  }
};
