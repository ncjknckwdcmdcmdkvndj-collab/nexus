import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerPanel from './pages/ServerPanel';
import Moderation from './pages/Moderation';
import Tickets from './pages/Tickets';
import Analytics from './pages/Analytics';
import Emojis from './pages/Emojis';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/api/auth/verify');
      if (response.data.valid) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/server/:serverId"
          element={isAuthenticated ? <ServerPanel user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/server/:serverId/moderation"
          element={isAuthenticated ? <Moderation user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/server/:serverId/tickets"
          element={isAuthenticated ? <Tickets user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/server/:serverId/analytics"
          element={isAuthenticated ? <Analytics user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/server/:serverId/emojis"
          element={isAuthenticated ? <Emojis user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
