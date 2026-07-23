import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await axios.get('/api/servers');
      setServers(response.data);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = (serverId) => {
    navigate(`/server/${serverId}`);
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Nexus</h1>
        <div className="header-right">
          <span>{user?.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>Servers</h3>
            <div className="servers-list">
              {servers.map(server => (
                <div
                  key={server.id}
                  className="server-item"
                  onClick={() => handleSelectServer(server.id)}
                >
                  <span className="server-icon">🟣</span>
                  <span>{server.name}</span>
                </div>
              ))}
            </div>
            <button className="add-server-btn">+ Add Server</button>
          </div>
        </aside>

        <main className="content">
          {loading ? (
            <div className="loading-state">Loading servers...</div>
          ) : (
            <div className="servers-grid">
              <h2>Your Servers</h2>
              <div className="grid">
                {servers.map(server => (
                  <div
                    key={server.id}
                    className="server-card"
                    onClick={() => handleSelectServer(server.id)}
                  >
                    <h3>{server.name}</h3>
                    <p>Click to manage</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
