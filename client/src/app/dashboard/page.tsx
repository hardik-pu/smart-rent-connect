'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard, User, Building2, Briefcase, Shield, ArrowRight } from 'lucide-react';

export default function DashboardRouterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') router.replace('/dashboard/admin');
      else if (user.role === 'OWNER') router.replace('/dashboard/owner');
      else if (user.role === 'AGENT') router.replace('/dashboard/agent');
      else router.replace('/dashboard/tenant');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Select a Role Dashboard
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore the tailored portals designed for each user role in Smart Rent Connect.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/dashboard/tenant"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
              Tenant Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage saved homes, sent enquiries, and scheduled in-person visits.
            </p>
          </div>
          <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
            <span>Enter Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/owner"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600">
              Owner Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              List rentals, upload property details, reply to inquiries, and approve tours.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
            <span>Enter Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/agent"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600">
              Agent Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage managed rental portfolios, client enquiries, and visit coordination.
            </p>
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span>Enter Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/dashboard/admin"
          className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all group space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600">
              Admin Portal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Approve/reject property verifications, moderate users, and view platform KPIs.
            </p>
          </div>
          <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
            <span>Enter Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
