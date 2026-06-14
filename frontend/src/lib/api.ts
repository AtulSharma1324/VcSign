import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import {
  AUTH_API_URL,
  USER_API_URL,
  CALL_API_URL,
  CHAT_API_URL,
  TTS_API_URL,
  NLP_API_URL,
} from "@/lib/constants";

// ===========================
// Axios API Client
// ===========================

/** Create a preconfigured axios instance for a given base URL. */
function createClient(baseURL: string) {
  const client = axios.create({
    baseURL,
    timeout: 60_000, // Increased to 60s to handle Render free-tier cold starts
    headers: { "Content-Type": "application/json" },
  });

  // Attach JWT access token to every outgoing request.
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 responses by attempting a token refresh.
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = useAuthStore.getState().refreshToken;
          if (!refreshToken) throw new Error("No refresh token");

          const { data } = await axios.post(`${AUTH_API_URL}/refresh`, {
            refreshToken,
          });

          useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return client(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Service-specific API clients
export const authApi = createClient(AUTH_API_URL);
export const userApi = createClient(USER_API_URL);
export const callApi = createClient(CALL_API_URL);
export const chatApi = createClient(CHAT_API_URL);
export const ttsApi = createClient(TTS_API_URL);
export const nlpApi = createClient(NLP_API_URL);
