import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { StageBadge } from "@/components/StatusBadge";
import { updates } from "@/lib/mock-data";
import { Clock, Sprout } from "lucide-react";

export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "Update Log — SmartSeason" },
      { name: "description", content: "Immutable audit trail of all field stage transitions and agent updates." },
    ],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  return (
    <Layout
      title="Update Log"
      subtitle="Immutable audit trail of all field stage transitions"
    >
      <Card className="p-6 lg:p-8 border-border/60">
        <div className="relative">
          {/* Timeline rail */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-6">
            {updates.map((u) => (
              <div key={u.id} className="relative flex gap-4">
                <div className="size-10 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center shrink-0 z-10">
                  <Sprout className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{u.field.name}</span>
                    <span className="text-muted-foreground text-xs">advanced to</span>
                    <StageBadge stage={u.stage} />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{u.notes}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-semibold">
                        {u.agent.first_name[0]}{u.agent.last_name[0]}
                      </span>
                      {u.agent.first_name} {u.agent.last_name}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{new Date(u.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Layout>
  );
}
