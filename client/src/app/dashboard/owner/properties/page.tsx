'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchMyProperties = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/my/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error('Error fetching owner listings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'ACTIVE' ? 'RENTED' : currentStatus === 'RENTED' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingStatus: nextStatus }),
      });
      if (res.ok) {
        setActionNotice(`Listing status updated to ${nextStatus}`);
        fetchMyProperties();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!token || !confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionNotice('Listing successfully removed from marketplace.');
        fetchMyProperties();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/owner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Owner Overview</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-amber-600" />
            <span>Manage My Properties</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View, edit, toggle rental availability, or delete properties from your portfolio.
          </p>
        </div>

        <Link
          href="/dashboard/owner/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Properties List */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>Loading your property listings...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center space-y-4 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">You haven&apos;t listed any properties yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your rental apartment, house, villa, or studio to make it discoverable by prospective tenants.
          </p>
          <Link
            href="/dashboard/owner/properties/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow hover:bg-amber-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property Now</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={
                    p.images && p.images[0]
                      ? p.images[0]
                      : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={p.title}
                  className="w-full h-full object-cover img-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-slate-800 tracking-wider shadow-sm">
                  {p.propertyType}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleToggleStatus(p._id, p.listingStatus)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all ${
                      p.listingStatus === 'ACTIVE'
                        ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white'
                        : p.listingStatus === 'RENTED'
                        ? 'bg-blue-600/90 hover:bg-blue-700 text-white'
                        : 'bg-slate-700/90 hover:bg-slate-800 text-white'
                    }`}
                    title="Click to toggle listing status"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{p.listingStatus}</span>
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-lg font-black leading-none drop-shadow-sm">
                    ₹{p.rent?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-medium opacity-90">/ mo</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">
                      Dep: ₹{p.securityDeposit?.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{p.viewsCount || 0} views</span>
                    </div>
                  </div>

                  <Link href={`/properties/${p._id}`}>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                  </Link>

                  <div className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{p.address ? `${p.address}, ${p.city}` : p.city}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {p.bedrooms} BHK • {p.bathrooms} Baths • {p.area} sqft
                  </span>
                </div>

                {/* Controls Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/properties/${p._id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/owner/properties/${p._id}/edit`}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-200/60"
                      title="Edit property details"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProperty(p._id, p.title)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200/60"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
