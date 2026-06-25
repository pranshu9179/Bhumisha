import axios from "axios";
import { STORAGE_KEYS } from "@/lib/constants";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://appbackend.bhumishaagro.co.in/api";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  try {
    const session = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.SESSION) || "null",
    );
    return session?.token || session?.accessToken || null;
  } catch {
    return null;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message;
    error.displayMessage = message;
    return Promise.reject(error);
  },
);
