import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, StageBadge } from "@/components/StatusBadge";
import { fields } from "@/lib/mock-data";
import { Plus, Filter, Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/fields")({
  head: () => ({
    meta: [
      { title: "Fields — SmartSeason" },
      { name: "description", content: "Manage and monitor all agricultural fields, crop stages, and assignments." },
    ],
  }),
  component: FieldsPage,
});

function FieldsPage() {
  const [q, setQ] = useState("");
  const filtered = fields.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.crop_type.toLowerCase().includes(q.toLowerCase()));

  return (
    <Layout
      title="Fields"
      subtitle={`${fields.length} fields under management`}
      actions={<Button className="bg-primary hover:bg-primary/90"><Plus className="size-4 mr-1" /> New Field</Button>}
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name or crop..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Button variant="outline"><Filter className="size-4 mr-2" />Filters</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((f) => {
          const stages = ["planted", "growing", "ready", "harvested"] as const;
          const idx = stages.indexOf(f.stage);
          return (
            <Card key={f.id} className="p-5 border-border/60 hover:shadow-[var(--shadow-glow)] hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold tracking-tight truncate">{f.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="size-3" />{f.region}</span>
                    <span>·</span>
                    <span>{f.hectares} ha</span>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">{f.crop_type}</span>
                <StageBadge stage={f.stage} />
              </div>

              {/* Stage progression bar */}
              <div className="mb-4">
                <div className="flex items-center gap-1">
                  {stages.map((s, i) => (
                    <div key={s} className="flex-1">
                      <div className={`h-1.5 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
                      <div className={`text-[9px] uppercase tracking-wider mt-1.5 text-center ${i === idx ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 min-w-0">
                  {f.assigned_to ? (
                    <>
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {f.assigned_to.first_name[0]}{f.assigned_to.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{f.assigned_to.first_name} {f.assigned_to.last_name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="size-2.5" />{new Date(f.planting_date).toLocaleDateString()}</div>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">Unassigned</span>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
