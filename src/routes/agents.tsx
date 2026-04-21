import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StageBadge } from "@/components/StatusBadge";
import { dashboardApi, fieldsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Mail, Sprout } from "lucide-react";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — SmartSeason" },
      { name: "description", content: "Manage field agents and their assignments." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "agent") navigate({ to: "/" });
  }, [user, navigate]);

  const { data: agents, isLoading: loadingAgents } = useQuery({
    queryKey: ["dashboard-agents"],
    queryFn: () => dashboardApi.agents(),
  });
  const { data: fieldsPage, isLoading: loadingFields } = useQuery({
    queryKey: ["fields"],
    queryFn: () => fieldsApi.list(),
  });

  const isLoading = loadingAgents || loadingFields;
  const allFields = fieldsPage?.results ?? [];

  return (
    <Layout
      title="Field Agents"
      subtitle={isLoading ? "Loading agents…" : `${agents?.length ?? 0} agents in the field`}
    >
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 border-border/60"><Skeleton className="h-40 w-full" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(agents ?? []).map((a) => {
            const assigned = allFields.filter((f) => f.assigned_to?.id === a.id);
            return (
              <Card key={a.id} className="p-6 border-border/60 hover:shadow-(--shadow-md) transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-xl flex items-center justify-center text-lg font-semibold text-white shrink-0 [background:var(--gradient-primary)]">
                    {a.first_name[0]}{a.last_name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold tracking-tight">{a.first_name} {a.last_name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                      <Mail className="size-3" />{a.email}
                    </div>
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">Field Agent</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-5 pt-5 border-t border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Assigned Fields</div>
                    <div className="text-xl font-display font-semibold mt-0.5">{assigned.length}</div>
                  </div>
                </div>

                {assigned.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {assigned.slice(0, 3).map((f) => (
                      <div key={f.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-muted/50">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <Sprout className="size-3 text-primary shrink-0" />
                          <span className="truncate">{f.name}</span>
                        </span>
                        <StageBadge stage={f.stage} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
