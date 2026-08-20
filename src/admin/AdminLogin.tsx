import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

export const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (res.ok) {
        login();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121414] text-white flex items-center justify-center font-['Inter']">
      <div className="bg-[#1a1c1c] p-8 rounded-xl border border-white/10 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-[#c4c7c7] text-sm">Art Avenue Studio CMS</p>
        </div>
        
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#c4c7c7] mb-1">Username</label>
            <input 
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-[#4b8eff] outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#c4c7c7] mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-[#4b8eff] outline-none transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4b8eff] text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
