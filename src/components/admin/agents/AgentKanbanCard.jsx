import React from "react";
import { Mail, Phone, MapPin, Briefcase, FileCheck, FileWarning, Clock } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

const REQUIRED_DOCS = ["passport_photograph", "government_id", "utility_bill", "proof_of_address", "selfie_with_id"];

export default function AgentKanbanCard({ agent, index, docTypes = [], onOpen }) {
  const uploaded = new Set(docTypes);
  const complete = REQUIRED_DOCS.filter((d) => uploaded.has(d)).length;
  const total = REQUIRED_DOCS.length;
  const allComplete = complete === total;

  return (
    <Draggable draggableId={agent.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(agent)}
          className={`cursor-pointer rounded-xl border border-border bg-card p-3.5 shadow-card transition-shadow hover:shadow-card-hover ${
            snapshot.isDragging ? "ring-2 ring-flame-400 shadow-premium" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-brand-100">
              {agent.photo_url ? (
                <img src={agent.photo_url} alt={agent.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base font-bold text-brand-700">
                  {agent.full_name?.charAt(0) || "A"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{agent.full_name}</p>
              {agent.agent_code && <p className="text-[11px] text-muted-foreground">{agent.agent_code}</p>}
              {agent.specialization && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Briefcase className="h-3 w-3" /> {agent.specialization}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2.5 space-y-1 text-[11px] text-muted-foreground">
            {agent.email && (
              <p className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{agent.email}</span>
              </p>
            )}
            {agent.phone && (
              <p className="flex items-center gap-1 truncate">
                <Phone className="h-3 w-3 shrink-0" /> {agent.phone}
              </p>
            )}
            {(agent.resident_state || agent.service_areas?.length) && (
              <p className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" /> {agent.resident_state || agent.service_areas?.join(", ")}
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                allComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {allComplete ? <FileCheck className="h-3 w-3" /> : <FileWarning className="h-3 w-3" />}
              {complete}/{total} docs
            </span>
            {agent.status === "under_review" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                <Clock className="h-3 w-3" /> Reviewing
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}