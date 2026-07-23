import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Tickets.css';

function Tickets({ user, onLogout }) {
  const { serverId } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [serverId]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`/api/tickets/${serverId}/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tickets-page">
      <header className="header">
        <button onClick={() => navigate(`/server/${serverId}`)} className="back-btn">← Back</button>
        <h1>Support Tickets</h1>
        <div className="header-right">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="content">
        <div className="tickets-container">
          <h2>All Tickets</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">No tickets</div>
          ) : (
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id}</td>
                      <td>{ticket.category}</td>
                      <td>{ticket.title}</td>
                      <td><span className={`status ${ticket.status}`}>{ticket.status}</span></td>
                      <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Tickets;
