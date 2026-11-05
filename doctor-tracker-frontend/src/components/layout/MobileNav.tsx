'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Doctors', href: '/doctors', icon: Stethoscope },
  { name: 'Patients', href: '/patients', icon: Users },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shadow-2xl z-50">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-sm">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Doctor Tracker
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
              {getInitials(user?.name || 'Admin')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-200 truncate">
                  {user?.name || 'Super Admin'}
                </span>
                <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@doctortracker.io'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
