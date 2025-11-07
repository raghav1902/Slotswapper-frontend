// src/App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Notifications from './components/Notifications';
import './App.css';

// --- Auth Context ---
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const STORAGE_USER_KEY = 'user';
const STORAGE_TOKEN_KEY = 'userToken';

const AuthProvider = ({ children }) => {
  // Initialize from localStorage (persistent auth)
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY);
      const userJson = localStorage.getItem(STORAGE_USER_KEY);
      const parsed = userJson ? JSON.parse(userJson) : null;
      return token && parsed ? parsed : null;
    } catch {
      return null;
    }
  });

  // Keep context in sync across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_USER_KEY || e.key === STORAGE_TOKEN_KEY) {
        try {
          const token = localStorage.getItem(STORAGE_TOKEN_KEY);
          const userJson = localStorage.getItem(STORAGE_USER_KEY);
          const parsed = userJson ? JSON.parse(userJson) : null;
          setUser(token && parsed ? parsed : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (userData) => {
    // Expecting { id, name?, email, token }
    if (userData?.token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, userData.token);
    }
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token: user?.token }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Route Guards ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  // If user is logged in, prevent visiting /login or /signup
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

// --- Main App ---
function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>SlotSwapper</h1>
          <nav>
            {user ? (
              <>
                <Link to="/">Dashboard</Link>
                <Link to="/marketplace">Marketplace</Link>
                <Link to="/notifications">Notifications</Link>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
              </>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            {/* Public-only routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <AuthForm type="login" />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <AuthForm type="signup" />
                </PublicOnlyRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? '/' : '/login'} replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default Root;
