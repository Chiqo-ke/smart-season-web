import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Sprout, Users, ClipboardList, LogOut } from "lucide-react";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = allNav.filter((item) => !item.adminOnly || user?.role === "admin");

  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 w-full max-w-sm md:max-w-max flex justify-center">
      <nav className="flex items-center justify-between w-full md:w-auto gap-1 md:gap-6 bg-background/80 backdrop-blur-xl border border-border shadow-2xl px-3 py-2 md:px-6 md:py-3 rounded-full">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative group flex flex-col items-center justify-center w-12 h-14 md:w-20 md:h-16 rounded-2xl md:rounded-3xl transition-all duration-300",
                active ? "text-primary flex-1 min-w-[4rem] md:min-w-[5rem]" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {active && (
                <span className="absolute inset-0 bg-primary/20 rounded-2xl md:rounded-3xl blur-md shadow-[0_0_20px_hsl(var(--primary))] opacity-70 transition-opacity"></span>
              )}
              <span className="relative z-10 flex flex-col items-center justify-center gap-0.5 md:gap-1">
                <item.icon className={cn("size-5 md:size-6 transition-transform duration-300", active && "drop-shadow-[0_0_8px_hsl(var(--primary))] scale-110")} />
                <span className="text-[9px] md:text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </span>
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <div className="h-6 md:h-8 w-px bg-border/50 mx-1 md:mx-2 block"></div>
        <button
          onClick={handleLogout}
          className={cn(
            "relative group flex flex-col items-center justify-center w-12 h-14 md:w-20 md:h-16 rounded-2xl md:rounded-3xl transition-all duration-300",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
          )}
        >
          <span className="relative z-10 flex flex-col items-center justify-center gap-0.5 md:gap-1">
            <LogOut className="size-5 md:size-6 transition-transform duration-300" />
            <span className="text-[9px] md:text-[10px] font-medium tracking-wide">
              Log out
            </span>
          </span>
        </button>
      </nav>
    </div>
  );
}
