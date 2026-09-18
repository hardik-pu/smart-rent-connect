import React from 'react';
import Link from 'next/link';
import HealthChecker from '@/components/HealthChecker';
import {
  Search,
  MapPin,
  Navigation,
  ShieldCheck,
  Calendar,
  Building2,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Location-Powered Rental Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Find your ideal home{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                exactly where you need it
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified property owners and certified agents. Search by exact geolocation radius, compare amenities side-by-side, and schedule direct visits in real time.
            </p>

            {/* Quick Interactive Search Box */}
            <div className="mt-8 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-elevated border border-slate-200/90 text-left max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400" />
              <form action="/properties" method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1.5 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5 transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Location / City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai, Bangalore..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5 transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Property Type
                    </label>
                    <select
                      name="type"
                      defaultValue=""
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="studio">Studio</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-2.5 transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <Navigation className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                  <div className="w-full">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Search Radius
                    </label>
                    <select
                      name="radius"
                      defaultValue="10"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="1">Within 1 km</option>
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    type="submit"
                    className="btn-depth w-full h-full min-h-[48px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Gateway Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HealthChecker />
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Built for Real-World Rentals
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
            Engineered with strict geospatial indexing, multi-role security, and verified property workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="card-depth bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/50 flex items-center justify-center mb-6 shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Geospatial 2dsphere Engine
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Real MongoDB GeoJSON queries compute accurate Euclidean and spherical distances from your location within 1km, 5km, 10km, or 25km.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="card-depth bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50 flex items-center justify-center mb-6 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Four-Tier Role Authorization
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Dedicated interfaces and strict backend policies for Tenants, Property Owners, Licensed Agents, and Platform Administrators.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="card-depth bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/50 flex items-center justify-center mb-6 shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Integrated Visit Scheduling
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Direct calendar requests prevent past-date scheduling, enabling tenants and owners to confirm in-person tours with real-time updates.
            </p>
          </div>
        </div>
      </section>

      {/* Role Portals Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white overflow-hidden relative shadow-elevated border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>Dedicated Portals</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to experience Smart Rent Connect?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Switch seamlessly between Tenant search, Owner listing management, Agent operations, or Admin verification.
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="btn-depth inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-btn-primary hover:shadow-btn-primary-hover transition-all"
              >
                <span>Browse Rentals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-depth inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-bold text-sm border border-slate-700 shadow-xs transition-all"
              >
                <span>Account Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
