import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  try {
    const url = isLogin
      ? "http://localhost:8080/api/auth/login"
      : "http://localhost:8080/api/auth/register";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    setMessage({ type: "success", text: data.message || "Success!" });
    
    // Set user data to show dashboard
    const userName = data?.user?.name || data?.username || formData.username || formData.email.split('@')[0];
    setUser({ name: userName });

  } catch (error) {
    setMessage({ type: "error", text: error.message });
  } finally {
    setLoading(false);
  }
};

 const handleLogout = async(e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8080/api/auth/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Logout failed");
      }

      setMessage({ type: "success", text: data.message || "Logged out successfully" });
      setUser(null); 

 } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleservice = async(e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:8080/api/auth/get-me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        credentials: 'include'
      });

      const data = await res.json();
      console.log("Service response:", data);
      if (!res.ok) {
        throw new Error(data.message || "Service request failed");
      }

      setMessage({ type: "success", text: data.message || "Service requested successfully" });

    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
};

  const switchTab = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setMessage(null);
    setFormData({ username: '', email: '', password: '' });
  };

  if (user) {
    return (
      <div className="app-container">
        <div className="auth-wrapper dashboard-wrapper">
          <div className="dashboard-content">
            <h2 className="form-title" style={{ marginTop: '30px' }}>Welcome, {user.name}</h2>
            <div className="dashboard-actions">
              <button className="submit-btn" onClick={handleservice}>
                Get some service
              </button>
              <button 
                className="submit-btn logout-btn" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="auth-wrapper">
        <div className="tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Login
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Sign Up
          </button>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          <h2 className="form-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {message && (
            <div className={`success-banner`}>
              {message.text}
            </div>
          )}

          {!isLogin && (
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <span className="icon">👤</span>
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <span className="icon">✉️</span>
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <span className="icon">🔒</span>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>

          <p className="message">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a href="#" onClick={(e) => { e.preventDefault(); switchTab(!isLogin); }} style={{ color: '#b197fc', textDecoration: 'none' }}>
              {isLogin ? 'Sign up here' : 'Login here'}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default App;
