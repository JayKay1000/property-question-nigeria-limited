import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Search, Loader2, RefreshCw, Users, ShieldCheck, Clock, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import AgentKanbanCard from "./AgentKanbanCard";
import AgentReviewSheet from "./AgentReviewSheet";

const COLUMNS = [
  { id: "pending", title: "Pending", tone: "amber", icon: Users, status: "pending", vstatus: "pending" },
  { id: "under_review", title: "Under Review", tone: "sky", icon: Clock, status: "under_review", vstatus: "pending" },
  { id: "verified", title: "Verified", tone: "emerald", icon: ShieldCheck, status: "active", vstatus: "verified" },
  { id: "rejected", title: "Rejected", tone: "rose", icon: XCircle, status: "inactive", vstatus: "rejected" },
];

const COLUMN_TONE = {
  amber: { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700", header: "text-amber-700" },
  sky: { bar: "bg-sky-500", chip: "bg-sky-100 text-sky-700", header: "text-sky-700" },
  emerald: { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700", header: "text-emerald-700" },
  rose: { bar: "bg-rose-500", chip: "bg-rose-100 text-rose-700", header: "text-rose-700" },
};

function agentColumn(agent) {
  if (agent.verification_status === "verified") return "verified";
  if (agent.verification_status === "rejected") return "rejected";
  if (agent.status === "under_review") return "under_review";
  return "pending";
}

export default function AgentVerificationBoard() {
  const [agents, setAgents] = useState([]);
  const [docsByAgent, setDocsByAgent] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agentList, docList] = await Promise.all([
        base44.entities.Agent.filter({}, "-created_date", 200).catch(() => []),
        base44.entities.AgentDocument.filter({}, "-created_date", 400).catch(() => []),
      ]);
      setAgents(Array.isArray(agentList) ? agentList : []);
      const grouped = {};
      (Array.isArray(docList) ? docList : []).forEach((d) => {
        if (!d.agent_id) return;
        (grouped[d.agent_id] = grouped[d.agent_id] || []).push(d);
      });
      setDocsByAgent(grouped);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        (a.full_name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        (a.phone || "").toLowerCase().includes(q) ||
        (a.resident_state || "").toLowerCase().includes(q) ||
        (a.specialization || "").toLowerCase().includes(q)
    );
  }, [agents, search]);

  const grouped = useMemo(() => {
    const map = { pending: [], under_review: [], verified: [], rejected: [] };
    filtered.forEach((a) => map[agentColumn(a)].push(a));
    return map;
  }, [filtered]);

  const stats = useMemo(
    () => ({
      pending: grouped.pending.length,
      under_review: grouped.under_review.length,
      verified: grouped.verified.length,
      rejected: grouped.rejected.length,
    }),
    [grouped]
  );

  const updateAgentStatus = async (agentId, columnId) => {
    const col = COLUMNS.find((c) => c.id === columnId);
    if (!col) return;
    const target = agents.find((a) => a.id === agentId);
    if (!target) return;
    // No-op if already in that column
    if (agentColumn(target) === columnId) return;

    // Optimistic update
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, status: col.status, verification_status: col.vstatus } : a
      )
    );

    try {
      const me = await base44.auth.me().catch(() => null);
      const payload = { status: col.status, verification_status: col.vstatus, verified_at: new Date().toISOString() };
      if (me?.id) payload.verified_by = me.id;
      if (col.vstatus === "verified" && !target.agent_code) {
        payload.agent_code = `PQ-AGT-${Date.now().toString().slice(-6)}`;
      }
      await base44.entities.Agent.update(agentId, payload);
    } catch (err) {
      console.error("Move failed:", err);
      // Revert on failure
      setAgents((prev) => prev.map((a) => (a.id === agentId ? target : a)));
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    updateAgentStatus(draggableId, destination.droppableId);
  };

  const handleDecided = () => {
    setSelected(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      {/* Header + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Agent Verification Board</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Review applications, verify documents, and approve agents by dragging cards across stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, state…"
              className="h-9 w-56 pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setRefreshKey((k) => k + 1)} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COLUMNS.map((c) => {
          const Icon = c.icon;
          const tone = COLUMN_TONE[c.tone];
          return (
            <div key={c.id} className="rounded-xl border border-border bg-card p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{c.title}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.chip}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="mt-1.5 font-heading text-2xl font-bold text-foreground">{stats[c.id]}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading agents…
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const tone = COLUMN_TONE[col.tone];
              const items = grouped[col.id];
              return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex w-80 shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors ${
                        snapshot.isDraggingOver ? "border-flame-400 bg-flame-50/40" : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${tone.bar}`} />
                          <h3 className={`text-sm font-semibold ${tone.header}`}>{col.title}</h3>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone.chip}`}>{items.length}</span>
                      </div>
                      <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5" style={{ minHeight: 120, maxHeight: "calc(100vh - 320px)" }}>
                        {items.length === 0 ? (
                          <p className="py-8 text-center text-xs text-muted-foreground">No agents here.</p>
                        ) : (
                          items.map((agent, idx) => (
                            <AgentKanbanCard
                              key={agent.id}
                              agent={agent}
                              index={idx}
                              docTypes={(docsByAgent[agent.id] || []).map((d) => d.document_type)}
                              onOpen={setSelected}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <AgentReviewSheet
        agent={selected}
        docs={selected ? docsByAgent[selected.id] || [] : []}
        open={!!selected}
        onClose={() => setSelected(null)}
        onDecided={handleDecided}
      />
    </div>
  );
}