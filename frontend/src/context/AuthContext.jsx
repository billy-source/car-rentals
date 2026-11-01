import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only need to load the user if there's a saved token
  const [loading, setLoading] = useState(() => !!localStorage.getItem("access"));

  useEffect(() => {
    if (!localStorage.getItem("access")) return;
    api.get("/auth/me/")
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}