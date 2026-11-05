"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope, Users, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";

const tabs = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Patients", href: "/patients", icon: Users },
];

export default function BottomNav({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname?.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div
                className={`flex items-center justify-center w-9 h-7 rounded-full mb-0.5 transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-500"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight">{tab.name}</span>
            </Link>
          );
        })}

        {/* Profile / Menu tab */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-500 hover:text-slate-700 active:scale-95 transition-all"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 mb-0.5">
            {getInitials(user?.name || "AD")}
          </div>
          <span className="text-[10px] tracking-tight font-medium text-slate-500">Account</span>
        </button>
      </div>
    </nav>
  );
}
