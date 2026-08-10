import { useState } from "react";
import { base44 } from "@/api/base44Client";

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

        const isVideo = file.type.includes("video");
        await base44.entities.ProjectMedia.create({
          project_id: projectId,
          media_url: uploaded.file_url,
          media_type: isVideo ? "video" : "image",
          title: file.name,
          visibility: "public",
        });

        // The first image uploaded becomes the project's display (featured)
        // picture. We re-fetch the live project so that subsequent uploads
        // in this same session don't override an already-set display picture.
        if (!isVideo && !featuredSet) {
          const live = await base44.entities.Project.get(projectId);
          if (!live?.featured_image_url) {
            await base44.entities.Project.update(projectId, {
              featured_image_url: uploaded.file_url,
            });
            featuredSet = true;
          }
        }
      }

      alert("Images/videos uploaded successfully");
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
      <h3 className="font-bold mb-3">Upload Project Images / Videos</h3>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <button
        disabled={uploading}
        onClick={upload}
        className="bg-orange-600 text-white px-4 py-2 mt-3 rounded"
      >
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
    </div>
  );
}