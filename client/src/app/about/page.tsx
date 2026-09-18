import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Compass, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          About Smart Rent Connect
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Next-Generation Location-Based Rental Platform
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Smart Rent Connect eliminates the friction of traditional house hunting with high-precision MongoDB geospatial radius search, verified property listings, transparent comparison matrices, and direct visit scheduling.
        </p>
      </div>

      {/* Grid of Key Innovations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 space-y-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Geospatial Intelligence</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Unlike platforms that rely on simple text matches, Smart Rent Connect calculates exact geodesic distances using MongoDB 2dsphere indexing and the browser Geolocation API across 1km, 5km, 10km, and 25km radii.
          </p>
        </div>

        <div className="group bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 space-y-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Verified Marketplace</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every property undergoes strict administrative verification. Owners and licensed agents upload authenticated photographs and accurate coordinate markers before properties are publicly listed.
          </p>
        </div>

        <div className="group bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 space-y-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Integrated Role Workflows</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dedicated portals provide customized dashboards for Tenants, Property Owners, Real Estate Agents, and Platform Administrators, preventing unauthorized access with strict RBAC security.
          </p>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-8 border border-slate-800 shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-2 relative">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Engineered with Production Standards
          </h2>
          <p className="text-sm text-slate-400">
            Smart Rent Connect is built with modern full-stack web technologies and enterprise patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm relative">
          <div className="space-y-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="font-extrabold text-blue-400">Frontend Stack</div>
            <p className="text-slate-300 text-xs">Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="font-extrabold text-blue-400">Backend Server</div>
            <p className="text-slate-300 text-xs">Node.js, Express.js, TypeScript, RESTful JSON Architecture</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="font-extrabold text-blue-400">Database Layer</div>
            <p className="text-slate-300 text-xs">MongoDB Atlas Compatible, Mongoose ODM, 2dsphere GeoJSON</p>
          </div>
          <div className="space-y-2 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
            <div className="font-extrabold text-blue-400">Security &amp; Auth</div>
            <p className="text-slate-300 text-xs">JWT, Bcrypt Password Hashing, HTTP-only Cookies, RBAC</p>
          </div>
        </div>

        <div className="pt-2 flex gap-4 relative">
          <Link
            href="/properties"
            className="btn-depth inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition-all shadow-btn-primary hover:shadow-btn-primary-hover"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
