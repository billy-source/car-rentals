import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthCall = /auth\/(login|refresh)\//.test(original?.url || "");
    if (err.response?.status === 401 && !original._retry && !isAuthCall && localStorage.getItem("refresh")) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios
            .post(`${API}/auth/refresh/`, { refresh: localStorage.getItem("refresh") })
            .finally(() => (refreshing = null));
        const { data } = await refreshing;
        localStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;