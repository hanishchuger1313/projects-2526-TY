'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { Search, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { isValidImei, toImeiInputValue } from '@/lib/imei';
import useAuthStore from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewRepairPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [imei, setImei] = useState('');
  const [device, setDevice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    problemDescription: '',
    technicianId: '',
    warrantyClaimRequest: false,
    estimatedCost: 0,
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const servicecenterId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'service') {
      router.push('/login');
      return;
    }
    fetchTechnicians();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const imeiFromUrl = searchParams.get('imei');
    if (imeiFromUrl) {
      setImei(toImeiInputValue(imeiFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isValidImei(imei)) {
      searchDevice();
    }
  }, [imei]);

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/api/servicecenter/technicians');
      if (response.ok) {
        const data = await response.json();
        setTechnicians(data.technicians || []);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const searchDevice = async () => {
    if (!isValidImei(imei)) {
      setError('Please enter a valid IMEI (15 digits)');
      return;
    }

    try {
      setSearching(true);
      setError('');
      setDevice(null);
      setCustomer(null);
      setWarranty(null);

      const response = await fetch(`/api/servicecenter/search?imei=${imei}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Device not found');
      }

      setDevice(data.device);
      setCustomer(data.customer || null);
      setWarranty(data.warranty || null);
    } catch (error) {
      setError(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!device) {
      setError('Please search and select a device first');
      return;
    }

    if (!formData.problemDescription) {
      setError('Please describe the problem');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/servicecenter/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: device._id,
          imei: device.imei,
          customerId: device.customerId,
          servicecenterId,
          technicianId: formData.technicianId || null,
          problemDescription: formData.problemDescription,
          warrantyClaimRequest: formData.warrantyClaimRequest,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
          customerComplaints: formData.notes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create repair');
      }

      setSuccess('Repair created successfully!');
      setTimeout(() => {
        router.push(`/service/repairs/${data.repair.id}`);
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="service" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="New Repair" breadcrumbs={['Service', 'Repairs', 'New']} />
        
        <div className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Search Device */}
            <div className="glass rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Search Device by IMEI</h3>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter 15-digit IMEI"
                    value={imei}
                    onChange={(e) => setImei(toImeiInputValue(e.target.value))}
                    inputMode="numeric"
                    pattern="[0-9]{15}"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={searchDevice}
                  disabled={searching || !isValidImei(imei)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search
                    </>
                  )}
                </button>
              </div>

              {/* Device Details */}
              {device && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-green-400 font-semibold">Device Found</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-white">
                          <span className="text-gray-400">Brand:</span> {device.brand} {device.model}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-400">IMEI:</span> {device.imei}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-400">Customer:</span>{' '}
                          {customer?.name || 'N/A'}
                        </p>
                        <p className="text-white">
                          <span className="text-gray-400">Warranty:</span>{' '}
                          {warranty?.valid ? (
                            <span className="text-green-400">Active</span>
                          ) : (
                            <span className="text-red-400">Expired</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Repair Form */}
            {device && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="glass rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-6">Repair Details</h3>

                <div className="space-y-4">
                  {/* Problem Description */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Problem Description *
                    </label>
                    <textarea
                      value={formData.problemDescription}
                      onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>

                  {/* Technician */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Assign Technician (Optional)
                    </label>
                    <select
                      value={formData.technicianId}
                      onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select technician...</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Warranty Approved */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="warrantyApproved"
                      checked={formData.warrantyClaimRequest}
                      onChange={(e) => setFormData({ ...formData, warrantyClaimRequest: e.target.checked })}
                      className="w-5 h-5 bg-white/5 border border-white/10 rounded"
                    />
                    <label htmlFor="warrantyApproved" className="text-white">
                      Warranty Approved (No charge to customer)
                    </label>
                  </div>

                  {/* Estimated Cost */}
                  {!formData.warrantyClaimRequest && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        Estimated Cost
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Repair'
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
