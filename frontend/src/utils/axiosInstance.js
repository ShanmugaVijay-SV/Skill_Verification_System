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

export default axiosInstance;
