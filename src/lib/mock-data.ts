export type Stage = "planted" | "growing" | "ready" | "harvested";
export type Status = "active" | "at_risk" | "completed";

export interface Agent {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "agent";
}

export interface Field {
  id: number;
  name: string;
  crop_type: string;
  planting_date: string;
  stage: Stage;
  status: Status;
  assigned_to: Agent | null;
  created_at: string;
  hectares: number;
  region: string;
}

export interface FieldUpdate {
  id: number;
  field: { id: number; name: string };
  agent: Agent;
  stage: Stage;
  notes: string;
  created_at: string;
}

export const agents: Agent[] = [
  { id: 2, email: "alice@smartseason.com", username: "alice", first_name: "Alice", last_name: "Mwangi", role: "agent" },
  { id: 3, email: "bob@smartseason.com", username: "bob", first_name: "Bob", last_name: "Otieno", role: "agent" },
  { id: 4, email: "carol@smartseason.com", username: "carol", first_name: "Carol", last_name: "Kamau", role: "agent" },
  { id: 5, email: "david@smartseason.com", username: "david", first_name: "David", last_name: "Njoroge", role: "agent" },
];

export const fields: Field[] = [
  { id: 1, name: "North Maize Plot", crop_type: "Maize", planting_date: "2026-02-17", stage: "growing", status: "active", assigned_to: agents[0], created_at: "2026-02-17", hectares: 24.5, region: "Nakuru" },
  { id: 2, name: "Riverside Wheat", crop_type: "Wheat", planting_date: "2026-01-10", stage: "ready", status: "active", assigned_to: agents[1], created_at: "2026-01-10", hectares: 18.2, region: "Narok" },
  { id: 3, name: "Eastview Sorghum", crop_type: "Sorghum", planting_date: "2026-03-05", stage: "planted", status: "at_risk", assigned_to: agents[0], created_at: "2026-03-05", hectares: 12.8, region: "Machakos" },
  { id: 4, name: "Highland Barley", crop_type: "Barley", planting_date: "2026-02-22", stage: "growing", status: "active", assigned_to: agents[2], created_at: "2026-02-22", hectares: 30.1, region: "Eldoret" },
  { id: 5, name: "Sunrise Soybean", crop_type: "Soybean", planting_date: "2025-11-15", stage: "harvested", status: "completed", assigned_to: agents[1], created_at: "2025-11-15", hectares: 22.0, region: "Kitale" },
  { id: 6, name: "Valley Cassava", crop_type: "Cassava", planting_date: "2026-03-28", stage: "planted", status: "active", assigned_to: null, created_at: "2026-03-28", hectares: 15.5, region: "Kisumu" },
  { id: 7, name: "Westgate Rice Paddy", crop_type: "Rice", planting_date: "2026-02-01", stage: "ready", status: "at_risk", assigned_to: agents[3], created_at: "2026-02-01", hectares: 28.7, region: "Mwea" },
  { id: 8, name: "South Hill Coffee", crop_type: "Coffee", planting_date: "2026-01-20", stage: "growing", status: "active", assigned_to: agents[2], created_at: "2026-01-20", hectares: 9.4, region: "Nyeri" },
];

export const updates: FieldUpdate[] = [
  { id: 6, field: { id: 1, name: "North Maize Plot" }, agent: agents[0], stage: "growing", notes: "Germination complete, uniform stand established across 95% of plot.", created_at: "2026-04-20T09:00:00Z" },
  { id: 5, field: { id: 2, name: "Riverside Wheat" }, agent: agents[1], stage: "ready", notes: "Grain heads fully formed. Harvest window begins next week.", created_at: "2026-04-19T14:32:00Z" },
  { id: 4, field: { id: 7, name: "Westgate Rice Paddy" }, agent: agents[3], stage: "ready", notes: "Water levels reduced. Ready for mechanical harvest.", created_at: "2026-04-18T11:15:00Z" },
  { id: 3, field: { id: 4, name: "Highland Barley" }, agent: agents[2], stage: "growing", notes: "Tillering phase progressing well. Applied second nitrogen top-dressing.", created_at: "2026-04-17T08:45:00Z" },
  { id: 2, field: { id: 5, name: "Sunrise Soybean" }, agent: agents[1], stage: "harvested", notes: "Final yield: 2.8 t/ha. Storage logistics complete.", created_at: "2026-04-15T16:20:00Z" },
  { id: 1, field: { id: 8, name: "South Hill Coffee" }, agent: agents[2], stage: "growing", notes: "Flowering observed. Pest scouting clear.", created_at: "2026-04-14T10:00:00Z" },
];

export const dashboardSummary = {
  total_fields: fields.length,
  total_agents: agents.length,
  status_breakdown: {
    active: fields.filter(f => f.status === "active").length,
    at_risk: fields.filter(f => f.status === "at_risk").length,
    completed: fields.filter(f => f.status === "completed").length,
  },
  stage_breakdown: {
    planted: fields.filter(f => f.stage === "planted").length,
    growing: fields.filter(f => f.stage === "growing").length,
    ready: fields.filter(f => f.stage === "ready").length,
    harvested: fields.filter(f => f.stage === "harvested").length,
  },
  unassigned_fields: fields.filter(f => !f.assigned_to).length,
  fields_updated_today: 2,
  total_hectares: fields.reduce((s, f) => s + f.hectares, 0),
};
