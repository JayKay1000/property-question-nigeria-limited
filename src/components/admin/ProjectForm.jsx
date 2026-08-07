import { useState } from "react";
import { base44 } from "@/api/base44Client";
import ProjectMediaManager from "./ProjectMediaManager";
import ProjectDocumentUploader from "./ProjectDocumentUploader";
import YoutubeLinksInput from "@/components/media/YoutubeLinksInput";
import PanoramaUploader from "@/components/media/PanoramaUploader";
import ProjectLocationMap from "./projects/ProjectLocationMap";

const STATUS_OPTIONS = [
  "draft",
  "planning",
  "survey_completed",
  "approval_pending",
  "infrastructure_development",
  "construction",
  "selling",
  "allocation",
  "handover",
  "completed",
  "suspended",
  "cancelled",
  "archived",
];

const DEVELOPMENT_STAGE_OPTIONS = [
  "land_only",
  "survey",
  "layout_approval",
  "infrastructure",
  "construction",
  "selling",
  "handover",
  "completed",
  "off_plan",
];

const VISIBILITY_OPTIONS = ["public", "private", "internal", "agents_only"];

const PROJECT_TYPE_OPTIONS = [
  "residential_estate",
  "commercial_estate",
  "mixed_use_estate",
  "industrial_park",
  "agricultural_land",
  "other",
];

// Fields are named to match the Project entity schema exactly so that
// base44.entities.Project.create()/.update() persist correctly.
const emptyForm = {
  name: "",
  short_description: "",
  description: "",
  project_type: "",
  project_category: "",
  status: "draft",
  development_stage: "",
  visibility: "public",
  is_featured: false,
  location_state: "",
  location_lga: "",
  location_city: "",
  location_address: "",
  total_land_area_sqm: "",
  total_units: "",
  units_available: "",
  budget_ngn: "",
  launch_date: "",
  start_date: "",
  estimated_completion_date: "",
  google_maps_link: "",
  latitude: "",
  longitude: "",
  seo_title: "",
  seo_description: "",
  meta_keywords: "",
  project_manager_name: "",
  developer_name: "",
  video_urls: [],
  tour_360_urls: [],
};

function buildFormFromProject(project) {
  if (!project) return { ...emptyForm };
  const merged = { ...emptyForm };
  Object.keys(merged).forEach((key) => {
    if (project[key] !== undefined && project[key] !== null) {
      merged[key] = project[key];
    }
  });
  return merged;
}

// Converts empty-string numeric fields to null and casts the rest to Number
// so we don't send "" (invalid) to number-typed columns in base44.
const NUMBER_FIELDS = [
  "total_land_area_sqm",
  "total_units",
  "units_available",
  "budget_ngn",
  "latitude",
  "longitude",
];

function normalizeForSave(form) {
  const payload = { ...form };
  NUMBER_FIELDS.forEach((key) => {
    payload[key] = payload[key] === "" ? null : Number(payload[key]);
  });
  return payload;
}

function isVideoFile(file) {
  return file.type.includes("video");
}

