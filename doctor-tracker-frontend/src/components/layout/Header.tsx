'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0 || segments[0] === 'dashboard') {
    return [{ label: 'Dashboard', href: '/dashboard' }];
  }

  const breadcrumbs = [];
  if (segments[0] === 'doctors') {
    breadcrumbs.push({ label: 'Doctors', href: '/doctors' });
    if (segments[1]) {
      breadcrumbs.push({ label: 'Doctor Profile', href: `/doctors/${segments[1]}` });
    }
  } else if (segments[0] === 'patients') {
    breadcrumbs.push({ label: 'Patients', href: '/patients' });
    if (segments[1]) {
      breadcrumbs.push({ label: 'Patient Details', href: `/patients/${segments[1]}` });
    }
  }
  return breadcrumbs;
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const breadcrumbs = getBreadcrumbs(pathname || '');
  const today = formatDate(new Date());

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-medium text-slate-500">
          <span className="hidden sm:inline text-slate-400">Portal</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-semibold">{crumb.label}</span>
              ) : (
                  <Link
                  href={crumb.href}
                  className="hover:text-slate-900 transition-colors"
                >
                  {crumb.label}
                </Link>
          )}
        </React.Fragment>
          ))}
      </nav>
    </div>

      {/* Right Tools */ }
  <div className="flex items-center gap-4">
    {/* Date display */}
    <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60">
      <Calendar className="w-3.5 h-3.5 text-slate-400" />
      <span>{today}</span>
    </div>

    {/* Live Admin Indicator */}
    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-700">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="hidden sm:inline font-medium text-slate-700">
        {user?.name || 'Administrator'}
      </span>
    </div>
  </div>
    </header >
  );
};
