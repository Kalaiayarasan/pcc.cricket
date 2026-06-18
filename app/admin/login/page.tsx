'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('vishnu');
  const [password, setPassword] = useState('0045');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (email.trim().toLowerCase() === 'vishnu' && password === '0045') {
        document.cookie = 'admin_access=authenticated; path=/; max-age=3600; SameSite=Lax';
        window.location.assign('/admin/dashboard');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061409] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1a6b3a] rounded-full mix-blend-screen filter blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#d4a017] rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
      </div>

      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 shadow-[0_0_30px_rgba(212,160,23,0.3)] rounded-full p-1 border-2 border-[#d4a017]/30 bg-[#0d1f13]">
            <Image src="/pcc-logo.png" alt="PCC Logo" width={80} height={80} className="rounded-full" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-[#8fa899]">Pungampatti Cricket Club</p>
        </div>

        <form onSubmit={handleLogin} className="card p-8 backdrop-blur-xl bg-[#0d1f13]/80 border-[#1a6b3a]/50 shadow-2xl relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a6b3a] via-[#d4a017] to-[#1a6b3a]"></div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#e74c3c]/10 border border-[#e74c3c]/30 text-[#ff6b6b] text-sm text-center">
              {error}
            </div>
          )}

          <div className="form-group mb-5">
            <label className="form-label" htmlFor="email">Username</label>
            <input
              id="email"
              type="text"
              className="form-input bg-[#061409]/50"
              placeholder="Enter username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-8">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input bg-[#061409]/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-gold w-full btn-lg font-bold text-[#061409]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner spinner-gold w-5 h-5 border-[3px]"></span> 
                Authenticating...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-[#8fa899] hover:text-white transition-colors"
            >
              ← Return to Public Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
