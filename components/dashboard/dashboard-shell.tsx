"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Home, Megaphone, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/seo", label: "SEO", icon: Search },
  { href: "/dashboard/ads", label: "Google Ads", icon: Megaphone },
];

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/medallion-fence-logo.png"
        alt="Medallion Fence"
        width={compact ? 44 : 56}
        height={compact ? 44 : 56}
        priority={compact}
        className={cn(
          "shrink-0 rounded-md border border-border bg-white object-contain shadow-sm",
          compact ? "h-11 w-11 p-1" : "h-14 w-14 p-1.5",
        )}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-500">Medallion Fence</p>
        <p className={cn("truncate font-semibold text-slate-950", compact ? "text-base" : "text-lg")}>SEO Dashboard</p>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-slate-600 transition-colors",
              active && "bg-primary text-white shadow-sm",
              !active && "hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-white px-5 py-5 lg:block">
        <div className="flex h-full flex-col">
          <BrandLogo />
          <div className="mt-8">
            <NavLinks />
          </div>
          <div className="mt-auto rounded-lg border border-border bg-slate-50 p-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-semibold text-slate-950">Live business reporting</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">Google Analytics data refreshes directly from GA4.</p>
          </div>
          <Button variant="ghost" className="mt-4 justify-start" onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <BrandLogo compact />
          <Button variant="outline" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/30" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[88vw] bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <BrandLogo compact />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-8">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <Button variant="ghost" className="mt-6 justify-start" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      )}

      <main className="pb-20 lg:ml-72 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white px-2 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-slate-500",
                  active && "bg-primary text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
