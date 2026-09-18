import React from 'react';
import Link from 'next/link';
import { Home, Shield, MapPin, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z" fill="currentColor" fillOpacity="0.95"/>
                  <circle cx="12" cy="11" r="2" fill="#93c5fd" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none">
                  Smart<span className="text-blue-400">Rent</span>
                </span>
                <span className="text-[8px] font-extrabold text-blue-400/90 tracking-widest uppercase mt-0.5">
                  Connect
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-world location-based rental finder connecting tenants, owners, agents, and administrators with verified listings and seamless scheduling.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?radius=5" className="hover:text-white transition-colors">
                  Nearby Rentals (5km)
                </Link>
              </li>
              <li>
                <Link href="/properties?type=apartment" className="hover:text-white transition-colors">
                  Apartments & Flats
                </Link>
              </li>
              <li>
                <Link href="/properties?type=house" className="hover:text-white transition-colors">
                  Independent Houses
                </Link>
              </li>
            </ul>
          </div>

          {/* Roles & Portals */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login?role=TENANT" className="hover:text-white transition-colors">
                  Tenant Portal
                </Link>
              </li>
              <li>
                <Link href="/login?role=OWNER" className="hover:text-white transition-colors">
                  Owner Portal
                </Link>
              </li>
              <li>
                <Link href="/login?role=AGENT" className="hover:text-white transition-colors">
                  Agent Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Status */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Geospatial Radar Enabled</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Listing Network</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:mokariyahardik84@gmail.com" className="hover:text-white transition-colors">
                  mokariyahardik84@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+918140115245" className="hover:text-white transition-colors">
                  +91 8140115245
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smart Rent Connect. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for real-world rental search</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
