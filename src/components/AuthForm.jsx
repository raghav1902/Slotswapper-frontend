// src/components/AuthForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

const AuthForm = ({ type }) => {
  const isLogin = type === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'signup';

    try {
      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If you use cookie-based auth on the server, uncomment this:
        // credentials: 'include',
        body: JSON.stringify(payload),
      });

      // Try parsing JSON even on error to surface server message
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          (isLogin ? 'Invalid credentials.' : 'Failed to sign up.');
        throw new Error(msg);
      }

      // Normalize expected shapes:
      // { id, name, email, token } OR { user: { _id|id, name, email }, token }
      const user = {
        id: data?.id || data?._id || data?.user?.id || data?.user?._id || '',
        name: data?.name || data?.user?.name || name || '',
        email: data?.email || data?.user?.email || email,
        token: data?.token,
      };

      login(user);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 380, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 16 }}>{isLogin ? 'Log In' : 'Sign Up'}</h2>

      {error && (
        <p role="alert" style={{ color: 'red', marginBottom: 12 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 10,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Please wait…' : isLogin ? 'Log In' : 'Sign Up'}
        </button>

        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Using API: <code>{API_BASE}/api/{isLogin ? 'login' : 'signup'}</code>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
