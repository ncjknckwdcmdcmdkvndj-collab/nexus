import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServerPanel.css';

function ServerPanel({ user, onLogout }) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchServerData();
  }, [serverId]);

  const fetchServerData = async () => {
    try {
      const [serverRes, overviewRes] = await Promise.all([
        axios.get(`/api/servers/${serverId}`),
        axios.get(`/api/servers/${serverId}/overview`)
      ]);
      setServer(serverRes.data);
      setOverview(overviewRes.data);
    } catch (error) {
      console.error('Error fetching server data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!server) return <div className="error">Server not found</div>;

  return (
    <div className="server-panel">
      <header className="header">
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
        <h1>{server.name}</h1>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
          onClick={() => navigate(`/server/${serverId}/moderation`)}
        >
          Moderation
        </button>
        <button
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => navigate(`/server/${serverId}/tickets`)}
        >
          Tickets
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => navigate(`/server/${serverId}/analytics`)}
        >
          Analytics
        </button>
      </nav>

      <main className="content">
        {overview && (
          <div className="overview-grid">
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-content">
                <p className="stat-label">Bot Status</p>
                <p className="stat-value">Online</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <p className="stat-label">Members</p>
                <p className="stat-value">{overview.members.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <p className="stat-label">Messages Today</p>
                <p className="stat-value">{overview.messagestoday.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚖️</div>
              <div className="stat-content">
                <p className="stat-label">Moderation Actions</p>
                <p className="stat-value">{overview.moderationActions}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ServerPanel;
