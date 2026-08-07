"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Sun, Moon, Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";

function breadcrumbFromPath(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-6 backdrop-blur">
      <div>
        <p className="text-xs text-muted-foreground">SCA Report &amp; Document Management System</p>
        <p className="text-sm font-semibold">{breadcrumbFromPath(pathname)}</p>
      </div>

      <div className="ml-4 flex flex-1 items-center">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            disabled
            placeholder="Search reports, documents... (Phase 7)"
            className="h-9 w-full cursor-not-allowed rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-muted-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-surface-muted"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      <button
        disabled
        className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md border border-border text-muted-foreground"
        aria-label="Notifications (Phase 9)"
      >
        <Bell className="h-4 w-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm hover:bg-surface-muted"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <span className="hidden sm:inline">
            {user?.firstName} {user?.lastName}
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-surface p-1 shadow-sm animate-fade-in">
            <div className="px-3 py-2 text-xs text-muted-foreground">{user?.email}</div>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
