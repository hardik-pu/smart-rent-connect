'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  MapPin,
  Compass,
  Navigation,
  SlidersHorizontal,
  Heart,
  Scale,
  Bed,
  Bath,
  Maximize,
  ArrowUpDown,
  CheckCircle2,
  Building2,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  ArrowRight,
} from 'lucide-react';
import PropertyMap from '@/components/PropertyMap';

interface PropertyItem {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  rent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  address: string;
  city: string;
  location?: {
    coordinates: [number, number];
  };
  distanceKm?: number;
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [type, setType] = useState<string>(searchParams.get('type') || '');
  const [minRent, setMinRent] = useState<string>(searchParams.get('minRent') || '');
  const [maxRent, setMaxRent] = useState<string>(searchParams.get('maxRent') || '');
  const [bedrooms, setBedrooms] = useState<string>(searchParams.get('bedrooms') || '');
  const [sort, setSort] = useState<string>('newest');

  // Geolocation States
  const [useGeo, setUseGeo] = useState<boolean>(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<string>(searchParams.get('radius') || '10');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // View Mode & Map Selection (Grid, Split, Map)
  const [viewMode, setViewMode] = useState<'grid' | 'split' | 'map'>('grid');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // User Favourites & Compare sets
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Load Compare from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('src_compare');
    if (saved) {
      try {
        setCompareIds(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch user favourites if logged in
  const fetchFavourites = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ids = data.favourites.map((f: any) => f.property?._id || f.property);
        setFavouriteIds(ids);
      }
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  // Fetch properties from backend
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '';
      if (useGeo && geoCoords) {
        // Location-based search API
        const params = new URLSearchParams({
          lat: geoCoords.lat.toString(),
          lng: geoCoords.lng.toString(),
          radius: radius,
        });
        if (type) params.append('type', type);
        if (minRent) params.append('minRent', minRent);
        if (maxRent) params.append('maxRent', maxRent);
        url = `${API_BASE_URL}/api/properties/nearby?${params.toString()}`;
      } else {
        // General search API
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (city) params.append('city', city);
        if (type) params.append('type', type);
        if (minRent) params.append('minRent', minRent);
        if (maxRent) params.append('maxRent', maxRent);
        if (bedrooms) params.append('bedrooms', bedrooms);
        if (sort) params.append('sort', sort);
        url = `${API_BASE_URL}/api/properties?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load properties');
      }

      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to property search service');
    } finally {
      setLoading(false);
    }
  }, [useGeo, geoCoords, radius, search, city, type, minRent, maxRent, bedrooms, sort]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle Current Location Request
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUseGeo(true);
        setGeoLoading(false);
        setGeoNotice(`Located: ${position.coords.latitude.toFixed(3)}°, ${position.coords.longitude.toFixed(3)}°`);
        if (viewMode === 'grid') setViewMode('split');
      },
      (err) => {
        setGeoLoading(false);
        // Default to Mumbai center if user denies location permission
        setGeoCoords({ lat: 19.076, lng: 72.8777 });
        setUseGeo(true);
        setGeoNotice('Location access denied. Using Mumbai center for geospatial search demo.');
        if (viewMode === 'grid') setViewMode('split');
      },
      { timeout: 8000 }
    );
  };

  const handleToggleFavourite = async (propertyId: string) => {
    if (!token) {
      alert('Please log in to save properties to your favourites!');
      return;
    }

    const isFav = favouriteIds.includes(propertyId);
    try {
      if (isFav) {
        await fetch(`${API_BASE_URL}/api/favourites/${propertyId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavouriteIds(favouriteIds.filter((id) => id !== propertyId));
      } else {
        await fetch(`${API_BASE_URL}/api/favourites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ propertyId }),
        });
        setFavouriteIds([...favouriteIds, propertyId]);
      }
    } catch {
      // ignore
    }
  };

  const handleToggleCompare = (propertyId: string) => {
    let updated: string[];
    if (compareIds.includes(propertyId)) {
      updated = compareIds.filter((id) => id !== propertyId);
    } else {
      if (compareIds.length >= 4) {
        alert('You can compare up to 4 properties at a time.');
        return;
      }
      updated = [...compareIds, propertyId];
    }
    setCompareIds(updated);
    localStorage.setItem('src_compare', JSON.stringify(updated));
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Search & Location Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6 relative overflow-hidden">
        {/* Subtle Brand Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verified Rental Properties
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Filter by exact city, rent budget, or run a real-time MongoDB geospatial radius search.
            </p>
          </div>

          {/* Location & Radius Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGetLocation}
              disabled={geoLoading}
              className={`btn-depth inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                useGeo
                  ? 'bg-blue-50/90 border-blue-500 text-blue-700 shadow-xs ring-2 ring-blue-100'
                  : 'bg-slate-100/90 border-slate-200/80 text-slate-700 hover:bg-slate-200/80 shadow-xs'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{useGeo ? 'GPS Radius Active' : 'Use Current Location'}</span>
            </button>

            {useGeo && (
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="px-3 py-2.5 bg-blue-50/90 border border-blue-400/80 rounded-xl text-xs font-bold text-blue-800 cursor-pointer focus:outline-none shadow-xs"
              >
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
              </select>
            )}

            {useGeo && (
              <button
                onClick={() => {
                  setUseGeo(false);
                  setGeoNotice(null);
                }}
                className="px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-colors"
              >
                Reset GPS
              </button>
            )}
          </div>
        </div>

        {geoNotice && (
          <div className="p-3 bg-blue-50/80 border border-blue-200/90 rounded-2xl text-xs font-semibold text-blue-800 flex items-center gap-2.5 shadow-xs animate-fade-in">
            <Compass className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* Multi-Criteria Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner-light"
            />
          </div>

          {/* City */}
          <div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all shadow-inner-light"
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Pune">Pune</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all shadow-inner-light"
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">Independent House</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          {/* Max Rent */}
          <div>
            <select
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all shadow-inner-light"
            >
              <option value="">Any Budget</option>
              <option value="30000">Up to ₹30,000 / mo</option>
              <option value="50000">Up to ₹50,000 / mo</option>
              <option value="75000">Up to ₹75,000 / mo</option>
              <option value="100000">Up to ₹1,00,000 / mo</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer transition-all shadow-inner-light"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header with Count, View Mode Switcher, and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900">
            {loading ? 'Searching properties...' : `${properties.length} Properties Available`}
          </span>
          {compareIds.length > 0 && (
            <Link
              href="/properties/compare"
              className="btn-depth inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50/90 px-3 py-1.5 rounded-xl border border-blue-200 shadow-xs ml-2 transition-all hover:bg-blue-100"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparing ({compareIds.length})</span>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner-light">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-card border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              title="Split View (List + Interactive Map)"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-card border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Full Map View"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-150 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-card border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Area: Largest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Results View: Grid, Split, or Map */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Executing database search query...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-800">{error}</h3>
          <button
            onClick={fetchProperties}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center space-y-3 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No properties matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try expanding your search radius, selecting a different city, or resetting budget limits.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCity('');
              setType('');
              setMinRent('');
              setMaxRent('');
              setBedrooms('');
              setUseGeo(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[650px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <PropertyMap
            properties={properties}
            center={geoCoords || undefined}
            selectedId={selectedId}
            onSelectProperty={setSelectedId}
            className="h-full w-full"
          />
        </div>
      ) : viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {properties.map((item) => {
              const isFav = favouriteIds.includes(item._id);
              const isComp = compareIds.includes(item._id);
              const isSelected = selectedId === item._id;

              return (
                <div
                  key={item._id}
                  onMouseEnter={() => setSelectedId(item._id)}
                  className={`card-depth bg-white rounded-2xl border transition-all flex flex-col sm:flex-row group overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 shadow-card-hover ring-2 ring-blue-100'
                      : 'border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-blue-200'
                  }`}
                >
                  <div className="relative h-48 sm:h-auto sm:w-52 bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={
                        item.images && item.images.length > 0
                          ? item.images[0]
                          : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={item.title}
                      className="img-zoom w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider text-slate-800 border border-white/60 shadow-xs">
                      {item.propertyType}
                    </div>

                    {item.distanceKm !== undefined && (
                      <div className="absolute top-2.5 right-2.5 bg-blue-600/95 text-white backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs border border-blue-400/30">
                        <Compass className="w-3 h-3" />
                        <span>{item.distanceKm} km</span>
                      </div>
                    )}

                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavourite(item._id);
                        }}
                        title={isFav ? 'Remove favourite' : 'Save to favourites'}
                        className={`p-1.5 rounded-lg backdrop-blur-md shadow-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
                          isFav
                            ? 'bg-rose-500 text-white shadow-rose-500/20'
                            : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompare(item._id);
                        }}
                        title={isComp ? 'Remove from compare' : 'Add to compare'}
                        className={`p-1.5 rounded-lg backdrop-blur-md shadow-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
                          isComp
                            ? 'bg-blue-600 text-white shadow-blue-600/20'
                            : 'bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          ₹{item.rent.toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-semibold text-slate-400">/ mo</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                          Dep: ₹{item.securityDeposit.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Link href={`/properties/${item._id}`}>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 line-clamp-1 font-medium">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{item.address}, {item.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <Bed className="w-3 h-3 text-blue-500" /> {item.bedrooms} BHK
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <Bath className="w-3 h-3 text-blue-500" /> {item.bathrooms} Bath
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <Maximize className="w-3 h-3 text-blue-500" /> {item.area} sqft
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/properties/${item._id}`}
                        className="btn-depth flex-1 py-2 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-btn-primary hover:shadow-btn-primary-hover transition-all flex items-center justify-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => setSelectedId(item._id)}
                        title="Highlight on Map"
                        className={`btn-depth px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-blue-50/80 hover:bg-blue-100 text-blue-600 border-blue-200/80'
                        }`}
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-6 sticky top-24 h-[550px] lg:h-[750px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-card">
            <PropertyMap
              properties={properties}
              center={geoCoords || undefined}
              selectedId={selectedId}
              onSelectProperty={setSelectedId}
              className="h-full w-full"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((item) => {
            const isFav = favouriteIds.includes(item._id);
            const isComp = compareIds.includes(item._id);

            return (
              <div
                key={item._id}
                onMouseEnter={() => setSelectedId(item._id)}
                className="card-depth bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-card-hover hover:border-blue-200/80 transition-all flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={item.title}
                    className="img-zoom w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-800 shadow-xs border border-white/60">
                    {item.propertyType}
                  </div>

                  {item.distanceKm !== undefined && (
                    <div className="absolute top-3 right-3 bg-blue-600/95 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1 border border-blue-400/40">
                      <Compass className="w-3 h-3" />
                      <span>{item.distanceKm} km away</span>
                    </div>
                  )}

                  {/* Actions Bar (Top right / under distance) */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavourite(item._id);
                      }}
                      title={isFav ? 'Remove favourite' : 'Save to favourites'}
                      className={`p-2 rounded-xl backdrop-blur-md shadow-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
                        isFav
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(item._id);
                      }}
                      title={isComp ? 'Remove from compare' : 'Add to compare'}
                      className={`p-2 rounded-xl backdrop-blur-md shadow-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
                        isComp
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        ₹{item.rent.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-semibold text-slate-400">/ mo</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                        Dep: ₹{item.securityDeposit.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <Link href={`/properties/${item._id}`}>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{item.address}, {item.city}</span>
                    </div>
                  </div>

                  {/* Specs Chips */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                    <div className="flex items-center justify-center gap-1.5 bg-slate-50/90 border border-slate-100/90 p-2 rounded-xl">
                      <Bed className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-700">{item.bedrooms} BHK</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 bg-slate-50/90 border border-slate-100/90 p-2 rounded-xl">
                      <Bath className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-700">{item.bathrooms} Bath</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 bg-slate-50/90 border border-slate-100/90 p-2 rounded-xl">
                      <Maximize className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-700">{item.area} sqft</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/properties/${item._id}`}
                      className="btn-depth flex-1 py-2.5 text-center text-xs font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-btn-primary hover:shadow-btn-primary-hover transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      <span>View Full Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                    {item.location?.coordinates && (
                      <button
                        onClick={() => {
                          setSelectedId(item._id);
                          setViewMode('split');
                        }}
                        title="Locate on Map"
                        className="btn-depth px-3 py-2.5 rounded-xl border border-blue-200/80 bg-blue-50/80 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-all shadow-xs"
                      >
                        <MapIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-semibold text-slate-500">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
