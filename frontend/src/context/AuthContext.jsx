import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Install: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('accessToken'),
    isAuthenticated: false,
    user: null, // { username, role }
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Check token expiration (optional, backend handles it mostly)
        if (decodedToken.exp * 1000 > Date.now()) {
          setAuthState({
            token: token,
            isAuthenticated: true,
            user: { username: decodedToken.sub, role: decodedToken.role },
            isLoading: false,
          });
        } else {
          // Token expired
          localStorage.removeItem('accessToken');
          setAuthState({ token: null, isAuthenticated: false, user: null, isLoading: false });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('accessToken');
        setAuthState({ token: null, isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      setAuthState({ token: null, isAuthenticated: false, user: null, isLoading: false });
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('accessToken', token);
    setAuthState({
      token: token,
      isAuthenticated: true,
      user: userData, // { username, role }
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAuthState({
      token: null,
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);