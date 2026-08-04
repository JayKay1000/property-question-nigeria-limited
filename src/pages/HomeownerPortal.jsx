import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function HomeownerPortal() {
  const [form, setForm] = useState({
    property_title: "",
    property_address: "",
    description: "",
    preferred_price: "",
    owner_phone: "",
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadFiles = async (fileList) => {
    const urls = [];
    for (const file of fileList) {
      const result = await base44.integrations.Core.UploadFile({ file });
      urls.push(result.file_url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.property_title || !form.property_address || !form.description || !form.preferred_price) {
      setError("Please fill in all required fields.");
      return;
    }

    setUploading(true);
    try {
      const [photo_urls, video_urls, document_urls] = await Promise.all([
        uploadFiles(photos),
        uploadFiles(videos),
        uploadFiles(documents),
      ]);

      await base44.entities.PropertyListing.create({
        ...form,
        preferred_price: parseFloat(form.preferred_price),
        photo_urls,
        video_urls,
        document_urls,
        status: "submitted",
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong submitting your property. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-semibold">Thank you!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your property has been submitted to Property Question Nigeria Limited for review.
          Our admin team will reach out with further instructions, including the Power of Attorney process.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">List Your Property</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          These details are sent privately to our admin team for review. They are never displayed publicly.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium">Property Title *</label>
        <input
          name="property_title"
          value={form.property_title}
          onChange={handleChange}
          className="mt-1 w-full border rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Property Address *</label>
        <input
          name="property_address"
          value={form.property_address}
          onChange={handleChange}
          className="mt-1 w-full border rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          className="mt-1 w-full border rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Preferred Selling Price (NGN) *</label>
        <input
          type="number"
          name="preferred_price"
          value={form.preferred_price}
          onChange={handleChange}
          className="mt-1 w-full border rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Phone Number</label>
        <input
          name="owner_phone"
          value={form.owner_phone}
          onChange={handleChange}
          className="mt-1 w-full border rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files))}
          className="mt-1 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Videos</label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setVideos(Array.from(e.target.files))}
          className="mt-1 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Documents (title deed, survey plan, etc.)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          multiple
          onChange={(e) => setDocuments(Array.from(e.target.files))}
          className="mt-1 w-full"
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-black text-white rounded-md py-3 font-medium disabled:opacity-50"
      >
        {uploading ? "Submitting..." : "Submit Property for Review"}
      </button>
    </form>
  );
}
