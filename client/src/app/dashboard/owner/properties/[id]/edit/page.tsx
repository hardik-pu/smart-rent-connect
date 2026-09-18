'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  Edit,
  RefreshCw,
} from 'lucide-react';

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
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
    country: 'India',
    lng: '72.8777',
    lat: '19.0760',
    imageUrl: '',
    amenities: [] as string[],
    listingStatus: 'ACTIVE',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableAmenities = [
    '24/7 Security',
    'Covered Parking',
    'Elevator',
    'Gym',
    'Swimming Pool',
    'High Speed WiFi',
    'Balcony',
    'Pet Friendly',
    'Power Backup',
    'Air Conditioning',
    'Water Purifier',
    'Modular Kitchen',
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      setInitialLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/properties/${id}`);
        const data = await res.json();
        if (!res.ok || !data.property) {
          throw new Error(data.message || 'Property not found');
        }

        const p = data.property;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          propertyType: p.propertyType || 'apartment',
          rent: p.rent?.toString() || '',
          securityDeposit: p.securityDeposit?.toString() || '',
          bedrooms: p.bedrooms?.toString() || '1',
          bathrooms: p.bathrooms?.toString() || '1',
          area: p.area?.toString() || '500',
          address: p.address || '',
          city: p.city || '',
          state: p.state || 'Maharashtra',
          country: p.country || 'India',
          lng: p.location?.coordinates ? p.location.coordinates[0]?.toString() : '72.8777',
          lat: p.location?.coordinates ? p.location.coordinates[1]?.toString() : '19.0760',
          imageUrl: p.images && p.images[0] ? p.images[0] : '',
          amenities: p.amenities || [],
          listingStatus: p.listingStatus || 'ACTIVE',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load property');
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        rent: Number(formData.rent),
        securityDeposit: Number(formData.securityDeposit || formData.rent),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        coordinates: [parseFloat(formData.lng) || 72.8777, parseFloat(formData.lat) || 19.0760],
        amenities: formData.amenities,
        images: formData.imageUrl ? [formData.imageUrl] : undefined,
        listingStatus: formData.listingStatus,
      };

      const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update property');

      router.push('/dashboard/owner/properties');
    } catch (err: any) {
      setError(err.message || 'Error updating property');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading listing for edit...</p>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-1">
        <Link
          href="/dashboard/owner/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Properties</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Edit className="w-7 h-7 text-amber-600" />
          <span>Edit Rental Property</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Modify rent pricing, specifications, description, and amenities for this listing.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-card card-depth">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status & Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Listing Status & Core Details
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Status:</span>
                <select
                  value={formData.listingStatus}
                  onChange={(e) => setFormData({ ...formData, listingStatus: e.target.value })}
                  className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="RENTED">RENTED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Property Type *
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600 cursor-pointer"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Monthly Rent (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.rent}
                  onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Specs */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              2. Dimensions & Rooms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Built-up Area (sq ft) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Address */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              3. Address & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Photo & Amenities */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              4. Media & Amenities
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Property Photograph URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {availableAmenities.map((amenity) => {
                  const checked = formData.amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl text-left border font-semibold flex items-center gap-2 transition-all ${
                        checked
                          ? 'bg-amber-100 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {checked ? <Check className="w-4 h-4 text-amber-700" /> : <div className="w-4 h-4" />}
                      <span>{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/owner/properties"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 btn-depth"
            >
              <Edit className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save & Update Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
