'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  PlusCircle,
  Calendar,
  Send,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  XCircle,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'listings' | 'new_listing' | 'enquiries' | 'visits'>('listings');
  const [properties, setProperties] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Listing Form State
  const [newProp, setNewProp] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    rent: '',
    securityDeposit: '',
    bedrooms: '2',
    bathrooms: '2',
    area: '950',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    lng: '72.8777',
    lat: '19.0760',
    imageUrl: '',
    amenities: ['24/7 Security', 'Covered Parking', 'Elevator'],
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Enquiry reply state
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [propRes, enqRes, visRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/properties/my/listings`, { headers }),
        fetch(`${API_BASE_URL}/api/enquiries`, { headers }),
        fetch(`${API_BASE_URL}/api/visits`, { headers }),
      ]);

      const [propData, enqData, visData] = await Promise.all([
        propRes.json(),
        enqRes.json(),
        visRes.json(),
      ]);

      setProperties(propData.properties || []);
      setEnquiries(enqData.enquiries || []);
      setVisits(visData.visits || []);
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle New Listing Submission
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      const payload = {
        title: newProp.title,
        description: newProp.description,
        propertyType: newProp.propertyType,
        rent: Number(newProp.rent),
        securityDeposit: Number(newProp.securityDeposit || newProp.rent),
        bedrooms: Number(newProp.bedrooms),
        bathrooms: Number(newProp.bathrooms),
        area: Number(newProp.area),
        address: newProp.address,
        city: newProp.city,
        state: newProp.state,
        coordinates: [parseFloat(newProp.lng), parseFloat(newProp.lat)],
        amenities: newProp.amenities,
        images: newProp.imageUrl ? [newProp.imageUrl] : [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80'
        ],
      };

      const res = await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create listing');

      setCreateSuccess(true);
      setNewProp({
        title: '',
        description: '',
        propertyType: 'apartment',
        rent: '',
        securityDeposit: '',
        bedrooms: '2',
        bathrooms: '2',
        area: '950',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        lng: '72.8777',
        lat: '19.0760',
        imageUrl: '',
        amenities: ['24/7 Security', 'Covered Parking', 'Elevator'],
      });
      fetchData();
    } catch (err: any) {
      setCreateError(err.message || 'Error creating property');
    } finally {
      setCreateLoading(false);
    }
  };

  // Status toggle for listing (ACTIVE / RENTED / INACTIVE)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'ACTIVE' ? 'RENTED' : currentStatus === 'RENTED' ? 'INACTIVE' : 'ACTIVE';
    try {
      await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingStatus: nextStatus }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  // Delete listing
  const handleDeleteProperty = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  // Update enquiry status & reply
  const handleUpdateEnquiry = async (enquiryId: string, status: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/enquiries/${enquiryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          reply: replyText[enquiryId] || undefined,
        }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  // Update visit status
  const handleUpdateVisit = async (visitId: string, status: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/visits/${visitId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (newProp.amenities.includes(amenity)) {
      setNewProp({ ...newProp, amenities: newProp.amenities.filter((a) => a !== amenity) });
    } else {
      setNewProp({ ...newProp, amenities: [...newProp.amenities, amenity] });
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & KPI Summary */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-xl shadow-lg shadow-amber-500/25 ring-4 ring-amber-50">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.role === 'AGENT' ? 'Agent Listing Portal' : 'Property Owner Dashboard'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Host Console
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your real estate listings, prospective tenant inquiries, and scheduled tours
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/dashboard/owner/properties"
              className="btn-depth inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Manage Properties</span>
            </Link>
            <button
              onClick={() => setActiveTab('new_listing')}
              className="btn-depth inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Property</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveTab('listings')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
              activeTab === 'listings'
                ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-2 ring-amber-500/10'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Properties</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{properties.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Units in your portfolio</div>
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tenant Enquiries</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{enquiries.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting host answers</div>
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visit Requests</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">{visits.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tour reservations</div>
          </div>
        </div>
      </div>

      {/* Tabs - Segmented Control */}
      <div className="inline-flex p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl gap-1 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span>My Listings</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'listings' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
            {properties.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('new_listing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'new_listing'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>+ Add Property</span>
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-blue-600" />
          <span>Inquiries</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'enquiries' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
            {enquiries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'visits'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Tour Requests</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'visits' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
            {visits.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
          <span>Loading listings & requests...</span>
        </div>
      ) : activeTab === 'listings' ? (
        /* My Listings List */
        properties.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No properties listed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &apos;+ Add Property&apos; to publish your rental listing with high-resolution photos and MongoDB geospatial coordinates.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('new_listing')}
                className="btn-depth inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish First Listing</span>
              </button>
            </div>
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
                      title="Click to toggle status (ACTIVE / RENTED / INACTIVE)"
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

                <div className="p-5 space-y-3.5">
                  <div>
                    <Link href={`/properties/${p._id}`}>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
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
                      {p.bedrooms} BHK • {p.area} sqft
                    </span>
                    <div className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{p.viewsCount || 0} views</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/properties/${p._id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Live Listing</span>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/owner/properties/${p._id}/edit`}
                        className="p-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200/60"
                        title="Edit Listing Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(p._id)}
                        className="p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200/60"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'new_listing' ? (
        /* Create New Listing Form */
        <div className="bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-card max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Rental Listing</h2>
            <p className="text-xs text-slate-500 mt-1">
              Fill in all details to publish your property with MongoDB GeoJSON 2dsphere indexing for proximity search.
            </p>
          </div>

          {createSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Property created and published successfully! View it under &apos;My Listings&apos;.</span>
            </div>
          )}

          {createError && (
            <div className="p-4 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateProperty} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Property Title
              </label>
              <input
                type="text"
                required
                value={newProp.title}
                onChange={(e) => setNewProp({ ...newProp, title: e.target.value })}
                placeholder="e.g. Luxury 3BHK Apartment with Balcony"
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={newProp.description}
                onChange={(e) => setNewProp({ ...newProp, description: e.target.value })}
                placeholder="Highlight property features, sunlight, ventilation, and nearby landmarks..."
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Property Type
                </label>
                <select
                  value={newProp.propertyType}
                  onChange={(e) => setNewProp({ ...newProp, propertyType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 cursor-pointer transition-all"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newProp.rent}
                  onChange={(e) => setNewProp({ ...newProp, rent: e.target.value })}
                  placeholder="45000"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newProp.securityDeposit}
                  onChange={(e) => setNewProp({ ...newProp, securityDeposit: e.target.value })}
                  placeholder="100000"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  value={newProp.bedrooms}
                  onChange={(e) => setNewProp({ ...newProp, bedrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min={0}
                  value={newProp.bathrooms}
                  onChange={(e) => setNewProp({ ...newProp, bathrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Floor Area (sq ft)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newProp.area}
                  onChange={(e) => setNewProp({ ...newProp, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={newProp.address}
                  onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                  placeholder="e.g. 42 Hill Road, Bandra West"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={newProp.city}
                  onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                  Longitude (°E)
                </label>
                <input
                  type="text"
                  required
                  value={newProp.lng}
                  onChange={(e) => setNewProp({ ...newProp, lng: e.target.value })}
                  placeholder="72.8777"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1.5">
                  Latitude (°N)
                </label>
                <input
                  type="text"
                  required
                  value={newProp.lat}
                  onChange={(e) => setNewProp({ ...newProp, lat: e.target.value })}
                  placeholder="19.0760"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Property Photo URL (Optional)
              </label>
              <input
                type="url"
                value={newProp.imageUrl}
                onChange={(e) => setNewProp({ ...newProp, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Available Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  '24/7 Security',
                  'Covered Parking',
                  'Elevator',
                  'Gym',
                  'Swimming Pool',
                  'High Speed WiFi',
                  'Balcony',
                  'Pet Friendly',
                  'Power Backup',
                ].map((amenity) => {
                  const checked = newProp.amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl text-left border font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95 ${
                        checked
                          ? 'bg-amber-100/80 border-amber-400 text-amber-900 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {checked ? <Check className="w-3.5 h-3.5 text-amber-800 shrink-0" /> : <div className="w-3.5 h-3.5 shrink-0" />}
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="btn-depth w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/25 transition-all active:scale-[0.99] mt-2"
            >
              {createLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Property to Marketplace...</span>
                </div>
              ) : (
                'Publish Listing to Marketplace'
              )}
            </button>
          </form>
        </div>
      ) : activeTab === 'enquiries' ? (
        /* Enquiries Manager */
        enquiries.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No tenant enquiries yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When prospective tenants inquire about your listings, their messages will appear here with quick response actions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div
                key={enq._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{enq.tenant?.name || 'Tenant'}</span>
                      <span className="text-xs text-slate-400 font-medium">({enq.phone || enq.tenant?.email})</span>
                    </div>
                    <div className="text-xs text-amber-800 font-bold mt-0.5">
                      Regarding: {enq.property?.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => handleUpdateEnquiry(enq._id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateEnquiry(enq._id, 'CONTACTED')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80 transition-colors"
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => handleUpdateEnquiry(enq._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-2xl text-xs text-slate-700 border border-slate-100">
                  <span className="font-bold text-slate-600">Tenant Message:</span> {enq.message}
                </div>

                {/* Reply box */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type reply to tenant..."
                    value={replyText[enq._id] !== undefined ? replyText[enq._id] : (enq.reply || '')}
                    onChange={(e) => setReplyText({ ...replyText, [enq._id]: e.target.value })}
                    className="flex-grow px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all"
                  />
                  <button
                    onClick={() => handleUpdateEnquiry(enq._id, enq.status)}
                    className="btn-depth px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Visit Requests Manager */
        visits.length === 0 ? (
          <div className="py-20 bg-white/90 rounded-3xl border border-slate-200/80 text-center space-y-3 p-8 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No scheduled visit requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When tenants book in-person visits to tour your properties, their reservations will appear here for confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v) => (
              <div
                key={v._id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-3.5 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Tour for: {v.property?.title || 'Rental Listing'}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
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

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        v.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                          : v.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                          : 'bg-amber-50 text-amber-700 border-amber-200/80'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        v.status === 'CONFIRMED' ? 'bg-emerald-500' : v.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <span>{v.status}</span>
                    </span>

                    {v.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateVisit(v._id, 'CONFIRMED')}
                          className="btn-depth px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdateVisit(v._id, 'REJECTED')}
                          className="btn-depth px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-1">
                  <span>
                    <strong>Tenant:</strong> {v.tenant?.name} ({v.tenant?.phone || v.tenant?.email})
                  </span>
                  {v.message && <span className="italic text-slate-500">Note: &quot;{v.message}&quot;</span>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
