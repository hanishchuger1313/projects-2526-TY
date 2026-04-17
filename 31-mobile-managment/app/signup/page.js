'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Mail, Lock, User, Phone, Store, MapPin, FileText, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const ROLES = [
  { value: 'customer', label: 'Customer', emoji: '👥', desc: 'Buy devices & track warranties', color: 'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20', active: 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/30' },
  { value: 'shop', label: 'Shop Owner', emoji: '🏪', desc: 'Sell devices & manage inventory', color: 'border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20', active: 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/30' },
  { value: 'service', label: 'Service Center', emoji: '🔧', desc: 'Handle repairs & warranty claims', color: 'border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20', active: 'border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500/30' },
  { value: 'technician', label: 'Technician', emoji: '⚙️', desc: 'Work on repairs & service jobs', color: 'border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20', active: 'border-orange-500 bg-orange-500/20 ring-2 ring-orange-500/30' },
];

const STEPS = ['Role', 'Details', 'Password'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < current ? 'bg-green-500 text-white' :
            i === current ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' :
            'bg-white/10 text-gray-500'
          }`}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs ${i === current ? 'text-white font-medium' : 'text-gray-500'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`h-px w-6 ml-1 ${i < current ? 'bg-green-500' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, icon: Icon, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input {...props}
          className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm ${
            error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'
          }`} />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'customer', shopName: '', centerName: '',
    address: '', licenseNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!formData.name.trim()) e.name = 'Name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
      if (!formData.phone.trim()) e.phone = 'Phone is required';
      if (formData.role === 'shop' && !formData.shopName.trim()) e.shopName = 'Shop name is required';
      if (formData.role === 'service') {
        if (!formData.centerName.trim()) e.centerName = 'Center name is required';
        if (!formData.licenseNumber.trim()) e.licenseNumber = 'License number is required';
      }
    }
    if (step === 2) {
      if (!formData.password) e.password = 'Password is required';
      else if (formData.password.length < 6) e.password = 'Minimum 6 characters';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => { setStep(s => s - 1); setErrors({}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return; }
      router.push('/login?signup=success');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.value === formData.role);

  return (
    <div className="min-h-screen bg-[#040812] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg py-8">

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">MobiTrack</span>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-1">Create your account</h1>
            <p className="text-gray-400 text-sm">Join MobiTrack and take control of your devices</p>
          </div>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">

            {/* ── Step 0: Role ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-gray-400 mb-4">What best describes you?</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {ROLES.map(role => (
                    <button key={role.value} type="button" onClick={() => set('role', role.value)}
                      className={`rounded-xl p-4 border text-left transition-all ${formData.role === role.value ? role.active : role.color}`}>
                      <div className="text-2xl mb-2">{role.emoji}</div>
                      <p className="text-white font-semibold text-sm">{role.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{role.desc}</p>
                    </button>
                  ))}
                </div>
                {(formData.role === 'shop' || formData.role === 'service') && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 mb-4 text-sm text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    Business accounts require admin approval before access is granted.
                  </motion.div>
                )}
                <button onClick={nextStep}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all">
                  Continue as {selectedRole?.label} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 1: Details ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Full Name *" icon={User} type="text" required placeholder="John Doe"
                    value={formData.name} onChange={e => set('name', e.target.value)} error={errors.name} />
                  <InputField label="Phone *" icon={Phone} type="tel" required placeholder="+1-555-0000"
                    value={formData.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
                </div>
                <InputField label="Email Address *" icon={Mail} type="email" required placeholder="you@example.com"
                  value={formData.email} onChange={e => set('email', e.target.value)} error={errors.email} />

                {formData.role === 'shop' && (
                  <InputField label="Shop Name *" icon={Store} type="text" required placeholder="Mobile Hub Store"
                    value={formData.shopName} onChange={e => set('shopName', e.target.value)} error={errors.shopName} />
                )}
                {formData.role === 'service' && (
                  <>
                    <InputField label="Service Center Name *" icon={Store} type="text" required placeholder="QuickFix Center"
                      value={formData.centerName} onChange={e => set('centerName', e.target.value)} error={errors.centerName} />
                    <InputField label="License Number *" icon={FileText} type="text" required placeholder="LIC-123456"
                      value={formData.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} error={errors.licenseNumber} />
                  </>
                )}
                {(formData.role === 'shop' || formData.role === 'service') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <textarea value={formData.address} onChange={e => set('address', e.target.value)}
                        rows={2} placeholder="123 Main Street, City"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm resize-none" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep}
                    className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all">
                    Back
                  </button>
                  <button type="button" onClick={nextStep}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all text-sm">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Password ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm ${errors.password ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-blue-500/50'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  {/* Strength bar */}
                  {formData.password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          formData.password.length >= i * 3
                            ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-white/10'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat your password"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-blue-500/50'}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                  )}
                </div>

                {/* Summary card */}
                <div className="glass rounded-xl p-4 border border-white/10 text-sm space-y-1.5">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Account summary</p>
                  <div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-white font-medium">{selectedRole?.emoji} {selectedRole?.label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-white">{formData.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{formData.email}</span></div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep}
                    className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all">
                    Back
                  </button>
                  <motion.button type="button" onClick={handleSubmit} disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all text-sm">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign in</Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Back to home
            </Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}
