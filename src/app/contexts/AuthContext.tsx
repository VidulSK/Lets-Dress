import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  password: string;
  age: string;
  email: string;
  phone: string;
  gender: string;
  skinUndertone: string;
  favoriteColor: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  signup: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('outfit-user');
    return stored ? JSON.parse(stored) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('outfit-users');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('outfit-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('outfit-users', JSON.stringify(users));
  }, [users]);

  const signup = (userData: User) => {
    setUsers(prev => [...prev, userData]);
    setUser(userData);
  };

  const login = (username: string, password: string) => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
