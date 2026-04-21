import { useState } from "react";
import { useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, StageBadge } from "@/components/StatusBadge";
import { dashboardApi, fieldsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Sprout, Users, AlertTriangle, CheckCircle2, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartSeason" },
      { name: "description", content: "Real-time field operations dashboard for agricultural teams." },
    ],
  }),
  component: Dashboard,
});

function ProgressFill({ pct, className }: { pct: number; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${pct}%`;
  }, [pct]);
  return <div ref={ref} className={className} />;
}

function Stat({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <Card className="p-4 md:p-5 border-border/60 hover:shadow-(--shadow-md) transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{label}</div>
          <div className="mt-1 md:mt-2 text-2xl md:text-3xl font-display font-semibold tracking-tight">{value}</div>
          {sub && <div className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`size-8 md:size-10 rounded-lg flex items-center justify-center shrink-0 ${accent ?? "bg-primary/10 text-primary"}`}>
          <Icon className="size-4 md:size-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.summary(),
  });
  const { data: fieldsPageResult, isLoading: loadingFields } = useQuery({
    queryKey: ["fields"],
    queryFn: () => fieldsApi.list(),
  });

  const isLoading = loadingSummary || loadingFields;
  const stages = summary?.stage_breakdown;
  const total = summary?.total_fields ?? 0;
  const recentUpdates = summary?.recent_updates ?? [];
  const fields = fieldsPageResult?.results ?? [];
  const firstName = user ? (user.first_name || user.email.split("@")[0]) : "there";
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(true);

  return (
    <Layout
      title="Operations Dashboard"
      subtitle="Real-time view across all fields and agents"
      actions={
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/fields">View Fields <ArrowUpRight className="size-4 ml-1" /></Link>
        </Button>
      }
    >
      {/* Hero strip */}
      <div className="rounded-xl p-5 md:p-6 lg:p-8 mb-4 md:mb-6 text-white relative overflow-hidden [background:var(--gradient-hero)]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] bg-size-[32px_32px]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between py-2 gap-4">
          <div>
            <div className="text-[10px] md:text-xs uppercase tracking-widest text-white/70 font-medium mb-1 md:mb-2">Season 2026 · Q2</div>
            <h2 className="text-xl md:text-3xl font-display font-semibold tracking-tight">Welcome back, {firstName}</h2>
            <p className="text-white/80 mt-1 text-[11px] md:text-sm max-w-xl">
              {summary ? `${summary.fields_updated_today} field${summary.fields_updated_today !== 1 ? "s" : ""} updated today.` : "Loading field activity…"}
            </p>
          </div>
          <div className="flex gap-4 md:gap-6 mt-2 md:mt-0 pt-2 border-t border-white/10 md:border-none md:pt-0">
            <div>
              <div className="text-2xl md:text-3xl font-display font-semibold">{summary?.status_breakdown.active ?? "—"}</div>
              <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider">Active fields</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-display font-semibold">{summary?.total_agents ?? "—"}</div>
              <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider">Agents</div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border-border/60"><Skeleton className="h-16 w-full" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label="Total Fields" value={summary?.total_fields ?? 0} sub={`${summary?.unassigned_fields ?? 0} unassigned`} icon={Sprout} accent="bg-primary/10 text-primary" />
          <Stat label="Field Agents" value={summary?.total_agents ?? 0} sub="All active" icon={Users} accent="bg-info/10 text-info" />
          <Stat label="At Risk" value={summary?.status_breakdown.at_risk ?? 0} sub="Needs attention" icon={AlertTriangle} accent="bg-warning/15 text-warning-foreground" />
          <Stat label="Completed" value={summary?.status_breakdown.completed ?? 0} sub="This season" icon={CheckCircle2} accent="bg-success/10 text-success" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold tracking-tight">Crop Stage Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Linear progression: Planted → Growing → Ready → Harvested</p>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : (
            <>
              <div className="space-y-4">
                {(["planted", "growing", "ready", "harvested"] as const).map((s) => {
                  const count = stages?.[s] ?? 0;
                  const pct = total ? (count / total) * 100 : 0;
                  const color = s === "planted" ? "bg-info" : s === "growing" ? "bg-primary" : s === "ready" ? "bg-warning" : "bg-muted-foreground";
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <StageBadge stage={s} />
                          <span className="text-sm text-muted-foreground">{count} fields</span>
                        </div>
                        <span className="text-sm font-medium">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <ProgressFill pct={pct} className={`h-full ${color} rounded-full transition-all`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold tracking-tight">Recent Updates</h3>
            <Link 
              to="/updates" 
              className="relative text-xs text-primary hover:underline"
              onClick={() => setHasUnreadUpdates(false)}
            >
              View all
              {recentUpdates.length > 3 && hasUnreadUpdates && (
                <span className="absolute -top-1 -right-2 size-2 rounded-full bg-warning shadow-[0_0_8px_hsl(var(--warning))]" />
              )}
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : recentUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          ) : (
            <div className="space-y-4">
              {recentUpdates.slice(0, 3).map((u) => (
                <div key={u.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="size-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {u.agent.first_name[0]}{u.agent.last_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{u.field.name}</span>
                      <StageBadge stage={u.stage} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{u.notes}</p>
                    <div className="text-[11px] text-muted-foreground/70 mt-1">
                      {u.agent.first_name} {u.agent.last_name} · {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
