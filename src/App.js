import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import Categories from './components/Categories';
import Navbar from './components/Navbar';
import apiService from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session on app load
    const restoreSession = async () => {
      try {
        // Check if we have a stored access token
        const savedToken = sessionStorage.getItem('finapp_token');
        const savedUser = localStorage.getItem('finapp_user');
        
        if (savedToken && savedUser) {
          // Restore token to API service
          apiService.setAccessToken(savedToken);
          
          // Try to refresh token in case it's expired
          const refreshed = await apiService.refreshAccessToken();
          
          if (refreshed) {
            // Token refreshed successfully, get new token
            const newToken = apiService.getAccessToken();
            sessionStorage.setItem('finapp_token', newToken);
          }
          
          // Verify session is still valid by getting current user
          try {
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Session validation failed:', error);
            // Clear invalid session
            sessionStorage.removeItem('finapp_token');
            localStorage.removeItem('finapp_user');
            apiService.clearAuth();
          }
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        // Clear any stale data
        sessionStorage.removeItem('finapp_token');
        localStorage.removeItem('finapp_user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (loginResponse) => {
    // loginResponse contains: { accessToken, user }
    const { accessToken, user } = loginResponse;
    
    // Store access token in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('finapp_token', accessToken);
    
    // Store user data in localStorage (persists across sessions)
    localStorage.setItem('finapp_user', JSON.stringify(user));
    
    // Set API service token
    apiService.setAccessToken(accessToken);
    
    // Update state
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear refresh token cookie
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local data
      sessionStorage.removeItem('finapp_token');
      localStorage.removeItem('finapp_user');
      
      // Clear API service state
      apiService.clearAuth();
      
      // Update component state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/transactions" element={<Transactions user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/categories" element={<Categories user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
