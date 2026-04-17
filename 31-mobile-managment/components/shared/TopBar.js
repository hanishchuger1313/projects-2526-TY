'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { ROLE_COLORS } from '@/lib/constants';
import useAuthStore from '@/context/AuthContext';

export default function TopBar({ title, breadcrumbs = [] }) {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  return (
    <div className="h-16 glass border-b border-white/10 px-6 flex items-center justify-between">
      {/* Title & Breadcrumbs */}
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {crumb}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-all">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Role Badge */}
        {role && (
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${ROLE_COLORS[role]}`}>
            {role.toUpperCase()}
          </div>
        )}

        {/* User Avatar */}
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
