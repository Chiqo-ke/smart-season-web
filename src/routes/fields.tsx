import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, StageBadge } from "@/components/StatusBadge";
import { fieldsApi, dashboardApi, type Field, type Stage, type ReportRating } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Plus, Filter, Search, Calendar, ArrowRight, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/fields")({
  head: () => ({
    meta: [
      { title: "Fields â€” SmartSeason" },
      { name: "description", content: "Manage and monitor all agricultural fields, crop stages, and assignments." },
    ],
  }),
  component: FieldsPage,
});

const NEXT_STAGE: Record<Stage, Stage | null> = {
  planted: "growing",
  growing: "ready",
  ready: "harvested",
  harvested: null,
};

// â”€â”€ New Field Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const newFieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  crop_type: z.string().min(1, "Crop type is required"),
  planting_date: z.string().min(1, "Planting date is required"),
});
type NewFieldValues = z.infer<typeof newFieldSchema>;

function NewFieldDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<NewFieldValues>({
    resolver: zodResolver(newFieldSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: NewFieldValues) => fieldsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Field created");
      reset();
      onClose();
    },
    onError: () => toast.error("Failed to create field"),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>New Field</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Field name</Label>
            <Input id="name" {...register("name")} placeholder="e.g. North Paddock" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="crop_type">Crop type</Label>
            <Input id="crop_type" {...register("crop_type")} placeholder="e.g. Maize" />
            {errors.crop_type && <p className="text-xs text-destructive">{errors.crop_type.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="planting_date">Planting date</Label>
            <Input id="planting_date" type="date" {...register("planting_date")} />
            {errors.planting_date && <p className="text-xs text-destructive">{errors.planting_date.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creatingâ€¦" : "Create Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// â”€â”€ Assign Agent Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AssignAgentDialog({ field, onClose }: { field: Field; onClose: () => void }) {
  const qc = useQueryClient();
  const [agentId, setAgentId] = useState<string>("");
  const { data: agents } = useQuery({ queryKey: ["dashboard-agents"], queryFn: () => dashboardApi.agents() });
  const mutation = useMutation({
    mutationFn: (id: number) => fieldsApi.assign(field.id, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Agent assigned");
      onClose();
    },
    onError: () => toast.error("Failed to assign agent"),
  });

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign Agent â€” {field.name}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
              <SelectContent>
                {agents?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.first_name} {a.last_name} ({a.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button disabled={!agentId || mutation.isPending} onClick={() => mutation.mutate(Number(agentId))}>
              {mutation.isPending ? "Assigningâ€¦" : "Assign"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// â”€â”€ Update Stage Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stageSchema = z.object({ notes: z.string().min(1, "Notes are required") });
type StageValues = z.infer<typeof stageSchema>;

function UpdateStageDialog({ field, onClose }: { field: Field; onClose: () => void }) {
  const qc = useQueryClient();
  const nextStage = NEXT_STAGE[field.stage];
  const { register, handleSubmit, formState: { errors } } = useForm<StageValues>({ resolver: zodResolver(stageSchema) });
  const mutation = useMutation({
    mutationFn: (data: StageValues) => fieldsApi.updateStage(field.id, { notes: data.notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["updates"] });
      toast.success("Stage updated");
      onClose();
    },
    onError: () => toast.error("Failed to update stage"),
  });

  if (!nextStage) return null;

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stage â€” {field.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Advance from <strong>{field.stage}</strong> â†’ <strong>{nextStage}</strong>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Describe the current field conditionâ€¦" rows={3} />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updatingâ€¦" : `Advance to ${nextStage}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Submit Report Dialog ─────────────────────────────────────────────────────
const reportSchema = z.object({
  rating: z.enum(["good", "needs_attention", "critical"], { required_error: "Rating is required" }),
  notes: z.string().optional().default(""),
});
type ReportValues = z.infer<typeof reportSchema>;

function SubmitReportDialog({ field, onClose }: { field: Field; onClose: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { notes: "" },
  });
  const rating = watch("rating");
  const mutation = useMutation({
    mutationFn: (data: ReportValues) =>
      fieldsApi.submitReport(field.id, { rating: data.rating as ReportRating, notes: data.notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fields"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Report submitted");
      onClose();
    },
    onError: () => toast.error("Failed to submit report"),
  });

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Field Report — {field.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Condition Rating</Label>
            <Select value={rating} onValueChange={(v) => setValue("rating", v as ReportRating)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rating…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">Good — Progressing well</SelectItem>
                <SelectItem value="needs_attention">Needs Attention — Some concerns</SelectItem>
                <SelectItem value="critical">Critical — Immediate action required</SelectItem>
              </SelectContent>
            </Select>
            {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-notes">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="report-notes"
              {...register("notes")}
              placeholder="Any observations or concerns about this field…"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !rating}>
              {mutation.isPending ? "Submitting…" : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// â”€â”€ Fields Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FieldsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [q, setQ] = useState("");
  
  // Filter states
  const [stageFilter, setStageFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [atRiskFilter, setAtRiskFilter] = useState(false);

  const [showNewField, setShowNewField] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Field | null>(null);
  const [stageTarget, setStageTarget] = useState<Field | null>(null);
  const [reportTarget, setReportTarget] = useState<Field | null>(null);

  const { data: fieldsPage, isLoading } = useQuery({
    queryKey: ["fields"],
    queryFn: () => fieldsApi.list(),
  });

  const allFields = fieldsPage?.results ?? [];
  const filtered = allFields.filter((f) => {
    const matchesQuery = f.name.toLowerCase().includes(q.toLowerCase()) || f.crop_type.toLowerCase().includes(q.toLowerCase());
    const matchesStage = stageFilter === "all" || f.stage === stageFilter;
    const matchesRisk = !atRiskFilter || f.status === "at_risk";
    const matchesDate = !dateFilter || f.planting_date.startsWith(dateFilter);
    
    return matchesQuery && matchesStage && matchesRisk && matchesDate;
  });

  return (
    <Layout
      title="Fields"
      subtitle={isLoading ? "Loading fieldsâ€¦" : `${allFields.length} fields under management`}
      actions={
        isAdmin ? (
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowNewField(true)}>
            <Plus className="size-4 mr-1" /> New Field
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name or crop..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"><Filter className="size-4 mr-2" />Filters</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filter Fields</h4>
              <div className="space-y-2">
                <Label>Farm Stage</Label>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger><SelectValue placeholder="All Stages" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="planted">Planted</SelectItem>
                    <SelectItem value="growing">Growing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="harvested">Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Planted</Label>
                <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="at-risk" checked={atRiskFilter} onCheckedChange={(c) => setAtRiskFilter(!!c)} />
                <Label htmlFor="at-risk" className="text-sm font-normal">Show only "At Risk" fields</Label>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => {
                setStageFilter("all");
                setDateFilter("");
                setAtRiskFilter(false);
              }}>Clear Filters</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 border-border/60"><Skeleton className="h-40 w-full" /></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f) => {
            const stages = ["planted", "growing", "ready", "harvested"] as const;
            const idx = stages.indexOf(f.stage);
            const canAdvance = NEXT_STAGE[f.stage] !== null;
            return (
              <Card key={f.id} className="p-5 border-border/60 hover:shadow-(--shadow-glow) hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold tracking-tight truncate mb-1">{f.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      Planted {new Date(f.planting_date).toLocaleDateString()}
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
                    {stages.map((s, i) => {
                      // Define stage colors
                      const stageColors: Record<string, string> = {
                        planted: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
                        growing: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
                        ready: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
                        harvested: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]",
                      };
                      const textColors: Record<string, string> = {
                        planted: "text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]",
                        growing: "text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]",
                        ready: "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]",
                        harvested: "text-purple-500 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]",
                      };
                      
                      const isCurrent = i === idx;
                      const isPast = i < idx;
                      
                      return (
                      <div key={s} className="flex-1">
                        <div className={`h-1.5 rounded-full ${isPast ? "bg-primary" : isCurrent ? stageColors[s] : "bg-muted"}`} />
                        <div className={`text-[9px] uppercase tracking-wider mt-1.5 text-center ${isCurrent ? textColors[s] + " font-semibold" : "text-muted-foreground"}`}>{s}</div>
                      </div>
                    )})}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border gap-2 flex-wrap">
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
                  <div className="flex gap-1.5 shrink-0">
                    {isAdmin && (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => setAssignTarget(f)}>
                        Assign
                      </Button>
                    )}
                    {f.assigned_to !== null && (
                      <Button
                        variant={f.status === "at_risk" ? "destructive" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setReportTarget(f)}
                      >
                        <ClipboardList className="size-3 mr-1" />
                        Report
                      </Button>
                    )}
                    {canAdvance && (
                      <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => setStageTarget(f)}>
                        Advance <ArrowRight className="size-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showNewField && <NewFieldDialog open={showNewField} onClose={() => setShowNewField(false)} />}
      {assignTarget && <AssignAgentDialog field={assignTarget} onClose={() => setAssignTarget(null)} />}
      {stageTarget && <UpdateStageDialog field={stageTarget} onClose={() => setStageTarget(null)} />}
      {reportTarget && <SubmitReportDialog field={reportTarget} onClose={() => setReportTarget(null)} />}
    </Layout>
  );
}