export default function ProjectForm({ project, close, saved }) {
  const [currentProject, setCurrentProject] = useState(project);
  const [form, setForm] = useState(buildFormFromProject(project));
  const [saving, setSaving] = useState(false);

  // Images/videos picked before the project has been saved yet.
  // They are uploaded right after the project record is created/updated,
  // so the user can fill fields and attach media on the same page/step.
  const [pendingMedia, setPendingMedia] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickMedia = (e) => {
    const files = Array.from(e.target.files || []);
    const withPreview = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isVideo: isVideoFile(file),
    }));
    setPendingMedia((prev) => [...prev, ...withPreview]);
    // allow picking the same file again later
    e.target.value = "";
  };

  const removePendingMedia = (index) => {
    setPendingMedia((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].previewUrl);
      next.splice(index, 1);
      return next;
    });
  };

  const uploadPendingMedia = async (projectId) => {
    if (!pendingMedia.length) return;

    setUploadingMedia(true);
    try {
      for (const item of pendingMedia) {
        const uploaded = await base44.integrations.Core.UploadFile({
          file: item.file,
        });

        if (!uploaded?.file_url) {
          throw new Error(`Upload failed for ${item.file.name}`);
        }

        await base44.entities.ProjectMedia.create({
          project_id: projectId,
          media_url: uploaded.file_url,
          media_type: item.isVideo ? "video" : "image",
          title: item.file.name,
          visibility: "public",
        });
      }

      pendingMedia.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingMedia([]);
    } finally {
      setUploadingMedia(false);
    }
  };

  const saveProject = async () => {
    if (!form.name.trim()) {
      alert("Project name is required");
      return;
    }
    if (!form.project_type) {
      alert("Project type is required");
      return;
    }

    setSaving(true);
    try {
      const payload = normalizeForSave(form);
      let result;

      if (currentProject) {
        result = await base44.entities.Project.update(
          currentProject.id,
          payload
        );
      } else {
        result = await base44.entities.Project.create(payload);
      }

      setCurrentProject(result);

      // Upload any images/videos picked while filling out the form.
      await uploadPendingMedia(result.id);

      alert("Project saved successfully");
      saved();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          {project ? "Modify Project" : "Create Project"}
        </h2>
        {close && (
          <button
            type="button"
            onClick={close}
            className="text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        )}
      </div>

      {/* ---------- Basic details ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">Basic Details</h3>

      <input
        className="border p-3 w-full mb-3"
        placeholder="Project Name *"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
      />

      <input
        className="border p-3 w-full mb-3"
        placeholder="Short Description (for cards/previews)"
        value={form.short_description}
        onChange={(e) => updateField("short_description", e.target.value)}
      />

      <textarea
        className="border p-3 w-full mb-3"
        placeholder="Detailed Description"
        rows="8"
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <select
          className="border p-3 w-full"
          value={form.project_type}
          onChange={(e) => updateField("project_type", e.target.value)}
        >
          <option value="">Project Type *</option>
          {PROJECT_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <input
          className="border p-3 w-full"
          placeholder="Project Category"
          value={form.project_category}
          onChange={(e) => updateField("project_category", e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <select
          className="border p-3 w-full"
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <select
          className="border p-3 w-full"
          value={form.development_stage}
          onChange={(e) => updateField("development_stage", e.target.value)}
        >
          <option value="">Development Stage</option>
          {DEVELOPMENT_STAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-5 items-center">
        <select
          className="border p-3 w-full"
          value={form.visibility}
          onChange={(e) => updateField("visibility", e.target.value)}
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => updateField("is_featured", e.target.checked)}
          />
          Feature this project on the homepage
        </label>
      </div>

      {/* ---------- Location ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">Location</h3>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input
          className="border p-3 w-full"
          placeholder="State"
          value={form.location_state}
          onChange={(e) => updateField("location_state", e.target.value)}
        />
        <input
          className="border p-3 w-full"
          placeholder="LGA"
          value={form.location_lga}
          onChange={(e) => updateField("location_lga", e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input
          className="border p-3 w-full"
          placeholder="City"
          value={form.location_city}
          onChange={(e) => updateField("location_city", e.target.value)}
        />
        <input
          className="border p-3 w-full"
          placeholder="Street Address"
          value={form.location_address}
          onChange={(e) => updateField("location_address", e.target.value)}
        />
      </div>

      <input
        className="border p-3 w-full mb-3"
        placeholder="Google Maps Link"
        value={form.google_maps_link}
        onChange={(e) => updateField("google_maps_link", e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input
          type="number"
          step="any"
          className="border p-3 w-full"
          placeholder="Latitude"
          value={form.latitude}
          onChange={(e) => updateField("latitude", e.target.value)}
        />
        <input
          type="number"
          step="any"
          className="border p-3 w-full"
          placeholder="Longitude"
          value={form.longitude}
          onChange={(e) => updateField("longitude", e.target.value)}
        />
      </div>

      <div className="mb-5">
        <ProjectLocationMap
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={(lat, lng) => {
            updateField("latitude", Number(lat.toFixed(6)));
            updateField("longitude", Number(lng.toFixed(6)));
          }}
        />
      </div>

      {/* ---------- Size, units & budget ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">
        Size, Units &amp; Budget
      </h3>

      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <input
          type="number"
          className="border p-3 w-full"
          placeholder="Total Land Area (sqm)"
          value={form.total_land_area_sqm}
          onChange={(e) =>
            updateField("total_land_area_sqm", e.target.value)
          }
        />
        <input
          type="number"
          className="border p-3 w-full"
          placeholder="Budget (NGN)"
          value={form.budget_ngn}
          onChange={(e) => updateField("budget_ngn", e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <input
          type="number"
          className="border p-3 w-full"
          placeholder="Total Units"
          value={form.total_units}
          onChange={(e) => updateField("total_units", e.target.value)}
        />
        <input
          type="number"
          className="border p-3 w-full"
          placeholder="Units Available"
          value={form.units_available}
          onChange={(e) => updateField("units_available", e.target.value)}
        />
      </div>

      {/* ---------- Timeline ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">Timeline</h3>

      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <label className="text-sm text-gray-600">
          Launch Date
          <input
            type="date"
            className="border p-3 w-full mt-1"
            value={form.launch_date}
            onChange={(e) => updateField("launch_date", e.target.value)}
          />
        </label>
        <label className="text-sm text-gray-600">
          Start Date
          <input
            type="date"
            className="border p-3 w-full mt-1"
            value={form.start_date}
            onChange={(e) => updateField("start_date", e.target.value)}
          />
        </label>
        <label className="text-sm text-gray-600">
          Estimated Completion
          <input
            type="date"
            className="border p-3 w-full mt-1"
            value={form.estimated_completion_date}
            onChange={(e) =>
              updateField("estimated_completion_date", e.target.value)
            }
          />
        </label>
      </div>

      {/* ---------- People ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">People</h3>

      <div className="grid md:grid-cols-2 gap-3 mb-5">
        <input
          className="border p-3 w-full"
          placeholder="Project Manager Name"
          value={form.project_manager_name}
          onChange={(e) =>
            updateField("project_manager_name", e.target.value)
          }
        />
        <input
          className="border p-3 w-full"
          placeholder="Developer Name"
          value={form.developer_name}
          onChange={(e) => updateField("developer_name", e.target.value)}
        />
      </div>

      {/* ---------- SEO ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">SEO</h3>

      <input
        className="border p-3 w-full mb-3"
        placeholder="SEO Title"
        value={form.seo_title}
        onChange={(e) => updateField("seo_title", e.target.value)}
      />
      <textarea
        className="border p-3 w-full mb-3"
        rows="3"
        placeholder="SEO Description"
        value={form.seo_description}
        onChange={(e) => updateField("seo_description", e.target.value)}
      />
      <input
        className="border p-3 w-full mb-5"
        placeholder="Meta Keywords (comma separated)"
        value={form.meta_keywords}
        onChange={(e) => updateField("meta_keywords", e.target.value)}
      />

      {/* ---------- Images / Videos (same page, before or after saving) ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">Images &amp; Videos</h3>

      <div className="border border-dashed rounded p-5 mb-5">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handlePickMedia}
        />
        <p className="text-xs text-gray-500 mt-2">
          Pick images/videos now — they'll upload automatically when you hit
          "Save Project" below, no need to save first.
        </p>

        {pendingMedia.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {pendingMedia.map((item, index) => (
              <div key={index} className="relative border rounded overflow-hidden">
                {item.isVideo ? (
                  <video src={item.previewUrl} className="w-full h-28 object-cover" />
                ) : (
                  <img
                    src={item.previewUrl}
                    className="w-full h-28 object-cover"
                    alt={item.file.name}
                  />
                )}
                <button
                  type="button"
                  onClick={() => removePendingMedia(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- 360° Tour & YouTube links ---------- */}
      <h3 className="font-semibold text-gray-700 mb-2">360° Tour &amp; YouTube Links</h3>

      <div className="border border-dashed rounded p-5 mb-5 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            360° Virtual Tour (equirectangular panoramas)
          </label>
          <PanoramaUploader
            value={form.tour_360_urls || []}
            onChange={(v) => updateField("tour_360_urls", v)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            YouTube Video Links
          </label>
          <YoutubeLinksInput
            value={form.video_urls || []}
            onChange={(v) => updateField("video_urls", v)}
          />
        </div>
      </div>

      <button
        onClick={saveProject}
        disabled={saving || uploadingMedia}
        className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-60"
      >
        {saving
          ? "Saving..."
          : uploadingMedia
          ? "Uploading media..."
          : "Save Project"}
      </button>

      {/* Already-saved media & documents (visible once the project exists) */}
      {currentProject && (
        <>
          <ProjectMediaManager projectId={currentProject.id} />
          <ProjectDocumentUploader projectId={currentProject.id} />
        </>
      )}
    </div>
  );
}