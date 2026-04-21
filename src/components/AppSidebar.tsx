import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Sprout, Users, ClipboardList, Settings, Leaf, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const allNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/fields", label: "Fields", icon: Sprout, adminOnly: false },
  { to: "/agents", label: "Agents", icon: Users, adminOnly: true },
  { to: "/updates", label: "Update Log", icon: ClipboardList, adminOnly: false },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = allNav.filter((item) => !item.adminOnly || user?.role === "admin");

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "?";

  const displayName =
    user
      ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
      : "";

  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-sidebar-border">
        <div className="size-9 rounded-lg bg-sidebar-primary/15 flex items-center justify-center">
          <Leaf className="size-5 text-sidebar-primary" />
        </div>
        <div>
          <div className="font-display font-semibold text-sm tracking-tight">SmartSeason</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Agri Operations</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Workspace</div>
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary/15 text-sidebar-primary-foreground border-l-2 border-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
          <Settings className="size-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
        <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/50">
          <div className="size-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-[11px] text-sidebar-foreground/50 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
