import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Sprout, Users, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const allNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/fields", label: "Fields", icon: Sprout, adminOnly: false },
  { to: "/agents", label: "Agents", icon: Users, adminOnly: true },
  { to: "/updates", label: "Updates", icon: ClipboardList, adminOnly: false },
];

export function FloatingNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const nav = allNav.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4">
      <nav className="flex items-center gap-2 md:gap-6 bg-background/80 backdrop-blur-xl border border-border shadow-2xl px-6 py-3 rounded-full">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative group flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-16 rounded-3xl transition-all duration-300",
                active ? "text-primary flex-1 min-w-[5rem]" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {active && (
                <span className="absolute inset-0 bg-primary/20 rounded-3xl blur-md shadow-[0_0_20px_hsl(var(--primary))] opacity-70 transition-opacity"></span>
              )}
              <span className="relative z-10 flex flex-col items-center justify-center gap-1">
                <item.icon className={cn("size-6 transition-transform duration-300", active && "drop-shadow-[0_0_8px_hsl(var(--primary))] scale-110")} />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
