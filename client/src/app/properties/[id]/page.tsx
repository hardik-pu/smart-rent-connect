'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Heart,
  Scale,
  Send,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import PropertyMap from '@/components/PropertyMap';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<number>(0);

  // Enquiry Form State
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Visit Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitMessage, setVisitMessage] = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  // Favourite & Compare
  const [isFavourite, setIsFavourite] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Property not found');
        setProperty(data.property);

        // Check if comparing
        const comp = localStorage.getItem('src_compare');
        if (comp) {
          const list = JSON.parse(comp);
          setIsComparing(list.includes(id));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  // Check favourite status
  useEffect(() => {
    if (!token || !id) return;
    fetch(`${API_BASE_URL}/api/favourites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.favourites) {
          const found = data.favourites.some((f: any) => f.property?._id === id || f.property === id);
          setIsFavourite(found);
        }
      })
      .catch(() => {});
  }, [id, token]);

  const handleToggleFavourite = async () => {
    if (!token) {
      alert('Please log in to save properties to your favourites.');
      return;
    }

    try {
      if (isFavourite) {
        await fetch(`${API_BASE_URL}/api/favourites/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavourite(false);
      } else {
        await fetch(`${API_BASE_URL}/api/favourites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ propertyId: id }),
        });
        setIsFavourite(true);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleCompare = () => {
    const comp = localStorage.getItem('src_compare');
    let list: string[] = comp ? JSON.parse(comp) : [];
    if (isComparing) {
      list = list.filter((i) => i !== id);
      setIsComparing(false);
    } else {
      if (list.length >= 4) {
        alert('You can compare a maximum of 4 properties.');
        return;
      }
      list.push(id as string);
      setIsComparing(true);
    }
    localStorage.setItem('src_compare', JSON.stringify(list));
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to send enquiries to the owner or agent.');
      return;
    }

    setEnquiryLoading(true);
    setEnquiryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/enquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          message: enquiryMessage,
          phone: enquiryPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit enquiry');
      setEnquirySuccess(true);
      setEnquiryMessage('');
    } catch (err: any) {
      setEnquiryError(err.message || 'Error submitting enquiry');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in to schedule an in-person visit.');
      return;
    }

    setVisitLoading(true);
    setVisitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: id,
          requestedDate: visitDate,
          requestedTime: visitTime,
          message: visitMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to schedule visit');
      setVisitSuccess(true);
    } catch (err: any) {
      setVisitError(err.message || 'Error scheduling visit');
    } finally {
      setVisitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="py-20 max-w-xl mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
          <p className="text-sm text-slate-500">{error || 'This listing may have been rented or removed.'}</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80'];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back Button & Header Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavourite}
            className={`btn-depth inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-xs transition-all ${
              isFavourite
                ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-rose-500/10'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current text-rose-500' : ''}`} />
            <span>{isFavourite ? 'Saved in Favourites' : 'Save Property'}</span>
          </button>

          <button
            onClick={handleToggleCompare}
            className={`btn-depth inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-xs transition-all ${
              isComparing
                ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-blue-500/10'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Comparing' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Details (Left) + Actions/Forms (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Media */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo & Thumbnails */}
          <div className="card-depth bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-card p-4 space-y-3">
            <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 relative">
              <img
                src={images[selectedImg]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-900 border border-white/60 shadow-xs">
                {property.propertyType}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImg === idx ? 'border-blue-600 shadow-md ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Information Card */}
          <div className="card-depth bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200/60">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{property.propertyType}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{property.address}, {property.city}, {property.state}, {property.country}</span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-3xl font-black text-blue-600 tracking-tight">
                  ₹{property.rent.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-semibold text-slate-500">/ month</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block">
                  Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-400 mt-1 font-medium">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{property.viewsCount || 1} views</span>
                </div>
              </div>
            </div>

            {/* Quick Spec Metrics */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/60 text-center shadow-inner-light">
              <div className="space-y-0.5">
                <div className="text-xs text-slate-500 font-medium">Bedrooms</div>
                <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                  <Bed className="w-4 h-4 text-blue-600" />
                  <span>{property.bedrooms} BHK</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-slate-500 font-medium">Bathrooms</div>
                <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                  <Bath className="w-4 h-4 text-blue-600" />
                  <span>{property.bathrooms}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-slate-500 font-medium">Built-up Area</div>
                <div className="text-base font-black text-slate-900 flex items-center justify-center gap-1">
                  <Maximize className="w-4 h-4 text-blue-600" />
                  <span>{property.area} sq ft</span>
                </div>
              </div>
              <div className="space-y-0.5 col-span-3 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
                <div className="text-xs text-slate-500 font-medium">Status</div>
                <div className="text-sm font-black text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{property.listingStatus}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">About this property</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Featured Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Geospatial Interactive Location Map */}
            {property.location && property.location.coordinates && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Interactive Location Map</h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    2dsphere Indexed
                  </span>
                </div>

                <div className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-card">
                  <PropertyMap
                    properties={[property]}
                    singleProperty={true}
                    center={{
                      lat: property.location.coordinates[1],
                      lng: property.location.coordinates[0],
                    }}
                  />
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-semibold">
                      GPS: {Number(property.location.coordinates[1]).toFixed(5)}° N, {Number(property.location.coordinates[0]).toFixed(5)}° E
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {property.address}, {property.city}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Owner Card, Schedule Visit, Send Enquiry */}
        <div className="space-y-6">
          {/* Owner/Agent Profile Card */}
          {property.owner && (
            <div className="card-depth bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-base uppercase shadow-md shadow-blue-500/20 border border-blue-400/30">
                  {property.owner.name ? property.owner.name[0] : 'O'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{property.owner.name}</h4>
                  <div className="text-xs text-slate-500 font-medium">
                    Verified {property.owner.role || 'Host'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                {property.owner.phone && (
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property.owner.phone}</span>
                  </div>
                )}
                {property.owner.email && (
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property.owner.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule an In-Person Visit */}
          <div className="card-depth bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Schedule In-Person Visit</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Choose an available date and time slot to inspect this property directly with the host.
            </p>

            {visitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Visit Scheduled Successfully!</span>
                </div>
                <p>The host has received your request. Check your Tenant Dashboard for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleScheduleVisit} className="space-y-3">
                {visitError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{visitError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner-light"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all shadow-inner-light"
                  >
                    <option value="10:00 AM">10:00 AM (Morning)</option>
                    <option value="11:30 AM">11:30 AM (Morning)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:30 PM">04:30 PM (Evening)</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Note for Host (Optional)
                  </label>
                  <input
                    type="text"
                    value={visitMessage}
                    onChange={(e) => setVisitMessage(e.target.value)}
                    placeholder="e.g. Would like to check parking space"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={visitLoading}
                  className="btn-depth w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-btn-primary hover:shadow-btn-primary-hover transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{visitLoading ? 'Booking Tour...' : 'Request Tour'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Send Enquiry Form */}
          <div className="card-depth bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Send Direct Enquiry</h3>
            </div>

            {enquirySuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enquiry Sent!</span>
                </div>
                <p>The host has received your message and will reply in your tenant inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-3">
                {enquiryError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{enquiryError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner-light"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Ask about lease terms, pet policies, move-in dates..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="btn-depth w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-card transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enquiryLoading ? 'Submitting...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
