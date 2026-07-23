import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Analytics.css';

function Analytics({ user, onLogout }) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [serverId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/${serverId}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-page">
      <header className="header">
        <button onClick={() => navigate(`/server/${serverId}`)} className="back-btn">← Back</button>
        <h1>Analytics</h1>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : analytics ? (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Server Activity</h3>
              <p>Messages from last 30 days</p>
            </div>
            <div className="analytics-card">
              <h3>Moderation</h3>
              <ul>
                {analytics.moderation.map(item => (
                  <li key={item.action}>{item.action}: {item.count}</li>
                ))}
              </ul>
            </div>
            <div className="analytics-card">
              <h3>Tickets</h3>
              <ul>
                {analytics.tickets.map(item => (
                  <li key={item.status}>{item.status}: {item.count}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="error">Failed to load analytics</div>
        )}
      </main>
    </div>
  );
}

export default Analytics;
