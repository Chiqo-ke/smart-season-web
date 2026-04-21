import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 lg:px-8 h-16 gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-display font-semibold tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search fields, agents..." className="pl-9 w-64 bg-background" />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-warning" />
          </Button>
          {actions}
        </div>
      </div>
    </header>
  );
}
