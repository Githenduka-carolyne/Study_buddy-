import React, { createContext, useState, useContext, useEffect } from 'react';

const BASE_URL = 'http://localhost:5001/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check if the server is available
const checkServerAvailability = async () => {
  try {
    console.log("Checking server availability...");
    const token = localStorage.getItem("token");
     if (!token) {
       console.error("Token is null or undefined");
       return false;
     }
    const response = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Server availability check failed: ${response.status} ${response.statusText}`
      );
    }

    console.log("Server availability check passed!");
    return true;
  } catch (error) {
    console.error("Server availability check failed:", error);
    return false;
  }
};

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if server is available first
      const isServerAvailable = await checkServerAvailability();
      if (!isServerAvailable) {
        setError('Unable to connect to server. Please ensure the backend server is running.');
        setLoading(false);
        setUser(null);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Remove any quotes from token
      const cleanToken = token.replace(/['"]+/g, '');
      console.log('Verifying token:', cleanToken);
      
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('User verified:', userData);
      } else {
        console.log('Token verification failed, clearing token');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (values) => {
    try {
      setError(null);
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          emailAddress: values.emailAddress,
          password: values.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token without quotes
      const token = data.token.replace(/['"]+/g, '');
      console.log('Login successful, setting token:', token);
      localStorage.setItem('token', token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (token) {
        // Call backend logout endpoint
        const cleanToken = token.replace(/['"]+/g, '');
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      }

      // Clear local storage and user state
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear token and user state even if backend call fails
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Signup function
  const signup = async (values) => {
    try {
      setError(null);
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      return { success: true, message: 'Signup successful' };
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
