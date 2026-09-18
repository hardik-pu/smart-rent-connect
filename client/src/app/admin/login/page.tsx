'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, ShieldCheck, Lock, User, ArrowLeft, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, logout } = useAuth();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    const fromParam = searchParams.get('from') || searchParams.get('redirect');
    if (
      fromParam &&
      fromParam.startsWith('/') &&
      !fromParam.startsWith('//') &&
      !fromParam.startsWith('/admin/login')
    ) {
      router.push(fromParam);
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        const storedPrev = sessionStorage.getItem('src_prev_path');
        if (
          storedPrev &&
          storedPrev.startsWith('/') &&
          !storedPrev.startsWith('//') &&
          storedPrev !== '/admin/login'
        ) {
          router.push(storedPrev);
          return;
        }
      } catch {
        // ignore
      }

      if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
        router.back();
        return;
      }
    }

    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId.trim() || !password) {
      setError('Admin ID and Password are required.');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login(adminId.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Invalid Admin ID or Password.');
      return;
    }

    // Role check: non-admin users must be rejected
    if (res.user?.role !== 'ADMIN') {
      await logout();
      setError('Access Denied: This portal is strictly reserved for Platform Administrators.');
      return;
    }

    // Success -> redirect to Admin Dashboard using router.replace to avoid history loops
    router.replace('/dashboard/admin');
  };

  if (user) {
    if (user.role === 'ADMIN') {
      return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-elevated text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Administrator Authenticated</h2>
              <p className="text-xs text-slate-500">
                You are currently logged in as <span className="font-bold text-slate-800">{user.name}</span> (Admin ID: <span className="font-mono font-bold text-purple-700">{user.email}</span>).
              </p>
            </div>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => router.replace('/dashboard/admin')}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Go to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Previous Page</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                Sign Out from Admin Account
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Authenticated as non-admin role
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-amber-200/80 shadow-elevated text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Administrator Privileges Required</h2>
            <p className="text-xs text-slate-600">
              You are currently authenticated as <span className="font-bold text-slate-800">{user.name}</span> ({user.role}).
              This portal requires an Administrator account.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Sign Out &amp; Log In as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Previous Page</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient decorative light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-7 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-purple-200/80 shadow-elevated transition-all duration-300">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="text-left leading-none">
              <span className="text-2xl font-black tracking-tight text-slate-900 block">
                Smart<span className="text-purple-600">Rent</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-purple-600/80 uppercase">ADMIN PORTAL</span>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
            Admin Login
          </h2>
          <p className="text-xs text-slate-500">
            Platform Moderation &amp; System Administration
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-purple-800">
          <Shield className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Restricted portal. Manual credential verification required.</span>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Admin Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Admin ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Admin ID"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-purple-600/20 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span>Admin Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/login"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            Not an administrator? Return to <span className="font-semibold text-blue-600 hover:underline">User Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading admin login...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
