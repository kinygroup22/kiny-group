// components/dashboard/sidebar.tsx
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
  ChevronLeft,
  Clock,
  UserCheck,
  Award,
  Briefcase,
  GraduationCap,
  Handshake,
  UserCog,
  LucideIcon
} from 'lucide-react';
import { User } from '@/lib/db/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

interface SidebarProps {
  user: User;
  isCollapsed: boolean;
  onToggle: () => void;
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
      { 
        icon: UserCog, 
        label: 'Event Registrations', 
        href: '/dashboard/event-registrations', 
        roles: ['admin', 'editor', 'contributor'] 
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

export function Sidebar({ user, isCollapsed, onToggle }: SidebarProps) {
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
    <aside className={`fixed inset-y-0 left-0 z-50 bg-card border-r border-border hidden lg:block transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-border relative">
          {!isCollapsed ? (
            <Link href="/dashboard" className="flex items-center">
              <div className="relative w-36 h-14">
                <Image
                  src="/kiny-logo/gold.png"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="relative w-10 h-10">
                <Image
                  src="/kiny-logo/mobile-logo.png"
                  alt="Company Icon"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          )}
          
          {/* Toggle button */}
          <button
            onClick={onToggle}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border hover:bg-accent transition-colors flex items-center justify-center"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {filteredCategories.map((category) => (
              <div key={category.label}>
                {/* Category Label */}
                {!isCollapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category.label}
                  </h3>
                )}
                
                {/* Category Items */}
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    
                    const linkContent = (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
                          isActive 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <item.icon className={`w-5 h-5 transition-colors ${
                          isActive 
                            ? 'text-accent-foreground' 
                            : 'text-muted-foreground group-hover:text-accent-foreground'
                        } ${isCollapsed ? 'shrink-0' : ''}`} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    );

                    if (isCollapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{linkContent}</div>;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <TooltipProvider delayDuration={0}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-gold-400 to-gold-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-gold-500/50 transition-all">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(user.name, user.email)}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <div className="space-y-1">
                    <p className="font-semibold">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
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
            )}
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}