'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Calendar,
  Send,
  Building2,
  Trash2,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
  RefreshCw,
  User,
  Scale,
} from 'lucide-react';

export default function TenantDashboard() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'favourites' | 'enquiries' | 'visits'>('favourites');
  const [favourites, setFavourites] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [favRes, enqRes, visRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/favourites`, { headers }),
        fetch(`${API_BASE_URL}/api/enquiries`, { headers }),
        fetch(`${API_BASE_URL}/api/visits`, { headers }),
      ]);

      const [favData, enqData, visData] = await Promise.all([
        favRes.json(),
        enqRes.json(),
        visRes.json(),
      ]);

      setFavourites(favData.favourites || []);
      setEnquiries(enqData.enquiries || []);
      setVisits(visData.visits || []);
    } catch (err) {
      console.error('Error loading tenant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRemoveFavourite = async (propertyId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/favourites/${propertyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavourites(favourites.filter((f) => (f.property?._id || f.property) !== propertyId));
    } catch {
      // ignore
    }
  };

  const handleCancelVisit = async (visitId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel this scheduled tour?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/visits/${visitId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setVisits(visits.map((v) => (v._id === visitId ? { ...v, status: 'CANCELLED' } : v)));
      }
    } catch (err) {
      console.error('Error cancelling visit:', err);
    }
  };

  const handleCloseEnquiry = async (enquiryId: string) => {
    if (!token) return;
    if (!confirm('Mark this enquiry as closed?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      if (res.ok) {
        setEnquiries(enquiries.map((e) => (e._id === enquiryId ? { ...e, status: 'CLOSED' } : e)));
      }
    } catch (err) {
      console.error('Error closing enquiry:', err);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome & KPI Cards */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
              {user?.name ? user.name[0].toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {user?.name || 'Tenant'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Tenant Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your saved listings, tour schedules, and landlord inquiries in one place
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/properties/compare"
              className="btn-depth inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare Homes</span>
            </Link>

            <Link
              href="/properties"
              className="btn-depth inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-btn-primary hover:shadow-btn-primary-hover transition-all"
            >
              <span>Explore Rentals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab('favourites')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
              activeTab === 'favourites'
                ? 'bg-rose-50/70 border-rose-300 shadow-sm ring-2 ring-rose-500/10'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved Homes</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100/80 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{favourites.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Properties bookmarked</div>
          </div>

          <div
            onClick={() => setActiveTab('enquiries')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
              activeTab === 'enquiries'
                ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-2 ring-blue-500/10'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Direct Inquiries</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{enquiries.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Questions sent to hosts</div>
          </div>

          <div
            onClick={() => setActiveTab('visits')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
              activeTab === 'visits'
                ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-2 ring-indigo-500/10'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Tours</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{visits.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">In-person visits booked</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Segmented Control */}
      <div className="inline-flex p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('favourites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'favourites'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span>Favourites</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'favourites' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'}`}>
            {favourites.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>Inquiries</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'enquiries' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
            {enquiries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'visits'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Visits</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'visits' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
            {visits.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Synchronizing your rental records...</span>
        </div>
      ) : activeTab === 'favourites' ? (
        favourites.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No saved favourites yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse rental listings and tap the heart icon on any home to save it for immediate comparison and tracking.
            </p>
            <div className="pt-2">
              <Link
                href="/properties"
                className="btn-depth inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-btn-primary"
              >
                <span>Browse Rentals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((fav) => {
              const p = fav.property;
              if (!p) return null;
              return (
                <div
                  key={fav._id}
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
                    <button
                      onClick={() => handleRemoveFavourite(p._id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-rose-600 shadow-md hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-3 left-3 text-white">
                      <div className="text-lg font-black leading-none drop-shadow-sm">
                        ₹{p.rent?.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-medium opacity-90">/ mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5">
                    <div>
                      <Link href={`/properties/${p._id}`}>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {p.title}
                        </h4>
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.address ? `${p.address}, ${p.city}` : p.city}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {p.bedrooms} BHK • {p.area} sq ft
                      </span>
                      <Link
                        href={`/properties/${p._id}`}
                        className="text-blue-600 font-bold hover:text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'enquiries' ? (
        enquiries.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No enquiries submitted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you send questions to property hosts, they will appear right here with real-time status tracking and answers.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div
                key={enq._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        href={`/properties/${enq.property?._id}`}
                        className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {enq.property?.title || 'Rental Listing'}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        Listing ID: {enq.property?._id?.slice(-6) || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border self-start sm:self-auto flex items-center gap-1.5 ${
                      enq.status === 'ACCEPTED' || enq.status === 'CONTACTED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : enq.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      enq.status === 'ACCEPTED' || enq.status === 'CONTACTED'
                        ? 'bg-emerald-500'
                        : enq.status === 'REJECTED'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`} />
                    <span>{enq.status}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-2xl text-xs text-slate-700 border border-slate-100">
                  <div className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Your Message:</div>
                  <p className="leading-relaxed">{enq.message}</p>
                </div>

                {enq.reply && (
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-xs text-blue-950">
                    <div className="font-bold text-blue-700 text-[10px] uppercase tracking-wider mb-1">Host Reply:</div>
                    <p className="leading-relaxed">{enq.reply}</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span>Sent: {new Date(enq.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-3">
                    <span>Host: <strong className="text-slate-700">{enq.ownerAgent?.name || 'Owner'}</strong></span>
                    {enq.status !== 'CLOSED' && (
                      <button
                        onClick={() => handleCloseEnquiry(enq._id)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Close Thread
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Visits Tab */
        visits.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No scheduled visits yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule an in-person tour directly from any listing page to inspect the property and meet the host.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v) => (
              <div
                key={v._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <Link
                      href={`/properties/${v.property?._id}`}
                      className="text-sm font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {v.property?.title || 'Rental Listing'}
                    </Link>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-bold text-slate-800">
                        {new Date(v.requestedDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at {v.requestedTime}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border self-start sm:self-auto flex items-center gap-1.5 ${
                      v.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        : v.status === 'REJECTED' || v.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      v.status === 'CONFIRMED'
                        ? 'bg-emerald-500'
                        : v.status === 'REJECTED' || v.status === 'CANCELLED'
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`} />
                    <span>{v.status}</span>
                  </span>
                </div>

                {v.message && (
                  <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-700">Tour Note:</span> {v.message}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span>Host: <strong className="text-slate-700">{v.ownerAgent?.name || 'Owner'}</strong></span>
                  <div className="flex items-center gap-3">
                    <span>Phone: <strong className="text-slate-700">{v.ownerAgent?.phone || 'Available after confirmation'}</strong></span>
                    {(v.status === 'PENDING' || v.status === 'CONFIRMED') && (
                      <button
                        onClick={() => handleCancelVisit(v._id)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/80 transition-colors"
                      >
                        Cancel Tour
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
