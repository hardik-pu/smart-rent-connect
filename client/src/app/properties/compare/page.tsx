'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { Scale, Trash2, ArrowLeft, Building2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function ComparePage() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('src_compare');
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        setCompareIds(ids);

        if (ids.length > 0) {
          Promise.all(ids.map((id) => fetch(`${API_BASE_URL}/api/properties/${id}`).then((r) => r.json())))
            .then((results) => {
              const valid = results.filter((r) => r.property).map((r) => r.property);
              setProperties(valid);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
          return;
        }
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const handleRemove = (id: string) => {
    const updated = compareIds.filter((i) => i !== id);
    setCompareIds(updated);
    setProperties(properties.filter((p) => p._id !== id));
    localStorage.setItem('src_compare', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setCompareIds([]);
    setProperties([]);
    localStorage.removeItem('src_compare');
  };

  // Collect all unique amenities across comparing properties
  const allAmenities = Array.from(
    new Set(properties.flatMap((p) => p.amenities || []))
  );

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Properties</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
            <Scale className="w-7 h-7 text-blue-600" />
            <span>Property Comparison Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare monthly rent, deposits, floor space, room configurations, and amenity availability side-by-side.
          </p>
        </div>

        {properties.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Comparison</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500">
          Loading comparison data...
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200 text-center space-y-4 p-8">
          <Scale className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No properties selected for comparison</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse rental listings and click the &apos;Compare&apos; balance scale icon on any property to compare up to 4 homes here.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow"
          >
            <span>Browse Rentals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-card overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80">
                <th className="p-5 w-48 min-w-[180px] bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Features &amp; Specs
                </th>
                {properties.map((p) => (
                  <th key={p._id} className="p-5 min-w-[260px] max-w-[300px] align-top">
                    <div className="space-y-3 group">
                      <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                        <img
                          src={
                            p.images && p.images[0]
                              ? p.images[0]
                              : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80'
                          }
                          alt={p.title}
                          className="w-full h-full object-cover img-zoom"
                        />
                        <button
                          onClick={() => handleRemove(p._id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 shadow-md hover:scale-105 active:scale-95 transition-all"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <Link href={`/properties/${p._id}`}>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {p.title}
                          </h4>
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5">{p.city}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              <tr className="bg-blue-50/20">
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Monthly Rent</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 font-black text-blue-600 text-sm">
                    ₹{p.rent.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-400">/ mo</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Security Deposit</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 font-bold text-slate-800">
                    ₹{p.securityDeposit.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Property Type</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 capitalize font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {p.propertyType}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Configuration</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 font-medium">
                    {p.bedrooms} BHK, {p.bathrooms} Baths
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Floor Space</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 font-semibold text-slate-800">
                    {p.area} sq ft
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Address / City</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5 text-slate-500">
                    {p.address}, {p.city}
                  </td>
                ))}
              </tr>

              {/* Dynamic Amenities Rows */}
              {allAmenities.map((amenity) => (
                <tr key={amenity}>
                  <td className="p-4 font-semibold bg-slate-50/70 text-slate-500">{amenity}</td>
                  {properties.map((p) => {
                    const hasAmenity = p.amenities?.includes(amenity);
                    return (
                      <td key={p._id} className="p-4">
                        {hasAmenity ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Included</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                            <XCircle className="w-4 h-4" />
                            <span>Not listed</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="p-4.5 font-bold bg-slate-50/70 text-slate-600">Action</td>
                {properties.map((p) => (
                  <td key={p._id} className="p-4.5">
                    <Link
                      href={`/properties/${p._id}`}
                      className="btn-depth inline-block w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-btn-primary hover:shadow-btn-primary-hover transition-all"
                    >
                      View &amp; Tour
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
