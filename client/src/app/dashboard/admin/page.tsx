'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Trash2,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'stats' | 'verification' | 'users'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, propRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/properties`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/users`, { headers }),
      ]);

      const [statsData, propData, userData] = await Promise.all([
        statsRes.json(),
        propRes.json(),
        userRes.json(),
      ]);

      setStats(statsData.stats || null);
      setProperties(propData.properties || []);
      setUsers(userData.users || []);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchData();
    }
  }, [token, user]);

  const handleVerify = async (propId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/properties/${propId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setActionMessage(`Property marked as ${status.toLowerCase()} successfully.`);
        setTimeout(() => setActionMessage(null), 3500);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteProperty = async (propId: string, title: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to permanently remove listing "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/properties/${propId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setActionMessage(`Property listing "${title}" permanently removed.`);
        setTimeout(() => setActionMessage(null), 3500);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleToggleUser = async (userId: string, currentStatus: string, email: string) => {
    if (!token) return;
    if (userId === user?.id || email === user?.email) {
      alert('You cannot suspend your own active administrator account.');
      return;
    }
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountStatus: nextStatus }),
      });
      if (res.ok) {
        setActionMessage(`User account status updated to ${nextStatus}.`);
        setTimeout(() => setActionMessage(null), 3500);
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  // Auth Guard: Hydrating Auth State
  if (authLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Auth Guard: Unauthenticated
  if (!token || !user) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Authentication Required</h2>
        <p className="text-sm text-slate-600">
          You must be signed in with an administrator account to access the platform moderation portal.
        </p>
        <Link
          href="/admin/login"
          className="inline-block px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/20 transition-all"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  // Auth Guard: Non-Admin Role
  if (user.role !== 'ADMIN') {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-600">
          Administrator privileges are required to view this page. Your account role is{' '}
          <span className="font-bold text-slate-900 uppercase">{user.role}</span>.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            Return to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-purple-500/25 ring-4 ring-purple-50">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Platform Administration
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervise property verifications, moderate user accounts, and review real-time platform metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Admin Access Active</span>
            </span>
          </div>
        </div>

        {/* Global KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-all">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</div>
            <div className="text-3xl font-black text-slate-900 mt-1.5">
              {stats?.totalUsers ?? users.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all 4 roles</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-all">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Properties</div>
            <div className="text-3xl font-black text-slate-900 mt-1.5">
              {stats?.totalProperties ?? properties.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">All registered units</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-all">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Listings</div>
            <div className="text-3xl font-black text-emerald-600 mt-1.5">
              {stats?.activeListings ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live on marketplace</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 transition-all">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inquiries</div>
            <div className="text-3xl font-black text-blue-600 mt-1.5">
              {stats?.totalEnquiries ?? 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tenant to host leads</div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/90 text-purple-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-purple-600 hover:text-purple-950 text-sm font-black ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs - Segmented Control */}
      <div className="inline-flex p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-600" />
          <span>Overview &amp; Stats</span>
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Moderation Queue</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'verification' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>
            {properties.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>User Accounts</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>
            {users.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
          <span>Loading administrative data...</span>
        </div>
      ) : activeTab === 'stats' ? (
        /* Stats Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">User Distribution by Role</h3>
            <div className="space-y-3">
              {['TENANT', 'OWNER', 'AGENT', 'ADMIN'].map((role) => {
                const count = users.filter((u) => u.role === role).length;
                const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{role}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">System Architecture Health</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Geospatial Index (2dsphere)</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Role-Based Access Control</span>
                <span className="font-bold text-emerald-600">Enforced (RBAC)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Database Connectivity</span>
                <span className="font-bold text-emerald-600">Operational</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                <span>Account Suspension Guard</span>
                <span className="font-bold text-emerald-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'verification' ? (
        /* Property Verification Queue */
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Property Listing Verification &amp; Moderation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Approve or reject properties before they become publicly discoverable in rental searches.</p>
            </div>
            <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold border border-purple-200/60 self-start sm:self-auto">
              Total: {properties.length} listings
            </span>
          </div>
          {properties.length === 0 ? (
            <div className="p-16 text-center text-sm text-slate-500 space-y-2">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold">No property listings registered on the platform yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {properties.map((p) => (
                <div key={p._id} className="p-5 sm:p-6 hover:bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/properties/${p._id}`}
                        className="text-sm font-extrabold text-slate-900 hover:text-purple-600 transition-colors"
                      >
                        {p.title}
                      </Link>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          p.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : p.verificationStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.verificationStatus === 'APPROVED' ? 'bg-emerald-500' : p.verificationStatus === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        <span>{p.verificationStatus}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                        {p.propertyType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Host: <span className="font-bold text-slate-700">{p.owner?.name || 'Owner'}</span> ({p.owner?.email || 'N/A'}) • {p.city} • <strong className="text-slate-900">₹{p.rent?.toLocaleString('en-IN')}/mo</strong>
                    </div>
                    {p.address && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {p.address}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/properties/${p._id}`}
                      target="_blank"
                      className="btn-depth inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>
                    {p.verificationStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleVerify(p._id, 'APPROVED')}
                        className="btn-depth inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {p.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleVerify(p._id, 'REJECTED')}
                        className="btn-depth inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProperty(p._id, p.title)}
                      className="btn-depth inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold transition-colors"
                      title="Permanently remove listing from platform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* User Accounts Management */
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">User Account Directory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Control platform access privileges, verify identities, and manage account statuses.</p>
            </div>
            <span className="text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold border border-purple-200/60 self-start sm:self-auto">
              Total: {users.length} accounts
            </span>
          </div>
          {users.length === 0 ? (
            <div className="p-16 text-center text-sm text-slate-500 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold">No registered user accounts found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u._id === user?.id || u.email === user?.email;
                return (
                  <div key={u._id} className="p-5 sm:p-6 hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm border border-slate-200 shrink-0">
                        {u.name ? u.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">{u.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'OWNER'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : u.role === 'AGENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {u.role}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                              u.accountStatus === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.accountStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span>{u.accountStatus}</span>
                          </span>
                          {isSelf && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {u.email} • {u.phone || 'No phone provided'}
                          {u.createdAt && (
                            <span className="ml-2 text-slate-400">
                              • Joined:{' '}
                              {new Date(u.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isSelf ? (
                        <span className="text-xs font-semibold text-slate-400 italic px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                          Primary Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleUser(u._id, u.accountStatus, u.email)}
                          className={`btn-depth inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-sm ${
                            u.accountStatus === 'ACTIVE'
                              ? 'text-rose-600 bg-rose-50/80 hover:bg-rose-100 border-rose-200/80'
                              : 'text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 border-emerald-200/80'
                          }`}
                        >
                          {u.accountStatus === 'ACTIVE' ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Reactivate</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
