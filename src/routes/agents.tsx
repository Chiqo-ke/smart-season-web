import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { agents, fields } from "@/lib/mock-data";
import { Mail, MapPin, Sprout, UserPlus } from "lucide-react";

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
  return (
    <Layout
      title="Field Agents"
      subtitle={`${agents.length} agents in the field`}
      actions={<Button className="bg-primary hover:bg-primary/90"><UserPlus className="size-4 mr-1" /> Invite Agent</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((a) => {
          const assigned = fields.filter(f => f.assigned_to?.id === a.id);
          const totalHa = assigned.reduce((s, f) => s + f.hectares, 0);
          return (
            <Card key={a.id} className="p-6 border-border/60 hover:shadow-[var(--shadow-md)] transition-shadow">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-xl flex items-center justify-center text-lg font-semibold text-white shrink-0" style={{ background: "var(--gradient-primary)" }}>
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

              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-border">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fields</div>
                  <div className="text-xl font-display font-semibold mt-0.5">{assigned.length}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hectares</div>
                  <div className="text-xl font-display font-semibold mt-0.5">{totalHa.toFixed(1)}</div>
                </div>
              </div>

              {assigned.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {assigned.slice(0, 3).map(f => (
                    <div key={f.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-muted/50">
                      <span className="flex items-center gap-1.5 min-w-0"><Sprout className="size-3 text-primary shrink-0" /><span className="truncate">{f.name}</span></span>
                      <span className="text-muted-foreground flex items-center gap-1 shrink-0"><MapPin className="size-2.5" />{f.region}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
