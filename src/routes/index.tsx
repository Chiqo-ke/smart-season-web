import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, StageBadge } from "@/components/StatusBadge";
import { dashboardSummary, fields, updates } from "@/lib/mock-data";
import { Sprout, Users, AlertTriangle, CheckCircle2, TrendingUp, ArrowUpRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartSeason" },
      { name: "description", content: "Real-time field operations dashboard for agricultural teams." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <Card className="p-5 border-border/60 hover:shadow-[var(--shadow-md)] transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">{label}</div>
          <div className="mt-2 text-3xl font-display font-semibold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`size-10 rounded-lg flex items-center justify-center ${accent ?? "bg-primary/10 text-primary"}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

function Dashboard() {
  const recent = updates.slice(0, 5);
  const stages = dashboardSummary.stage_breakdown;
  const total = dashboardSummary.total_fields;

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
      <div className="rounded-xl p-6 lg:p-8 mb-6 text-white relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/70 font-medium mb-2">Season 2026 · Q2</div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Welcome back, Admin</h2>
            <p className="text-white/80 mt-1 text-sm max-w-xl">{dashboardSummary.fields_updated_today} fields updated today across {dashboardSummary.total_hectares.toFixed(1)} hectares of cultivated land.</p>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-3xl font-display font-semibold">{dashboardSummary.total_hectares.toFixed(0)}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">Hectares</div>
            </div>
            <div>
              <div className="text-3xl font-display font-semibold">{dashboardSummary.status_breakdown.active}</div>
              <div className="text-xs text-white/70 uppercase tracking-wider">Active fields</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Fields" value={dashboardSummary.total_fields} sub={`${dashboardSummary.unassigned_fields} unassigned`} icon={Sprout} accent="bg-primary/10 text-primary" />
        <Stat label="Field Agents" value={dashboardSummary.total_agents} sub="All active" icon={Users} accent="bg-info/10 text-info" />
        <Stat label="At Risk" value={dashboardSummary.status_breakdown.at_risk} sub="Needs attention" icon={AlertTriangle} accent="bg-warning/15 text-warning-foreground" />
        <Stat label="Completed" value={dashboardSummary.status_breakdown.completed} sub="This season" icon={CheckCircle2} accent="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage breakdown */}
        <Card className="p-6 lg:col-span-2 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold tracking-tight">Crop Stage Distribution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Linear progression: Planted → Growing → Ready → Harvested</p>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {(["planted", "growing", "ready", "harvested"] as const).map((s) => {
              const count = stages[s];
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
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
              <div className="mt-1 text-xl font-display font-semibold text-success">{dashboardSummary.status_breakdown.active}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">At Risk</div>
              <div className="mt-1 text-xl font-display font-semibold text-warning-foreground">{dashboardSummary.status_breakdown.at_risk}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Completed</div>
              <div className="mt-1 text-xl font-display font-semibold text-muted-foreground">{dashboardSummary.status_breakdown.completed}</div>
            </div>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold tracking-tight">Recent Updates</h3>
            <Link to="/updates" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recent.map((u) => (
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
        </Card>
      </div>

      {/* Field overview list */}
      <Card className="mt-6 border-border/60 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold tracking-tight">Field Overview</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Latest status across your portfolio</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/fields">Manage</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-3 px-6 font-medium">Field</th>
                <th className="text-left py-3 px-4 font-medium">Crop</th>
                <th className="text-left py-3 px-4 font-medium">Stage</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Agent</th>
                <th className="text-right py-3 px-6 font-medium">Hectares</th>
              </tr>
            </thead>
            <tbody>
              {fields.slice(0, 6).map((f) => (
                <tr key={f.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-6">
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="size-3" />{f.region}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{f.crop_type}</td>
                  <td className="py-3 px-4"><StageBadge stage={f.stage} /></td>
                  <td className="py-3 px-4"><StatusBadge status={f.status} /></td>
                  <td className="py-3 px-4 text-muted-foreground">{f.assigned_to ? `${f.assigned_to.first_name} ${f.assigned_to.last_name}` : <span className="italic">Unassigned</span>}</td>
                  <td className="py-3 px-6 text-right font-mono">{f.hectares.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
