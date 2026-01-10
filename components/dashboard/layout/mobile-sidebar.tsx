// components/dashboard/mobile-sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Building2, 
  FolderOpen, 
  Users, 
  Settings,
  X,
  Clock,
  UserCheck,
  Award,
  Briefcase,
  GraduationCap,
  Handshake,
  LucideIcon
} from 'lucide-react';
import { User } from '@/lib/db/schema';
import LogoutButton from '@/components/auth/logout-button';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: string[];
}

interface MenuCategory {
  label: string;
  items: MenuItem[];
}

interface MobileSidebarProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const menuCategories: MenuCategory[] = [
  {
    label: 'General',
    items: [
      { 
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        href: '/dashboard', 
        roles: ['admin', 'editor', 'contributor', 'reader'] 
      },
    ]
  },
  {
    label: 'Blog Management',
    items: [
      { 
        icon: FileText, 
        label: 'Blog Posts', 
        href: '/dashboard/posts', 
        roles: ['admin', 'editor', 'contributor'] 
      },
      { 
        icon: MessageSquare, 
        label: 'Comments', 
        href: '/dashboard/comments', 
        roles: ['admin', 'editor'] 
      },
      { 
        icon: FolderOpen, 
        label: 'Categories', 
        href: '/dashboard/categories', 
        roles: ['admin', 'editor'] 
      },
    ]
  },
  {
    label: 'Brand Management',
    items: [
      { 
        icon: Building2, 
        label: 'Brand Divisions', 
        href: '/dashboard/divisions', 
        roles: ['admin', 'editor'] 
      },
    ]
  },
  {
    label: 'About Page Management',
    items: [
      { 
        icon: Clock, 
        label: 'Journey', 
        href: '/dashboard/journey', 
        roles: ['admin', 'editor'] 
      },
      { 
        icon: Award, 
        label: 'Achievements', 
        href: '/dashboard/achievements', 
        roles: ['admin', 'editor'] 
      },
      { 
        icon: Briefcase, 
        label: 'Departments', 
        href: '/dashboard/departments', 
        roles: ['admin', 'editor'] 
      },
      { 
        icon: GraduationCap, 
        label: 'Team Members', 
        href: '/dashboard/team-members', 
        roles: ['admin', 'editor'] 
      },
    ]
  },
  {
    label: 'Partners & Clients',
    items: [
      { 
        icon: UserCheck, 
        label: 'Clients', 
        href: '/dashboard/clients', 
        roles: ['admin', 'editor'] 
      },
      { 
        icon: Handshake, 
        label: 'Partners', 
        href: '/dashboard/partners', 
        roles: ['admin', 'editor'] 
      },
    ]
  },
  {
    label: 'System',
    items: [
      { 
        icon: Users, 
        label: 'Users', 
        href: '/dashboard/users', 
        roles: ['admin'] 
      },
      { 
        icon: Settings, 
        label: 'Settings', 
        href: '/dashboard/settings', 
        roles: ['admin', 'editor', 'contributor', 'reader'] 
      },
    ]
  },
];

export function MobileSidebar({ user, isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  
  const filteredCategories = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item => item.roles.includes(user.role))
  })).filter(category => category.items.length > 0);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center" onClick={onClose}>
              <div className="relative w-28 h-12">
                <Image
                  src="/kiny-logo/gold.png"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category.label}>
                {/* Category Label */}
                <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.label}
                </h3>
                
                {/* Category Items */}
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 transition-colors ${
                          isActive 
                            ? 'text-accent-foreground' 
                            : 'text-muted-foreground group-hover:text-accent-foreground'
                        }`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getInitials(user.name, user.email)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}