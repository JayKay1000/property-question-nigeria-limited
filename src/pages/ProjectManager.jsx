import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Pencil, Trash2, Film, Building2, MapPin, Layers, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ProjectForm from "@/components/admin/ProjectForm";
import ProjectMediaUploader from "@/components/admin/ProjectMediaUploader";
import ProjectMediaManager from "@/components/admin/ProjectMediaManager";

const STATUS_OPTIONS = [
  "draft", "planning", "survey_completed", "approval_pending",
  "infrastructure_development", "construction", "selling",
  "allocation", "handover", "completed", "suspended", "cancelled", "archived",
];

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-700",
  planning: "bg-blue-100 text-blue-700",
  survey_completed: "bg-cyan-100 text-cyan-700",
  approval_pending: "bg-amber-100 text-amber-700",
  infrastructure_development: "bg-indigo-100 text-indigo-700",
  construction: "bg-violet-100 text-violet-700",
  selling: "bg-flame-100 text-flame-700",
  allocation: "bg-teal-100 text-teal-700",
  handover: "bg-lime-100 text-lime-700",
  completed: "bg-emerald-100 text-emerald-700",
  suspended: "bg-orange-100 text-orange-700",
  cancelled: "bg-rose-100 text-rose-700",
  archived: "bg-slate-200 text-slate-500",
};

const prettify = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>{prettify(status)}</span>;
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </Card>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [mediaProject, setMediaProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Project.list("-created_date", 200);
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      const haystack = [p.name, p.reference_number, p.location_city, p.location_state, p.project_type].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(() => {
    const count = (arr) => arr.length;
    return {
      total: projects.length,
      active: count(projects.filter((p) => ["selling", "construction", "infrastructure_development", "allocation", "handover"].includes(p.status))),
      completed: count(projects.filter((p) => p.status === "completed")),
      planning: count(projects.filter((p) => ["draft", "planning", "approval_pending", "survey_completed"].includes(p.status))),
    };
  }, [projects]);

  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await base44.entities.Project.delete(id);
      await loadProjects();
    } catch (e) {
      window.alert("Failed to delete project: " + (e?.message || e));
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (p) => { setEditingProject(p); setShowForm(true); };
  const openNew = () => { setEditingProject(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingProject(null); };
  const onSaved = () => { closeForm(); loadProjects(); };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-wide section-pad py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Projects Dashboard</h1>
            <p className="text-sm text-muted-foreground">Create, edit, and manage property development projects.</p>
          </div>
          <Button onClick={openNew} className="bg-flame-500 hover:bg-flame-600">
            <Plus className="h-4 w-4" /> Add New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Layers} label="Total Projects" value={stats.total} tone="bg-slate-100 text-slate-700" />
          <StatCard icon={ClipboardList} label="Active" value={stats.active} tone="bg-flame-100 text-flame-700" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="bg-emerald-100 text-emerald-700" />
          <StatCard icon={Building2} label="In Planning" value={stats.planning} tone="bg-blue-100 text-blue-700" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, reference, location, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-56"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{prettify(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-flame-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No projects found. Try adjusting your filters or add a new project.
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <Card key={p.id} className="overflow-hidden flex flex-col hover:shadow-card-hover transition-shadow">
                <div className="relative h-44 bg-muted">
                  {p.featured_image_url ? (
                    <img src={p.featured_image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Building2 className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3"><StatusBadge status={p.status} /></div>
                  {p.is_featured && (
                    <div className="absolute top-3 right-3 bg-flame-500 text-white text-xs font-medium px-2 py-0.5 rounded">Featured</div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.reference_number || "—"}</p>
                  {(p.location_city || p.location_state) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[p.location_city, p.location_state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                    {p.project_type && <span className="rounded bg-slate-100 px-2 py-0.5 capitalize">{prettify(p.project_type)}</span>}
                    {p.total_units ? <span className="rounded bg-slate-100 px-2 py-0.5">{p.total_units} units</span> : null}
                    {p.progress_percentage ? <span className="rounded bg-slate-100 px-2 py-0.5">{p.progress_percentage}% done</span> : null}
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setMediaProject(p)}>
                      <Film className="h-3.5 w-3.5" /> Media
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
                      disabled={deletingId === p.id}
                      onClick={() => deleteProject(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeForm}>
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <ProjectForm project={editingProject} close={closeForm} saved={onSaved} />
            </div>
          </div>
        )}

        {/* Media modal */}
        {mediaProject && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setMediaProject(null)}>
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Manage Media — {mediaProject.name}</h2>
                <Button variant="ghost" size="sm" onClick={() => setMediaProject(null)}>Close</Button>
              </div>
              <ProjectMediaUploader projectId={mediaProject.id} project={mediaProject} onUploaded={loadProjects} />
              <div className="mt-4">
                <ProjectMediaManager projectId={mediaProject.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}