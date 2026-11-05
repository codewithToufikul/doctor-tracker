'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Doctors',
    href: '/doctors',
    icon: Stethoscope,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900 border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-sm">
          <Stethoscope className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-white leading-none">
            Doctor Tracker
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">
            Clinical Operations
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Management
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
              <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${isActive
                  ? 'bg-slate-800 text-blue-400 font-medium border-l-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {item.name}
            </Link>
      );
        })}
    </nav>

      {/* Admin Profile Footer */ }
  <div className="p-4 border-t border-slate-800 bg-slate-900/60">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
        {getInitials(user?.name || 'Admin')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-200 truncate">
            {user?.name || 'Super Admin'}
          </span>
          <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
        </div>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">
          {user?.email || 'admin@doctortracker.io'}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={logout}
      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors duration-150"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Sign Out</span>
    </button>
  </div>
    </aside >
  );
};
