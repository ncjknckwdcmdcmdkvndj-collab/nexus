import React from 'react';
import './Login.css';

function Login({ onLogin }) {
  const handleDiscordLogin = () => {
    // TODO: Implement Discord OAuth flow
    console.log('Discord login initiated');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Nexus</h1>
        <p>Discord Bot Control Panel</p>
        <button onClick={handleDiscordLogin} className="discord-btn">
          <span>Login with Discord</span>
        </button>
      </div>
    </div>
  );
}

export default Login;
