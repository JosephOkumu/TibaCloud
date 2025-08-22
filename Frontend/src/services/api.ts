import axios from "axios";

// Modify this URL to match your backend server address
// Using the WSL IP address instead of localhost to resolve networking issues
// IMPORTANT: Make sure your backend server is running without errors
const API_BASE_URL = "http://localhost:8000/api";

// Print a helpful message about connectivity
console.log("-------------------------------------");
console.log("FRONTEND is running at: http://172.26.239.25:8081");
console.log("BACKEND API is configured at:", API_BASE_URL);
console.log("If connection fails, check:");
console.log("1. Backend server is running without errors");
console.log("2. CORS is properly configured");
console.log("3. Network connectivity between frontend and backend");
console.log("-------------------------------------");

console.log("API is configured to connect to:", API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to attach auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    console.error("API Error:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);

      // Handle authentication errors
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optional: Redirect to login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.error(
        "Request was made but no response received:",
        error.request,
      );
      console.error("Is this a CORS issue or is the server down?");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
