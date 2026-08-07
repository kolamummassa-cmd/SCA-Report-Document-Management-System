"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Search,
  BarChart3,
  Calendar,
  Bell,
  ShieldAlert,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Only Dashboard is wired up in Phase 5 — the rest ship in Phases 6-10
// per the Development Roadmap, but are shown (disabled) so the shell
// reflects the full information architecture from the UI Design Plan.
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Reports", href: "/reports", icon: FileText, enabled: false },
  { label: "Documents", href: "/documents", icon: FolderOpen, enabled: false },
  { label: "Search", href: "/search", icon: Search, enabled: false },
  { label: "Analytics", href: "/analytics", icon: BarChart3, enabled: false },
  { label: "Calendar", href: "/calendar", icon: Calendar, enabled: false },
  { label: "Notifications", href: "/notifications", icon: Bell, enabled: false },
  { label: "Audit Log", href: "/audit-log", icon: ShieldAlert, enabled: false },
  { label: "Settings", href: "/settings", icon: Settings, enabled: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-surface transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          S
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold leading-tight">SCA RDMS</p>
            <p className="truncate text-xs text-muted-foreground">Heal. Protect. Restore.</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          const content = (
            <span
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.enabled
                  ? isActive
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-surface-muted"
                  : "cursor-not-allowed text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && !item.enabled && (
                <span className="ml-auto rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  Soon
                </span>
              )}
            </span>
          );

          return item.enabled ? (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          ) : (
            <div key={item.href}>{content}</div>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:bg-surface-muted"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
