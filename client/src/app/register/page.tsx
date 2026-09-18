'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Building2, UserCircle2, Briefcase, ArrowLeft, UserCheck } from 'lucide-react';

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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, register, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'TENANT' | 'OWNER' | 'AGENT'>('TENANT');
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
    setError(null);
    setLoading(true);

    const res = await register({
      name,
      email,
      password,
      phone,
      role,
    });
    setLoading(false);

    if (res.success && res.user) {
      const redirect = searchParams.get('redirect');
      const target = getTargetDashboard(res.user.role || role, redirect);
      router.replace(target);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const fromParam = searchParams.get('from');
  const loginHref = fromParam
    ? `/login?from=${encodeURIComponent(fromParam)}`
    : '/login';

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

      <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-elevated transition-all duration-300">
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
            Create an account
          </h2>
          <p className="text-sm text-slate-500">
            Already registered?{' '}
            <Link href={loginHref} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
              Sign in here
            </Link>
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('TENANT')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all duration-200 ${
                  role === 'TENANT'
                    ? 'bg-blue-50/90 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${role === 'TENANT' ? 'bg-blue-600 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  <UserCircle2 className="w-4 h-4" />
                </div>
                <span className="tracking-tight">Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('OWNER')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all duration-200 ${
                  role === 'OWNER'
                    ? 'bg-amber-50/90 border-amber-500 text-amber-800 shadow-sm ring-2 ring-amber-500/20'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${role === 'OWNER' ? 'bg-amber-600 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="tracking-tight">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('AGENT')}
                className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition-all duration-200 ${
                  role === 'AGENT'
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${role === 'AGENT' ? 'bg-emerald-600 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="tracking-tight">Agent</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hardik Mokariya"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
