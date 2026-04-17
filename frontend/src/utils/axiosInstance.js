import axios from "axios";

// ✅ After
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// Add token automatically to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired/invalid token globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const isTokenExpired =
        typeof message === "string" && message.toLowerCase().includes("expired");
      const reason = isTokenExpired ? "expired" : "unauthorized";

      if (window.location.pathname !== "/") {
        window.location.href = `/?session=${reason}`;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
