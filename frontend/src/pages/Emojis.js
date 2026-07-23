import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Emojis.css';

function Emojis({ user, onLogout }) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [emojis, setEmojis] = useState({ bot: [], server: [], combined: [] });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmojis();
    fetchFavorites();
  }, [serverId]);

  const fetchEmojis = async () => {
    try {
      const response = await axios.get(`/api/emojis/${serverId}/combined`);
      setEmojis(response.data);
    } catch (error) {
      console.error('Error fetching emojis:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`/api/emojis/${serverId}/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addFavorite = async (emoji) => {
    try {
      await axios.post(`/api/emojis/${serverId}/favorite`, {
        emoji_id: emoji.emoji_id,
        emoji_name: emoji.name,
        emoji_url: emoji.url
      });
      await fetchFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFavorite = async (emojiId) => {
    try {
      await axios.delete(`/api/emojis/${serverId}/favorite/${emojiId}`);
      await fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorite = (emojiId) => {
    return favorites.some(fav => fav.emoji_id === emojiId);
  };

  const getFilteredEmojis = () => {
    let filtered = [];
    
    if (activeTab === 'all') {
      filtered = emojis.combined;
    } else if (activeTab === 'bot') {
      filtered = emojis.bot;
    } else if (activeTab === 'server') {
      filtered = emojis.server;
    } else if (activeTab === 'favorites') {
      filtered = favorites;
    }

    if (searchTerm) {
      filtered = filtered.filter(emoji =>
        emoji.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const copyToClipboard = (emojiId) => {
    navigator.clipboard.writeText(`<:${emojiId}>`);
  };

  return (
    <div className="emojis-page">
      <header className="header">
        <button onClick={() => navigate(`/server/${serverId}`)} className="back-btn">← Back</button>
        <h1>Emoji Manager</h1>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="emojis-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="emoji-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({emojis.combined.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
            onClick={() => setActiveTab('bot')}
          >
            Bot ({emojis.bot.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'server' ? 'active' : ''}`}
            onClick={() => setActiveTab('server')}
          >
            Server ({emojis.server.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ⭐ Favorites ({favorites.length})
          </button>
        </div>

        <div className="emoji-grid">
          {loading ? (
            <div className="loading">Loading emojis...</div>
          ) : getFilteredEmojis().length === 0 ? (
            <div className="empty-state">No emojis found</div>
          ) : (
            getFilteredEmojis().map((emoji) => (
              <div key={emoji.emoji_id} className="emoji-card">
                <img
                  src={emoji.url}
                  alt={emoji.name}
                  className="emoji-image"
                  title={emoji.name}
                />
                <div className="emoji-name">{emoji.name}</div>
                <div className="emoji-actions">
                  <button
                    className={`action-btn copy-btn`}
                    onClick={() => copyToClipboard(emoji.emoji_id)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <button
                    className={`action-btn favorite-btn ${isFavorite(emoji.emoji_id) ? 'active' : ''}`}
                    onClick={() =>
                      isFavorite(emoji.emoji_id)
                        ? removeFavorite(emoji.emoji_id)
                        : addFavorite(emoji)
                    }
                    title={isFavorite(emoji.emoji_id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Emojis;
