import { useState } from "react";
import { base44 } from "@/api/base44Client";

const isPdf = (file) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export default function ProjectMediaUploader({ projectId, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!files.length) {
      alert("Please select files");
      return;
    }

    setUploading(true);
    try {
      let featuredSet = false;

      for (const file of files) {
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        if (!uploaded?.file_url) {
          throw new Error("Upload failed for " + file.name);
        }

        const pdf = isPdf(file);
        const isVideo = file.type.includes("video");
        const mediaType = pdf ? "brochure" : isVideo ? "video" : "image";

        await base44.entities.ProjectMedia.create({
          project_id: projectId,
          media_url: uploaded.file_url,
          media_type: mediaType,
          title: file.name,
          visibility: "public",
        });

        // Re-fetch the live project so a value already set in this session
        // (or elsewhere) isn't overwritten by later files in the same batch.
        const live = await base44.entities.Project.get(projectId);

        // First image becomes the project's display (featured) picture.
        if (!isVideo && !pdf && !featuredSet) {
          if (!live?.featured_image_url) {
            await base44.entities.Project.update(projectId, {
              featured_image_url: uploaded.file_url,
            });
            featuredSet = true;
          }
        }

        // First brochure becomes the project's downloadable brochure PDF.
        if (pdf && !live?.brochure_url) {
          await base44.entities.Project.update(projectId, {
            brochure_url: uploaded.file_url,
          });
        }
      }

      alert("Files uploaded successfully");
      setFiles([]);
      onUploaded?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-5 rounded mt-5">
      <h3 className="font-bold mb-3">Upload Project Images / Videos / Brochure (PDF)</h3>
      <input
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button
        disabled={uploading}
        onClick={upload}
        className="bg-orange-600 text-white px-4 py-2 mt-3 rounded"
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
      <p className="mt-2 text-xs text-muted-foreground">
        The first image sets the project's display picture; the first PDF sets the downloadable brochure.
      </p>
    </div>
  );
}