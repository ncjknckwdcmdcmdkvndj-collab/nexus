import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Moderation.css';

function Moderation({ user, onLogout }) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModerationQueue();
  }, [serverId]);

  const fetchModerationQueue = async () => {
    try {
      const response = await axios.get(`/api/moderation/${serverId}/queue`);
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="moderation-page">
      <header className="header">
        <button onClick={() => navigate(`/server/${serverId}`)} className="back-btn">← Back</button>
        <h1>Moderation</h1>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="content">
        <div className="moderation-container">
          <h2>Moderation Queue</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : queue.length === 0 ? (
            <div className="empty-state">No moderation actions pending</div>
          ) : (
            <div className="queue-list">
              {queue.map(item => (
                <div key={item.id} className="queue-item">
                  <div className="item-content">
                    <h3>User: {item.user_id}</h3>
                    <p>{item.reason}</p>
                    <p className="confidence">Confidence: {item.confidence}%</p>
                  </div>
                  <div className="item-actions">
                    <button className="action-btn warn">Warn</button>
                    <button className="action-btn timeout">Timeout</button>
                    <button className="action-btn ignore">Ignore</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Moderation;
