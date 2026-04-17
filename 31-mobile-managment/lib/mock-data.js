// Mock Data for Development

export const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@mobileshop.com',
    role: 'admin',
    phone: '+1-555-0001',
    status: 'active'
  },
  {
    id: '2',
    name: 'Mobile Hub',
    email: 'shop@mobilehub.com',
    role: 'shop',
    phone: '+1-555-0002',
    status: 'active',
    shopName: 'Mobile Hub'
  },
  {
    id: '3',
    name: 'QuickFix Mobile',
    email: 'service@quickfix.com',
    role: 'service',
    phone: '+1-555-0003',
    status: 'active',
    centerName: 'QuickFix Mobile'
  },
  {
    id: '4',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'customer',
    phone: '+1-555-0004',
    status: 'active'
  },
  {
    id: '5',
    name: 'Mike Wilson',
    email: 'mike@quickfix.com',
    role: 'technician',
    phone: '+1-555-0005',
    status: 'active'
  }
];

export const mockDevices = [
  {
    id: 'DEV001',
    imei: '358912345678901',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    storage: '256GB',
    color: 'Natural Titanium',
    status: 'sold',
    purchaseDate: '2024-01-15',
    warrantyExpiry: '2025-01-15',
    currentOwner: 'John Smith',
    shopId: '2',
    price: 999
  },
  {
    id: 'DEV002',
    imei: '358912345678902',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storage: '512GB',
    color: 'Phantom Black',
    status: 'in-stock',
    purchaseDate: null,
    warrantyExpiry: null,
    currentOwner: null,
    shopId: '2',
    price: 1199
  },
  {
    id: 'DEV003',
    imei: '358912345678903',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storage: '128GB',
    color: 'Bay Blue',
    status: 'under-repair',
    purchaseDate: '2024-02-10',
    warrantyExpiry: '2025-02-10',
    currentOwner: 'Sarah Johnson',
    shopId: '2',
    price: 899
  }
];

export const mockRepairs = [
  {
    id: 'REP001',
    deviceId: 'DEV003',
    imei: '358912345678903',
    customerName: 'Sarah Johnson',
    issue: 'Screen cracked, touch not working',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Mike Wilson',
    createdDate: '2024-03-01',
    estimatedCompletion: '2024-03-05',
    cost: 299
  },
  {
    id: 'REP002',
    deviceId: 'DEV001',
    imei: '358912345678901',
    customerName: 'John Smith',
    issue: 'Battery draining fast',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'Mike Wilson',
    createdDate: '2024-02-20',
    completedDate: '2024-02-22',
    cost: 89
  }
];

export const mockWarranties = [
  {
    id: 'WAR001',
    deviceId: 'DEV001',
    imei: '358912345678901',
    customerName: 'John Smith',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    startDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'active',
    claimsUsed: 0,
    claimsAllowed: 2
  },
  {
    id: 'WAR002',
    deviceId: 'DEV003',
    imei: '358912345678903',
    customerName: 'Sarah Johnson',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    startDate: '2024-02-10',
    expiryDate: '2025-02-10',
    status: 'active',
    claimsUsed: 1,
    claimsAllowed: 2
  }
];

export const mockAdminStats = {
  totalDevices: 1247,
  activeWarranties: 856,
  openRepairs: 34,
  fraudAlerts: 3
};

export const mockMonthlyRegistrations = [
  { month: 'Jan', count: 85 },
  { month: 'Feb', count: 92 },
  { month: 'Mar', count: 78 },
  { month: 'Apr', count: 101 },
  { month: 'May', count: 95 },
  { month: 'Jun', count: 110 }
];

export const mockDevicesByStatus = [
  { name: 'In Stock', value: 450, color: '#3b82f6' },
  { name: 'Sold', value: 620, color: '#10b981' },
  { name: 'Under Repair', value: 34, color: '#f59e0b' },
  { name: 'Resold', value: 143, color: '#8b5cf6' }
];

export const mockShopStats = {
  totalSales: 1250,
  revenue: '$1,245,000',
  activeWarranties: 856,
  pendingRepairs: 12
};

export const mockServiceStats = {
  totalRepairs: 145,
  inProgress: 34,
  completed: 111,
  revenue: '$45,600'
};

export const mockCustomerDevices = [
  {
    id: 'DEV001',
    imei: '358912345678901',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    purchaseDate: '2024-01-15',
    warrantyStatus: 'active',
    warrantyExpiry: '2025-01-15'
  }
];

export const mockTechnicianJobs = [
  {
    id: 'REP001',
    imei: '358912345678903',
    device: 'Google Pixel 8 Pro',
    customer: 'Sarah Johnson',
    issue: 'Screen cracked',
    priority: 'high',
    status: 'in-progress',
    assignedDate: '2024-03-01'
  },
  {
    id: 'REP004',
    imei: '358912345678905',
    device: 'Samsung Galaxy S24',
    customer: 'Robert Brown',
    issue: 'Battery replacement',
    priority: 'medium',
    status: 'pending',
    assignedDate: '2024-03-04'
  }
];
