
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { useToast } from './use-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  googleLogin: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      console.log("Checking authentication...");
      const res = await authAPI.getMe();
      console.log("User authenticated:", res.data);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);
      const res = await authAPI.login({ email, password });
      console.log("Login successful:", res.data);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Success!",
        description: "Logged in successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      console.log("Attempting Google login with token");
      const res = await authAPI.googleLogin({ token });
      console.log("Google login successful:", res.data);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Success!",
        description: "Logged in with Google successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Google login error:", error);
      
      const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Attempting registration for:", email);
      const res = await authAPI.register({ name, email, password });
      console.log("Registration successful:", res.data);
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      toast({
        title: "Success!",
        description: "Account created successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        googleLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
