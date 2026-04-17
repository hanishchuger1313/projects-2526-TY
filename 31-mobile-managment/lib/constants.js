// Application Constants

export const ROLES = {
  ADMIN: 'admin',
  SHOP: 'shop',
  SERVICE: 'service',
  CUSTOMER: 'customer',
  TECHNICIAN: 'technician'
};

export const ROLE_COLORS = {
  admin: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  shop: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  service: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
  customer: 'bg-green-500/20 border-green-500/30 text-green-400',
  technician: 'bg-orange-500/20 border-orange-500/30 text-orange-400'
};

export const NAV_LINKS = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/users', label: 'User Management', icon: 'Users' },
    { href: '/admin/devices', label: 'IMEI Monitoring', icon: 'Smartphone' },
    { href: '/admin/fraud', label: 'Fraud Detection', icon: 'AlertTriangle' },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: 'FileText' }
  ],
  shop: [
    { href: '/shop/inventory', label: 'Inventory', icon: 'Package' },
    { href: '/shop/sales', label: 'Sales', icon: 'ShoppingCart' },
    { href: '/shop/warranties', label: 'Warranties', icon: 'Shield' },
    { href: '/shop/customers', label: 'Customers', icon: 'Users' },
    { href: '/shop/reports', label: 'Reports', icon: 'FileText' },
    { href: '/shop/transfer', label: 'Transfer Owner', icon: 'Wrench' }
  ],
  service: [
    { href: '/service', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/service/repairs', label: 'Repairs', icon: 'Wrench' },
    { href: '/service/technicians', label: 'Technicians', icon: 'Users' },
    { href: '/service/warranties', label: 'Warranty Claims', icon: 'Shield' },
    { href: '/service/reports', label: 'Reports', icon: 'FileText' }
  ],
  customer: [
    { href: '/customer', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/customer/devices', label: 'My Devices', icon: 'Smartphone' },
    { href: '/customer/warranties', label: 'Warranties', icon: 'Shield' },
    { href: '/customer/repairs', label: 'Repair History', icon: 'Wrench' }
  ],
  technician: [
    { href: '/technician', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/technician/assigned', label: 'Assigned Jobs', icon: 'Wrench' },
    { href: '/technician/completed', label: 'Completed', icon: 'CheckCircle' },
  ]
};

export const DEVICE_STATUS = {
  IN_STOCK: 'in-stock',
  SOLD: 'sold',
  UNDER_REPAIR: 'under-repair',
  RESOLD: 'resold'
};

export const REPAIR_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const WARRANTY_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring-soon',
  CLAIMED: 'claimed'
};

export const STATUS_COLORS = {
  'in-stock': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'sold': 'bg-green-500/20 border-green-500/30 text-green-400',
  'under-repair': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'resold': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'blacklisted': 'bg-red-500/20 border-red-500/30 text-red-400',
  'pending': 'bg-gray-500/20 border-gray-500/30 text-gray-400',
  'in-progress': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'completed': 'bg-green-500/20 border-green-500/30 text-green-400',
  'cancelled': 'bg-red-500/20 border-red-500/30 text-red-400',
  'active': 'bg-green-500/20 border-green-500/30 text-green-400',
  'expired': 'bg-red-500/20 border-red-500/30 text-red-400',
  'expiring-soon': 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'claimed': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'rejected': 'bg-red-500/20 border-red-500/30 text-red-400',
  'blocked': 'bg-red-500/20 border-red-500/30 text-red-400'
};

export const MOBILE_BRANDS = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Motorola', 'Nokia'
];

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};
