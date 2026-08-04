import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function AdminPropertyReview() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await base44.entities.PropertyListing.list("-created_date");
    setListings(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    await base44.entities.PropertyListing.update(id, { status });
    if (status === "approved") {
      await publishToPublic(id);
    }
    loadListings();
  };

  const publishToPublic = async (listingId) => {
    const existing = await base44.entities.Property.filter({
      source_listing_id: listingId,
    });
    if (existing.length > 0) return;

    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    await base44.entities.Property.create({
      property_title: listing.property_title,
      property_address: listing.property_address,
      description: listing.description,
      price: listing.preferred_price,
      currency: listing.currency || "NGN",
      photo_urls: listing.photo_urls || [],
      video_urls: listing.video_urls || [],
      source_listing_id: listingId,
    });
  };

  const togglePoaSigned = async (id, current) => {
    await base44.entities.PropertyListing.update(id, { poa_signed: !current });
    loadListings();
  };

  if (loading) return <p className="p-8">Loading submissions...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Property Submissions (Admin)</h1>

      {listings.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{item.property_title}</h3>
              <p className="text-sm text-muted-foreground">{item.property_address}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-gray-100">{item.status}</span>
          </div>

          <p className="text-sm">{item.description}</p>
          <p className="text-sm font-medium">
            Asking price: {item.currency} {item.preferred_price?.toLocaleString()}
          </p>

          {item.photo_urls?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {item.photo_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded" />
              ))}
            </div>
          )}

          {item.document_urls?.length > 0 && (
            <div className="text-sm">
              Documents:{" "}
              {item.document_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="underline mr-2">
                  Doc {i + 1}
                </a>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="poa_requested">POA Requested</option>
              <option value="poa_signed">POA Signed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              onClick={() => togglePoaSigned(item.id, item.poa_signed)}
              className="border rounded px-3 py-1 text-sm"
            >
              {item.poa_signed ? "✓ POA Signed" : "Mark POA Signed"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}