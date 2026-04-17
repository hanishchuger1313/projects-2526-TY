'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiSearch, FiSmartphone, FiAlertCircle, FiCheckCircle, FiTool } from 'react-icons/fi';
import Link from 'next/link';

export default function SearchDevicePage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/servicecenter/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.device);
      } else {
        setError(data.message || 'Device not found');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: { label: 'Active', cls: 'bg-green-100 text-green-800' },
      stolen: { label: 'Stolen / Blocked', cls: 'bg-red-100 text-red-800' },
      lost: { label: 'Lost', cls: 'bg-orange-100 text-orange-800' },
      sold: { label: 'Sold', cls: 'bg-gray-100 text-gray-800' },
    };
    return map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Device</h1>
        <p className="text-gray-500 mt-1">Search by IMEI, serial number, or registration number</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter IMEI, Serial No. or Registration No."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FiSearch />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Status Banner */}
          {(result.status === 'stolen' || result.status === 'lost') && (
            <div className="bg-red-600 text-white px-5 py-3 flex items-center gap-2">
              <FiAlertCircle className="text-xl" />
              <span className="font-semibold">Warning: This device is reported as {result.status.toUpperCase()}</span>
            </div>
          )}

          <div className="p-5 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FiSmartphone className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{result.brand} {result.model}</h2>
                  <p className="text-gray-500 text-sm">IMEI: {result.imei}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(result.status).cls}`}>
                {statusBadge(result.status).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Serial Number', value: result.serialNumber || '—' },
                { label: 'Registration No.', value: result.registrationNumber || '—' },
                { label: 'Color', value: result.color || '—' },
                { label: 'Storage', value: result.storage || '—' },
                { label: 'Registered By', value: result.owner?.name || '—' },
                { label: 'Purchase Date', value: result.purchaseDate ? new Date(result.purchaseDate).toLocaleDateString() : '—' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Warranty Info */}
            {result.warrantyExpiry && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${new Date(result.warrantyExpiry) > new Date() ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                {new Date(result.warrantyExpiry) > new Date()
                  ? <FiCheckCircle className="text-green-600" />
                  : <FiAlertCircle className="text-gray-400" />}
                <span className="text-sm">
                  Warranty: {new Date(result.warrantyExpiry) > new Date()
                    ? <span className="text-green-700 font-medium">Valid until {new Date(result.warrantyExpiry).toLocaleDateString()}</span>
                    : <span className="text-gray-500">Expired on {new Date(result.warrantyExpiry).toLocaleDateString()}</span>}
                </span>
              </div>
            )}

            {/* Previous Repairs */}
            {result.repairs?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Repair History ({result.repairs.length})</h3>
                <div className="space-y-2">
                  {result.repairs.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-gray-700">{r.issueDescription}</span>
                      <span className="text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.status !== 'stolen' && (
              <Link
                href={`/dashboard/servicecenter/repairs/new?imei=${result.imei}`}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FiTool />
                Create Repair Job
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
