'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Wrench,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Phone,
  Mail,
  Calendar,
  User,
  Shield,
  History,
  Eye
} from 'lucide-react';
import { isValidImei, toImeiInputValue } from '@/lib/imei';

export default function ServiceCenterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('search');
  const [searchIMEI, setSearchIMEI] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // New repair form
  const [newRepairForm, setNewRepairForm] = useState({
    problemDescription: '',
    customerComplaints: '',
    estimatedCost: '',
    warrantyClaimRequest: false,
    technicianId: ''
  });

  // Parts form
  const [partForm, setPartForm] = useState({
    name: '',
    partNumber: '',
    quantity: 1,
    unitPrice: 0
  });

  const [chargeForm, setChargeForm] = useState({
    description: '',
    amount: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'servicecenter') {
      router.push('/unauthorized');
    } else {
      fetchRepairs();
    }
  }, [status, session, router, statusFilter]);

  // Search device by IMEI
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValidImei(searchIMEI)) {
      alert('IMEI must be exactly 15 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/servicecenter/search?imei=${searchIMEI}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResult(data);
      } else {
        alert(data.error || 'Device not found');
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search device');
    } finally {
      setLoading(false);
    }
  };

  // Create new repair
  const handleCreateRepair = async (e) => {
    e.preventDefault();
    if (!searchResult?.device) {
      alert('Please search for a device first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/servicecenter/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: searchResult.device.id,
          imei: searchResult.device.imei,
          servicecenterId: session.user.id,
          ...newRepairForm
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Repair entry created successfully!');
        setNewRepairForm({
          problemDescription: '',
          customerComplaints: '',
          estimatedCost: '',
          warrantyClaimRequest: false,
          technicianId: ''
        });
        setActiveTab('repairs');
        fetchRepairs();
      } else {
        alert(data.error || 'Failed to create repair');
      }
    } catch (error) {
      console.error('Create repair error:', error);
      alert('Failed to create repair');
    } finally {
      setLoading(false);
    }
  };

  // Fetch repairs
  const fetchRepairs = async () => {
    if (!session?.user?.id) return;

    try {
      const url = `/api/servicecenter/repairs?servicecenterId=${session.user.id}${
        statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRepairs(data.repairs || []);
      }
    } catch (error) {
      console.error('Fetch repairs error:', error);
    }
  };

  // Update repair status
  const handleUpdateStatus = async (repairId, newStatus) => {
    try {
      const response = await fetch('/api/servicecenter/repairs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairId,
          repairStatus: newStatus
        })
      });

      if (response.ok) {
        alert('Status updated successfully');
        fetchRepairs();
        if (selectedRepair?._id === repairId) {
          fetchRepairDetails(repairId);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Failed to update status');
    }
  };

  // Fetch repair details
  const fetchRepairDetails = async (repairId) => {
    try {
      const response = await fetch(`/api/servicecenter/repairs?repairId=${repairId}`);
      const data = await response.json();

      if (response.ok && data.repairs?.[0]) {
        setSelectedRepair(data.repairs[0]);
      }
    } catch (error) {
      console.error('Fetch repair details error:', error);
    }
  };

  // Add parts
  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedRepair) return;

    try {
      const response = await fetch('/api/servicecenter/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairId: selectedRepair._id,
          parts: [partForm]
        })
      });

      if (response.ok) {
        alert('Part added successfully');
        setPartForm({ name: '', partNumber: '', quantity: 1, unitPrice: 0 });
        fetchRepairDetails(selectedRepair._id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add part');
      }
    } catch (error) {
      console.error('Add part error:', error);
      alert('Failed to add part');
    }
  };

  // Add service charge
  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!selectedRepair) return;

    try {
      const response = await fetch('/api/servicecenter/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairId: selectedRepair._id,
          serviceCharges: [chargeForm]
        })
      });

      if (response.ok) {
        alert('Service charge added successfully');
        setChargeForm({ description: '', amount: 0 });
        fetchRepairDetails(selectedRepair._id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add charge');
      }
    } catch (error) {
      console.error('Add charge error:', error);
      alert('Failed to add charge');
    }
  };

  // Remove part/charge
  const handleRemoveItem = async (type, index) => {
    if (!selectedRepair || !confirm(`Remove this ${type}?`)) return;

    try {
      const response = await fetch(
        `/api/servicecenter/parts?repairId=${selectedRepair._id}&type=${type}&index=${index}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert(`${type} removed successfully`);
        fetchRepairDetails(selectedRepair._id);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Remove item error:', error);
      alert('Failed to remove item');
    }
  };

  // Close repair
  const handleCloseRepair = async () => {
    if (!selectedRepair || !confirm('Close this repair and finalize billing?')) return;

    const paymentMethod = prompt('Payment method (cash/card/upi):', 'cash');
    if (!paymentMethod) return;

    try {
      const response = await fetch('/api/servicecenter/close-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repairId: selectedRepair._id,
          paymentMethod,
          paidAmount: selectedRepair.finalBill
        })
      });

      if (response.ok) {
        alert('Repair closed successfully!');
        setSelectedRepair(null);
        setActiveTab('repairs');
        fetchRepairs();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to close repair');
      }
    } catch (error) {
      console.error('Close repair error:', error);
      alert('Failed to close repair');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'waiting-parts': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Center Dashboard</h1>
          <p className="text-gray-600">Manage device repairs and service requests</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'search', label: 'Device Search', icon: Search },
                { id: 'repairs', label: 'Repairs', icon: Wrench },
                { id: 'parts', label: 'Parts & Billing', icon: Package }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Device Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter 15-digit IMEI number"
                    value={searchIMEI}
                    onChange={(e) => setSearchIMEI(toImeiInputValue(e.target.value))}
                    inputMode="numeric"
                    pattern="[0-9]{15}"
                    maxLength={15}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || !isValidImei(searchIMEI)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>{loading ? 'Searching...' : 'Search'}</span>
                  </button>
                </form>

                {/* Search Results */}
                {searchResult && (
                  <div className="space-y-6">
                    {/* Device Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Device Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Brand & Model</p>
                          <p className="font-semibold">{searchResult.device.brand} {searchResult.device.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">IMEI</p>
                          <p className="font-semibold">{searchResult.device.imei}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Storage</p>
                          <p className="font-semibold">{searchResult.device.storage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Color</p>
                          <p className="font-semibold">{searchResult.device.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold capitalize">{searchResult.device.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    {searchResult.customer && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          Customer Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-semibold">{searchResult.customer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-semibold">{searchResult.customer.phone}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold">{searchResult.customer.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warranty Info */}
                    {searchResult.warranty && (
                      <div className={`border rounded-lg p-6 ${
                        searchResult.warranty.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Warranty Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-semibold">{searchResult.warranty.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Days Remaining</p>
                            <p className="font-semibold">{searchResult.warranty.daysRemaining} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Expiry Date</p>
                            <p className="font-semibold">
                              {new Date(searchResult.warranty.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-semibold capitalize">{searchResult.warranty.warrantyType}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Repair History */}
                    {searchResult.repairHistory && searchResult.repairHistory.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <History className="w-5 h-5 mr-2" />
                          Repair History
                        </h3>
                        <div className="space-y-4">
                          {searchResult.repairHistory.map((repair, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{repair.problemDescription}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(repair.createdAt).toLocaleDateString()}
                                  </p>
                                  {repair.servicecenter && (
                                    <p className="text-sm text-gray-600">
                                      Service Center: {repair.servicecenter.name}
                                    </p>
                                  )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(repair.repairStatus)}`}>
                                  {repair.repairStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Create Repair Form */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Create New Repair Entry</h3>
                      <form onSubmit={handleCreateRepair} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Problem Description
                          </label>
                          <textarea
                            value={newRepairForm.problemDescription}
                            onChange={(e) => setNewRepairForm({...newRepairForm, problemDescription: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Complaints
                          </label>
                          <textarea
                            value={newRepairForm.customerComplaints}
                            onChange={(e) => setNewRepairForm({...newRepairForm, customerComplaints: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Cost
                          </label>
                          <input
                            type="number"
                            value={newRepairForm.estimatedCost}
                            onChange={(e) => setNewRepairForm({...newRepairForm, estimatedCost: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="warrantyClaimRequest"
                            checked={newRepairForm.warrantyClaimRequest}
                            onChange={(e) => setNewRepairForm({...newRepairForm, warrantyClaimRequest: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="warrantyClaimRequest" className="ml-2 text-sm text-gray-700">
                            Request Warranty Claim
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Create Repair Entry</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Repairs Tab */}
            {activeTab === 'repairs' && (
              <div className="space-y-6">
                {/* Filter */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting-parts">Waiting for Parts</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Repairs List */}
                <div className="grid gap-4">
                  {repairs.map((repair) => (
                    <div key={repair._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{repair.device?.brand} {repair.device?.model}</h3>
                          <p className="text-sm text-gray-600">IMEI: {repair.imei}</p>
                          <p className="text-sm text-gray-600">Job: {repair.jobNumber}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(repair.repairStatus)}`}>
                          {repair.repairStatus}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Problem:</p>
                        <p className="text-sm text-gray-600">{repair.problemDescription}</p>
                      </div>

                      {repair.customer && (
                        <div className="mb-4 text-sm">
                          <p className="text-gray-700">
                            <User className="w-4 h-4 inline mr-1" />
                            {repair.customer.name} - {repair.customer.phone}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {new Date(repair.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          {repair.repairStatus !== 'delivered' && (
                            <>
                              <select
                                value={repair.repairStatus}
                                onChange={(e) => handleUpdateStatus(repair._id, e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="waiting-parts">Waiting Parts</option>
                                <option value="completed">Completed</option>
                              </select>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRepair(repair);
                              setActiveTab('parts');
                            }}
                            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {repairs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Wrench className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>No repairs found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parts & Billing Tab */}
            {activeTab === 'parts' && (
              <div className="space-y-6">
                {selectedRepair ? (
                  <>
                    {/* Repair Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {selectedRepair.device?.brand} {selectedRepair.device?.model}
                          </h3>
                          <p className="text-sm text-gray-600">IMEI: {selectedRepair.imei}</p>
                          <p className="text-sm text-gray-600">Job: {selectedRepair.jobNumber}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedRepair.repairStatus)}`}>
                          {selectedRepair.repairStatus}
                        </span>
                      </div>
                      {selectedRepair.warrantyApproved && (
                        <div className="bg-green-100 border border-green-300 rounded p-3 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-green-800 font-medium">Warranty Approved - No charge to customer</span>
                        </div>
                      )}
                    </div>

                    {/* Add Parts */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Add Parts</h3>
                      <form onSubmit={handleAddPart} className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Part Name"
                          value={partForm.name}
                          onChange={(e) => setPartForm({...partForm, name: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Part Number"
                          value={partForm.partNumber}
                          onChange={(e) => setPartForm({...partForm, partNumber: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Quantity"
                          value={partForm.quantity}
                          onChange={(e) => setPartForm({...partForm, quantity: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={partForm.unitPrice}
                          onChange={(e) => setPartForm({...partForm, unitPrice: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                          required
                        />
                        <button
                          type="submit"
                          className="col-span-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add Part</span>
                        </button>
                      </form>

                      {/* Parts List */}
                      {selectedRepair.parts && selectedRepair.parts.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-3">Parts Used</h4>
                          <div className="space-y-2">
                            {selectedRepair.parts.map((part, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{part.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Qty: {part.quantity} × ${part.unitPrice} = ${part.totalPrice}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem('part', index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Service Charges */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Add Service Charges</h3>
                      <form onSubmit={handleAddCharge} className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Service Description"
                          value={chargeForm.description}
                          onChange={(e) => setChargeForm({...chargeForm, description: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={chargeForm.amount}
                          onChange={(e) => setChargeForm({...chargeForm, amount: e.target.value})}
                          className="px-4 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                          required
                        />
                        <button
                          type="submit"
                          className="col-span-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add Service Charge</span>
                        </button>
                      </form>

                      {/* Service Charges List */}
                      {selectedRepair.serviceCharges && selectedRepair.serviceCharges.length > 0 && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-3">Service Charges</h4>
                          <div className="space-y-2">
                            {selectedRepair.serviceCharges.map((charge, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">{charge.description}</p>
                                  <p className="text-sm text-gray-600">${charge.amount}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveItem('charge', index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Bill */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                      <h3 className="text-2xl font-bold mb-4">Billing Summary</h3>
                      <div className="space-y-2 text-lg">
                        <div className="flex justify-between">
                          <span>Parts Cost:</span>
                          <span className="font-semibold">${selectedRepair.totalPartsCost || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service Charges:</span>
                          <span className="font-semibold">${selectedRepair.totalServiceCharge || 0}</span>
                        </div>
                        <div className="border-t border-blue-400 pt-2 mt-2">
                          <div className="flex justify-between text-2xl font-bold">
                            <span>Final Bill:</span>
                            <span>${selectedRepair.finalBill || 0}</span>
                          </div>
                        </div>
                      </div>

                      {selectedRepair.repairStatus !== 'delivered' && (
                        <button
                          onClick={handleCloseRepair}
                          className="mt-6 w-full px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Close Repair & Finalize Bill</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Select a repair from the Repairs tab to manage parts and billing</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
