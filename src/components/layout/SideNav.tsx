"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/activity", label: "Activity", icon: "receipt_long" },
  { href: "/dao", label: "DAO", icon: "how_to_vote" },
];

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full justify-between shrink-0">
      <div className="flex flex-col gap-6 p-4">
        {/* App Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl size-10 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
            >
              account_balance_wallet
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-bold">
              Payrium
            </h1>
            <p className="text-slate-500 text-xs">
              Simple Payments on BSC
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`material-symbols-outlined ${
                    active
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-primary"
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <p className="text-sm leading-normal">{item.label}</p>
              </Link>
            );
          })}

          {/* Settings - separated */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/settings")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-slate-500">
                settings
              </span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </Link>
          </div>
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="size-9 rounded-full bg-slate-100 border-2 border-white overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: "20px" }}>
              account_circle
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-slate-900 text-sm font-medium truncate">
              My Wallet
            </p>
            <p className="text-slate-500 text-xs truncate">
              0x71C...9E3F
            </p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px] ml-auto">
            expand_more
          </span>
        </div>
      </div>
    </aside>
  );
}
