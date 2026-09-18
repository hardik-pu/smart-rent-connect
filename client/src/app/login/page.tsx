'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Lock, Mail, ArrowRight, UserCheck, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

const getTargetDashboard = (userRole?: string, redirectUrl?: string | null) => {
  if (
    redirectUrl &&
    redirectUrl.startsWith('/') &&
    !redirectUrl.startsWith('//') &&
    redirectUrl !== '/login' &&
    redirectUrl !== '/register'
  ) {
    return redirectUrl;
  }
  switch (userRole) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'OWNER':
      return '/dashboard/owner';
    case 'AGENT':
      return '/dashboard/agent';
    case 'TENANT':
    default:
      return '/dashboard/tenant';
  }
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    const fromParam = searchParams.get('from') || searchParams.get('redirect');
    if (
      fromParam &&
      fromParam.startsWith('/') &&
      !fromParam.startsWith('//') &&
      !fromParam.startsWith('/login') &&
      !fromParam.startsWith('/register')
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
          storedPrev !== '/login' &&
          storedPrev !== '/register'
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

    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your ID/email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      const redirect = searchParams.get('redirect');
      const target = getTargetDashboard(res.user.role, redirect);
      router.replace(target);
    } else {
      setError(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
    setLoading(true);

    const res = await login(demoEmail, 'Password123!');
    setLoading(false);

    if (res.success && res.user) {
      const redirect = searchParams.get('redirect');
      const target = getTargetDashboard(res.user.role, redirect);
      router.replace(target);
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  const fromParam = searchParams.get('from');
  const registerHref = fromParam
    ? `/register?from=${encodeURIComponent(fromParam)}`
    : '/register';
  const adminLoginHref = fromParam
    ? `/admin/login?from=${encodeURIComponent(fromParam)}`
    : `/admin/login?from=${encodeURIComponent('/login')}`;

  if (user) {
    const dashboardPath = getTargetDashboard(user.role);
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-elevated text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Already Signed In</h2>
            <p className="text-xs text-slate-500">
              You are currently authenticated as <span className="font-bold text-slate-800">{user.name}</span> ({user.role}).
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => router.replace(dashboardPath)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-btn-primary flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Go to Your Dashboard</span>
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
              Sign Out from this account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient decorative light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-7 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-elevated transition-all duration-300">
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
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="text-left leading-none">
              <span className="text-2xl font-black tracking-tight text-slate-900 block">
                Smart<span className="text-blue-600">Rent</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CONNECT</span>
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
            Welcome back
          </h2>
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href={registerHref} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>

        {/* Demo Fast-Login Selector */}
        <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Demo Login</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">Test Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('tenant@smartrent.com')}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 font-semibold text-slate-700 text-left transition-all duration-150 shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-1 font-bold text-[11px]">
                <span>👤 Tenant</span>
              </div>
              <div className="text-[9px] text-slate-400 font-normal truncate">Renter</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('owner@smartrent.com')}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-700 font-semibold text-slate-700 text-left transition-all duration-150 shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-1 font-bold text-[11px]">
                <span>🏡 Owner</span>
              </div>
              <div className="text-[9px] text-slate-400 font-normal truncate">Host</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('agent@smartrent.com')}
              className="px-2.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-700 font-semibold text-slate-700 text-left transition-all duration-150 shadow-sm active:scale-95"
            >
              <div className="flex items-center gap-1 font-bold text-[11px]">
                <span>🏢 Agent</span>
              </div>
              <div className="text-[9px] text-slate-400 font-normal truncate">Broker</div>
            </button>
          </div>
          <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-200/80 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Administrator access requires entering ID &amp; Password manually.</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address or Admin ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com or Admin ID"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
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
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-btn-primary hover:shadow-btn-primary-hover disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Administrator Portal Entry Point */}
        <div className="pt-5 mt-2 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Administration</span>
            </span>
            <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Admin Only</span>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-purple-50/70 to-indigo-50/50 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="text-left space-y-0.5">
              <div className="text-xs font-bold text-slate-900">Are you an administrator?</div>
              <div className="text-[11px] text-slate-500">Access platform moderation &amp; user management</div>
            </div>
            <Link
              href={adminLoginHref}
              className="btn-depth inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all shrink-0 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading sign-in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
