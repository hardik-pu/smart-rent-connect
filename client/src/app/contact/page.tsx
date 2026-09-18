'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Get In Touch
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          We&apos;re here to help you connect
        </h1>
        <p className="text-sm text-slate-600">
          Have questions about listing a rental, scheduling visits, or integrating with Smart Rent Connect? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-8 shadow-card border border-slate-800 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <h3 className="text-xl font-bold mb-2">Hardik Mokariya</h3>
            <p className="text-sm text-slate-400">
              Smart Rent Connect Developer &amp; Platform Support.
            </p>
          </div>

          <div className="space-y-6 text-sm relative">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Parul+University,+Vadodara,+639079"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-400/40 transition-all">
                <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">Campus Address</div>
                <div className="text-slate-400 text-xs mt-0.5 group-hover:underline">Parul University, Vadodara, 639079</div>
              </div>
            </a>

            <a
              href="mailto:mokariyahardik84@gmail.com"
              className="flex items-start gap-3 group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-400/40 transition-all">
                <Mail className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">Support Email</div>
                <div className="text-slate-400 text-xs mt-0.5 group-hover:underline">mokariyahardik84@gmail.com</div>
              </div>
            </a>

            <a
              href="tel:+918140115245"
              className="flex items-start gap-3 group transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-400/40 transition-all">
                <Phone className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
              </div>
              <div>
                <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">Direct Line</div>
                <div className="text-slate-400 text-xs mt-0.5 group-hover:underline">+91 8140115245</div>
              </div>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card card-depth">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. Our support team will get back to you at {formData.email} shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors btn-depth active:scale-95"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Hardik Mokariya"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mokariyahardik84@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Question about Property Listing"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-btn-primary hover:shadow-btn-primary-hover active:scale-95 transition-all btn-depth"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
