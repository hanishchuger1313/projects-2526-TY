'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import StatsCard from '@/components/shared/StatsCard';
import * as Icons from 'lucide-react';
import { STATUS_COLORS } from '@/lib/constants';

export default function ShopDashboard() {
  // Mock data for shop inventory
  const inventoryItems = [
    { id: 1, model: 'iPhone 14 Pro', brand: 'Apple', stock: 15, status: 'in-stock', price: '$999' },
    { id: 2, model: 'Samsung S23', brand: 'Samsung', stock: 8, status: 'in-stock', price: '$899' },
    { id: 3, model: 'Google Pixel 8', brand: 'Google', stock: 2, status: 'in-stock', price: '$699' },
    { id: 4, model: 'OnePlus 11', brand: 'OnePlus', stock: 0, status: 'in-stock', price: '$649' },
  ];

  const recentSales = [
    { id: 1, customer: 'John Doe', device: 'iPhone 14 Pro', amount: '$999', date: '2024-01-15', status: 'completed' },
    { id: 2, customer: 'Jane Smith', device: 'Samsung S23', amount: '$899', date: '2024-01-15', status: 'completed' },
    { id: 3, customer: 'Mike Johnson', device: 'Google Pixel 8', amount: '$699', date: '2024-01-14', status: 'completed' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar role="shop" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Shop Dashboard" />
        
       
       {/* Add the text welcome */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Your Shop </h1>
          <p className="text-gray-400 mb-6">Manage your inventory, track sales, and view customer insights all in one place.</p>
        </div>

      </div>
    </div>
  );
}
