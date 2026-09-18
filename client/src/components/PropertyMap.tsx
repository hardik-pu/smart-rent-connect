'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Compass, ExternalLink, X, Building2 } from 'lucide-react';

export interface MapProperty {
  _id: string;
  title: string;
  rent: number;
  propertyType?: string;
  address?: string;
  city?: string;
  images?: string[];
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  distanceKm?: number;
}

interface PropertyMapProps {
  properties: MapProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedId?: string;
  onSelectProperty?: (id: string) => void;
  singleProperty?: boolean;
  className?: string;
}

export default function PropertyMap({
  properties,
  center = { lat: 19.0760, lng: 72.8777 }, // Default Mumbai
  zoom = 12,
  selectedId,
  onSelectProperty,
  singleProperty = false,
  className = '',
}: PropertyMapProps) {
  const [activePopup, setActivePopup] = useState<MapProperty | null>(
    singleProperty && properties.length > 0 ? properties[0] : null
  );

  // Sync active popup if selectedId changes from external list selection
  React.useEffect(() => {
    if (selectedId) {
      const match = properties.find((p) => p._id === selectedId);
      if (match) setActivePopup(match);
    }
  }, [selectedId, properties]);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    (p) =>
      p.location &&
      p.location.coordinates &&
      Array.isArray(p.location.coordinates) &&
      p.location.coordinates.length === 2 &&
      !isNaN(p.location.coordinates[0]) &&
      !isNaN(p.location.coordinates[1])
  );

  // If a property is selected in multi-view, center on that property
  const targetProperty = activePopup && activePopup.location?.coordinates
    ? activePopup
    : validProperties.length > 0 && singleProperty
    ? validProperties[0]
    : null;

  const mapCenter = targetProperty && targetProperty.location?.coordinates
    ? {
        lat: targetProperty.location.coordinates[1],
        lng: targetProperty.location.coordinates[0],
      }
    : center;

  // Compute bounding box for OpenStreetMap embed
  const delta = singleProperty ? 0.012 : 0.06;
  const bbox = `${mapCenter.lng - delta},${mapCenter.lat - delta},${mapCenter.lng + delta},${mapCenter.lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapCenter.lat},${mapCenter.lng}`;

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col ${className}`}>
      {/* Map Header Controls */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 shadow-md border border-slate-200/80 flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
        <span>
          {singleProperty
            ? 'Property GPS Location'
            : `${validProperties.length} Properties on Map`}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-600 hover:text-blue-700 shadow-sm border border-slate-200 flex items-center gap-1 transition-colors"
          title="Open location in Google Maps"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Google Maps</span>
        </a>
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200 hidden sm:flex items-center gap-1">
          <Navigation className="w-3 h-3 text-emerald-500" />
          <span>Live Map</span>
        </div>
      </div>

      {/* Embedded Live Interactive Map */}
      <div className="relative w-full flex-grow h-full min-h-[360px]">
        <iframe
          title="Interactive Property Map"
          width="100%"
          height="100%"
          className="w-full h-full border-0"
          src={osmEmbedUrl}
          loading="lazy"
        />

        {/* Quick Marker Chips Overlay */}
        {!singleProperty && validProperties.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2 overflow-x-auto pb-1 max-w-full">
            {validProperties.map((p) => {
              const isSelected = (selectedId || activePopup?._id) === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => {
                    setActivePopup(p);
                    if (onSelectProperty) onSelectProperty(p._id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 shadow-md transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 scale-105'
                      : 'bg-white/95 backdrop-blur-md text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>₹{p.rent?.toLocaleString('en-IN')}</span>
                  {p.distanceKm !== undefined && (
                    <span className="text-[10px] opacity-80">({p.distanceKm}km)</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Property Popup Card Overlay */}
      {activePopup && !singleProperty && (
        <div className="absolute top-12 left-3 right-3 sm:right-auto sm:w-80 z-20 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200/90 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2.5">
              {activePopup.images && activePopup.images[0] && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={activePopup.images[0]}
                    alt={activePopup.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {activePopup.propertyType || 'Rental'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  {activePopup.title}
                </h4>
                <div className="text-sm font-black text-blue-600">
                  ₹{activePopup.rent?.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] font-medium text-slate-500">/mo</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  {activePopup.address}, {activePopup.city}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActivePopup(null)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {activePopup.distanceKm !== undefined ? (
              <span className="text-[11px] font-bold text-emerald-600">
                {activePopup.distanceKm} km away
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">{activePopup.city}</span>
            )}
            <Link
              href={`/properties/${activePopup._id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View Listing</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
