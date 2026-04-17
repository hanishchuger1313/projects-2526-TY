'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Smartphone, ChevronRight, Shield, Wrench, Store, Users, ArrowRight, CheckCircle, Zap, BarChart3, Globe, Star, TrendingUp, Clock, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const FEATURES = [
  { icon: Store, title: 'Shop Management', description: 'Manage inventory, process sales and track every device from purchase to delivery.', color: 'from-blue-500 to-indigo-600', glow: 'group-hover:shadow-blue-500/25' },
  { icon: Wrench, title: 'Service Center', description: 'Track repairs, assign technicians and handle warranty claims seamlessly.', color: 'from-cyan-500 to-teal-600', glow: 'group-hover:shadow-cyan-500/25' },
  { icon: Shield, title: 'Warranty Tracking', description: 'Full warranty lifecycle — from activation to expiry, all in one place.', color: 'from-emerald-500 to-green-600', glow: 'group-hover:shadow-emerald-500/25' },
  { icon: Users, title: 'Customer Portal', description: 'Customers view devices, repair history, warranties and invoices anytime.', color: 'from-purple-500 to-violet-600', glow: 'group-hover:shadow-purple-500/25' },
];

const STATS = [
  { value: '10K+', label: 'Devices Tracked', icon: Smartphone },
  { value: '500+', label: 'Active Shops', icon: Store },
  { value: '98%', label: 'Uptime', icon: TrendingUp },
  { value: '24/7', label: 'Support', icon: Clock },
];

const DEVICE_SHOWCASE = [
  {
    name: 'Premium Smartphones',
    description: 'Track flagship inventory, sales, and warranty records in one flow.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Repair Intake Devices',
    description: 'IMEI-based service lookup for quick diagnostics and job creation.',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Multi-Brand Stock',
    description: 'Manage Android and iOS device catalogs across multiple shop branches.',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80'
  }
];

const ROLES = [
  { emoji: '🛡️', title: 'Admin', desc: 'Monitor system, approve shops, detect fraud and manage users.', color: 'border-red-500/30 bg-red-500/5 hover:border-red-500/50' },
  { emoji: '🏪', title: 'Shop Owner', desc: 'Manage inventory, process sales and track warranty status.', color: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50' },
  { emoji: '🔧', title: 'Service Center', desc: 'Handle repairs, manage technicians and process warranty claims.', color: 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50' },
  { emoji: '👥', title: 'Customer', desc: 'View your devices, warranties, repair history and invoices.', color: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50' },
];

const TESTIMONIALS = [
  { name: 'Arjun Mehta', role: 'Shop Owner', avatar: 'A', color: 'from-blue-500 to-cyan-500', text: 'MobiTrack cut our invoice time from 10 minutes to under 30 seconds. The IMEI tracking alone saved us from two fraudulent device entries this month.' },
  { name: 'Priya Sharma', role: 'Service Center Manager', avatar: 'P', color: 'from-cyan-500 to-teal-500', text: 'Repair tracking is seamless. My technicians update status in seconds and customers stop calling to ask for updates — they can check online themselves.' },
  { name: 'Rahul Verma', role: 'Customer', avatar: 'R', color: 'from-purple-500 to-violet-500', text: 'I love being able to see my warranty status and repair history in one place. Got notified before my warranty expired — never had that with any other shop.' },
];

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#040812] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#040812]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">MobiTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Sign In</button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            <span>Complete Mobile Lifecycle Management</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            <span className="text-white">Manage Every</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Mobile Device
            </span>
            <br />
            <span className="text-white">From Sale to Repair</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            One platform for shops, service centers, and customers. Track inventory, warranties, repairs and ownership transfers — all in real time.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all">
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold rounded-xl transition-all">
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            {['No credit card required', 'Free to get started', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating cards */}
        <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, type: 'spring' }}
          className="absolute right-8 top-1/3 hidden xl:block">
          <div className="glass rounded-2xl p-4 border border-white/10 w-52 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400">Live warranty alert</span>
            </div>
            <p className="text-white text-sm font-semibold">iPhone 15 Pro Max</p>
            <p className="text-amber-400 text-xs mt-1">⚠ Expires in 12 days</p>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-amber-400 h-1.5 rounded-full w-[8%]" />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -80 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8, type: 'spring' }}
          className="absolute left-8 bottom-1/3 hidden xl:block">
          <div className="glass rounded-2xl p-4 border border-white/10 w-52 shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-gray-400">Sale completed</span>
            </div>
            <p className="text-white text-sm font-semibold">Samsung S24 Ultra</p>
            <p className="text-green-400 text-xs font-bold mt-1">+ Rs. 1,299</p>
            <p className="text-gray-500 text-xs mt-0.5">Warranty activated ✓</p>
          </div>
        </motion.div>
      </section>

      {/* ── Device Showcase ── */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">Mobile-first platform</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for real devices in real shops</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">From showroom inventory to repair desk verification, MobiTrack is designed around day-to-day mobile workflows.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEVICE_SHOWCASE.map((device, i) => (
              <motion.article key={device.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={device.image}
                    alt={device.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-[#040812]/30 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{device.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{device.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center group">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3 group-hover:bg-blue-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Everything you need</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Built for every role</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From shop owners to service centers to customers — one unified platform handles it all.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className={`group relative rounded-2xl p-6 border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 hover:shadow-2xl ${f.glow}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">Simple workflow</p>
            <h2 className="text-4xl font-bold text-white">Up and running in minutes</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up as a shop, service center or customer. Admin approval for businesses.', icon: Users },
              { step: '02', title: 'Add your inventory', desc: 'Register devices with IMEI, set pricing and warranty periods instantly.', icon: Smartphone },
              { step: '03', title: 'Sell, repair & track', desc: 'Process sales, create repairs and track everything through one dashboard.', icon: BarChart3 },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                  className="relative text-center">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 mb-4 relative">
                    <Icon className="w-7 h-7 text-blue-400" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-xs text-white font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Who is it for?</h2>
            <p className="text-gray-400">A role-based system built for every stakeholder in the mobile device lifecycle.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`rounded-2xl p-6 border ${r.color} hover:scale-[1.03] transition-all duration-200`}>
                <div className="text-3xl mb-3">{r.emoji}</div>
                <h3 className="text-white font-bold mb-2">{r.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">What people say</p>
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by the ecosystem</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From shop owners to customers — here's what the MobiTrack community says.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                className="rounded-2xl p-6 border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security badge strip ── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              { icon: Lock, text: 'bcrypt Password Hashing' },
              { icon: Shield, text: 'Role-Based Access Control' },
              { icon: Globe, text: 'HTTPS Encrypted Traffic' },
              { icon: CheckCircle, text: 'Admin-Approved Shops' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-green-500" /> {text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 text-center border border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-purple-600/20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to modernise your shop?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join hundreds of shops already using MobiTrack to manage devices, warranties and customers.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 bg-white/5 border border-white/20 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">MobiTrack</span>
          </div>
          <p className="text-gray-600 text-sm text-center">© 2026 MobiTrack · Complete Mobile Lifecycle Management</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/login" className="hover:text-gray-400 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-gray-400 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
