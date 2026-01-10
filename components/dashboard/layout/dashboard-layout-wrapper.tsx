// components/dashboard/dashboard-layout-wrapper.tsx
"use client";

import React, { useState } from 'react';
import { User } from '@/lib/db/schema';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutWrapperProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({ user, children }: DashboardLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar 
        user={user} 
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Navbar */}
        <Navbar 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* Page content */}
        <main className="mt-12 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}