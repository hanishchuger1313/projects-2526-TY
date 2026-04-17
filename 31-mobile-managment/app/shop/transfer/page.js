'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import { RefreshCw, Search, History, AlertCircle, CheckCircle, Loader2, X, Send } from 'lucide-react';
import useAuthStore from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ShopTransferPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [soldDevices, setSoldDevices] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: '', email: '', phone: '' });
  const [salePrice, setSalePrice] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const shopId = user?.id || user?._id;

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!shopId) return;
    fetchData();
  }, [isAuthenticated, shopId]);

  const fetchData = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const [salesRes, transferRes] = await Promise.all([
        fetch(`/api/shop/sales?shopId=${shopId}`),
        fetch(`/api/shop/resale?shopId=${shopId}`)
      ]);
      const salesData = await salesRes.json();
      const transferData = await transferRes.json();
      setSoldDevices(salesData.sales || []);
      setTransferHistory(transferData.resales || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    if (!newOwner.phone && !newOwner.email) {
      setError('Phone or email is required for new owner');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/shop/resale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice.device?.id || selectedDevice.device?._id,
          shopId,
          newCustomerName: newOwner.name,
          newCustomerPhone: newOwner.phone,
          newCustomerEmail: newOwner.email,
          resalePrice: parseFloat(salePrice) || 0,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');
      setSuccess(`Transfer complete! Invoice: ${data.invoiceNumber}`);
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowTransferModal(false);
    setSelectedDevice(null);
    setNewOwner({ name: '', email: '', phone: '' });
    setSalePrice('');
    setNotes('');
    setError('');
  };

  const getWarrantyStatus = (w) => {
    if (!w?.expiryDate) return { label: 'No Warranty', cls: 'text-gray-400' };
    const days = Math.ceil((new Date(w.expiryDate) - new Date()) / 86400000);
    if (days <= 0) return { label: 'Expired', cls: 'text-red-400' };
    if (days <= 30) return { label: `${days}d left`, cls: 'text-amber-400' };
    return { label: 'Active', cls: 'text-green-400' };
  };

  const filtered = soldDevices.filter(s =>
    s.device?.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.device?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.device?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#0A0F1E]">
      <Sidebar role="shop" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Ownership Transfer" breadcrumbs={['Shop', 'Transfer']} />
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
                <button onClick={() => setError('')}><X className="w-4 h-4 text-red-400" /></button>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Banner */}
          <div className="glass rounded-xl p-4 border border-blue-500/30 bg-blue-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-blue-300 font-semibold mb-1">How Transfer Works</h4>
                <p className="text-blue-300/80 text-sm">
                  Select a sold device → enter new owner details → click <b>Transfer Ownership</b>.
                  The device, warranty, and history are all instantly moved to the new owner.
                </p>
              </div>
            </div>
          </div>

          {/* Sold Devices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Sold Devices</h2>
              <span className="text-gray-400 text-sm">{soldDevices.length} devices</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by IMEI, device, or customer name..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Device</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">IMEI</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Current Owner</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Sale Date</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Warranty</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-10">
                        <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
                      </td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-10 text-gray-400">
                        {soldDevices.length === 0 ? 'No sold devices yet' : 'No matching devices'}
                      </td></tr>
                    ) : filtered.map(sale => {
                      const wt = getWarrantyStatus(sale.warranty);
                      return (
                        <tr key={sale._id || sale.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                          <td className="py-4 px-5">
                            <p className="text-white font-medium">{sale.device?.brand} {sale.device?.model}</p>
                            <p className="text-xs text-gray-400">{sale.device?.storage} · {sale.device?.color}</p>
                          </td>
                          <td className="py-4 px-5">
                            <code className="text-sm text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{sale.device?.imei}</code>
                          </td>
                          <td className="py-4 px-5">
                            <p className="text-white">{sale.customer?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{sale.customer?.phone || sale.customer?.email}</p>
                          </td>
                          <td className="py-4 px-5 text-gray-300 text-sm">
                            {new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-sm font-medium ${wt.cls}`}>{wt.label}</span>
                          </td>
                          <td className="py-4 px-5">
                            <button
                              onClick={() => { setSelectedDevice(sale); setShowTransferModal(true); }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-all text-sm font-medium">
                              <RefreshCw className="w-4 h-4" /> Transfer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Transfer History */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-white">Transfer History</h2>
            </div>
            <div className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Device</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Previous Owner</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">New Owner</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Price</th>
                      <th className="text-left py-3 px-5 text-gray-400 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading...</td></tr>
                    ) : transferHistory.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400">No transfer history yet</td></tr>
                    ) : transferHistory.map(t => (
                      <tr key={t._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-5">
                          <p className="text-white font-medium">{t.device?.brand} {t.device?.model}</p>
                          <code className="text-xs text-blue-400">{t.device?.imei}</code>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-gray-300">{t.originalCustomer?.name || '—'}</p>
                          <p className="text-xs text-gray-500">{t.originalCustomer?.phone}</p>
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-white">{t.newCustomer?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{t.newCustomer?.phone}</p>
                        </td>
                        <td className="py-4 px-5 text-gray-300 text-sm">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5 text-green-400 font-semibold text-sm">
                          {t.resalePrice ? `Rs. ${t.resalePrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedDevice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" /> Transfer Ownership
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
              <p className="text-xs text-gray-400 mb-2">DEVICE BEING TRANSFERRED</p>
              <p className="text-white font-bold text-lg">{selectedDevice.device?.brand} {selectedDevice.device?.model}</p>
              <p className="text-gray-400 text-sm">IMEI: <span className="font-mono text-blue-400">{selectedDevice.device?.imei}</span></p>
              <p className="text-gray-400 text-sm mt-1">Current Owner: <span className="text-white">{selectedDevice.customer?.name || '—'}</span></p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleInitiateTransfer} className="space-y-4">
              <p className="text-white font-semibold">New Owner Details</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
                  <input type="text" placeholder="New owner's name"
                    value={newOwner.name} onChange={e => setNewOwner({ ...newOwner, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Phone Number *</label>
                  <input type="tel" placeholder="+1234567890" required
                    value={newOwner.phone} onChange={e => setNewOwner({ ...newOwner, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Email</label>
                  <input type="email" placeholder="new.owner@email.com"
                    value={newOwner.email} onChange={e => setNewOwner({ ...newOwner, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Resale Price (Rs.)</label>
                  <input type="number" min="0" placeholder="Rs. 0"
                    value={salePrice} onChange={e => setSalePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">Notes (optional)</label>
                <textarea placeholder="Reason for transfer, additional info..."
                  value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-sm text-purple-300">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />Device, warranty &amp; history instantly transferred to new owner.
                If the new owner has no account, one will be created automatically.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold transition-all flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
