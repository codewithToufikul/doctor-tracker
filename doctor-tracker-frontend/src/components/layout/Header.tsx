"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Calendar, ChevronRight, Stethoscope } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] === "dashboard") {
    return [{ label: "Dashboard", href: "/dashboard" }];
  }

  const breadcrumbs = [];
  if (segments[0] === "doctors") {
    breadcrumbs.push({ label: "Doctors", href: "/doctors" });
    if (segments[1]) {
      breadcrumbs.push({ label: "Doctor Profile", href: `/doctors/${segments[1]}` });
    }
  } else if (segments[0] === "patients") {
    breadcrumbs.push({ label: "Patients", href: "/patients" });
    if (segments[1]) {
      breadcrumbs.push({ label: "Patient Details", href: `/patients/${segments[1]}` });
    }
  }
  return breadcrumbs;
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const breadcrumbs = getBreadcrumbs(pathname || "");
  const today = formatDate(new Date());

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-14 sm:h-16 px-3.5 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu drawer trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors active:scale-95"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand logo visible only on small mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 text-white shadow-xs">
            <Stethoscope className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs font-medium text-slate-500 truncate">
          <span className="hidden sm:inline text-slate-400">Portal</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <ChevronRight className="w-3 h-3 mx-1 text-slate-300 shrink-0 hidden sm:inline" />
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-semibold truncate text-xs sm:text-sm">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-900 transition-colors hidden sm:inline text-xs"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Date display */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{today}</span>
        </div>

        {/* Live Admin Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-800">
            {user?.name?.split(" ")[0] || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
};
