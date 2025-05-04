import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Ensure this matches the backend's base URL
  withCredentials: true
});

// Add interceptor to include CSRF token in all requests
api.interceptors.request.use(async (config) => {
  if (!localStorage.getItem("csrfToken")) {
    const { data } = await axios.get("http://localhost:3000/auth/csrf-token", {
      withCredentials: true,
    });
    localStorage.setItem("csrfToken", data.csrfToken); // Store CSRF token
  }

  config.headers["X-CSRF-Token"] = localStorage.getItem("csrfToken"); // Add CSRF token to headers
  return config;
});

export default api;
