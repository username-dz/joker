import React, { createContext, useContext, useState, useEffect } from "react";
import HttpClient from "../utils/HttpClient";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  login: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      const userData = await HttpClient.get("auth/user/");

      setUser(userData);
      setIsAuthenticated(true);

      const isAdminUser =
        userData.is_staff == true || userData.is_superuser == true;
      setIsAdmin(isAdminUser);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await HttpClient.login(email, password);

      if (response.key) {
        try {
          const userData = await HttpClient.get("auth/user/");

          setUser(userData);
          setIsAuthenticated(true);

          const hasAdminRights =
            userData.is_staff == true || userData.is_superuser == true;
          setIsAdmin(hasAdminRights);
          return hasAdminRights;
        } catch (userError) {
          return false;
        }
      } else if (response.user) {
        const userData = response.user;
        setUser(userData);
        setIsAuthenticated(true);

        const hasAdminRights =
          userData.is_staff == true || userData.is_superuser == true;
        setIsAdmin(hasAdminRights);

        return hasAdminRights;
      }

      return false;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await HttpClient.post("auth/logout/");
    } catch (error) {
      // Silent error
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
