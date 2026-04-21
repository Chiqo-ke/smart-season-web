import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FloatingNav } from "./FloatingNav";
import { AppHeader } from "./AppHeader";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <div className="w-64 border-r border-border p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-x-hidden transition-all">
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <AppHeader title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-28 md:pb-32 lg:pb-32 max-w-full overflow-x-hidden">{children}</main>
      </div>
      <FloatingNav />
    </div>
  );
}
