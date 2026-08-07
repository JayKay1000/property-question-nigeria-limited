import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Clock, ExternalLink, Tag, RotateCcw } from "lucide-react";

const STATUS_TONE = {
  submitted: "bg-amber-100 text-amber-700",
  under_review: "bg-amber-100 text-amber-700",
  poa_requested: "bg-amber-100 text-amber-700",
  poa_signed: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export default function AdminPropertyReview() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [soldMap, setSoldMap] = useState({});

  useEffect(() => { loadListings(); }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.PropertyListing.list("-created_date");
      const arr = Array.isArray(data) ? data : [];
      setListings(arr);
      const approvedIds = arr.filter((l) => l.approved_property_id).map((l) => l.approved_property_id);
      if (approvedIds.length) {
        const props = await base44.entities.Property.filter({ id: { $in: approvedIds } }).catch(() => []);
        const map = {};
        (Array.isArray(props) ? props : []).forEach((p) => {
          const listing = arr.find((l) => l.approved_property_id === p.id);
          if (listing) map[listing.id] = p.availability_status;
        });
        setSoldMap(map);
      } else {
        setSoldMap({});
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSold = async (listing) => {
    if (!listing.approved_property_id) return;
    const nextSold = soldMap[listing.id] !== "sold";
    setBusyId(listing.id);
    try {
      await base44.entities.Property.update(listing.approved_property_id, {
        availability_status: nextSold ? "sold" : "available",
      });
      setSoldMap((prev) => ({ ...prev, [listing.id]: nextSold ? "sold" : "available" }));
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await base44.entities.PropertyListing.update(id, { status });
      if (status === "approved") {
        const listing = listings.find((l) => l.id === id);
        if (listing) await publishToPublic(listing);
      }
      await loadListings();
    } finally {
      setBusyId(null);
    }
  };

  const publishToPublic = async (listing) => {
    if (listing.approved_property_id) return;
    const existing = await base44.entities.Property.filter({ source_listing_id: listing.id });
    let propertyId = existing[0]?.id;
    if (!propertyId) {
      const created = await base44.entities.Property.create({
        title: listing.property_title,
        property_title: listing.property_title,
        short_description: listing.short_description || "",
        description: listing.description || "",
        property_address: listing.property_address || listing.address_line || "",
        price: listing.preferred_price,
        currency: listing.currency || "NGN",
        property_type: listing.property_type,
        listing_purpose: listing.listing_purpose || "sale",
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        parking_spaces: listing.parking_spaces,
        land_size_sqm: listing.land_size_sqm,
        built_up_area_sqm: listing.built_up_area_sqm,
        year_built: listing.year_built,
        property_classification: listing.property_classification,
        property_condition: listing.property_condition,
        furnishing_status: listing.furnishing_status,
        state: listing.state,
        city: listing.city,
        district: listing.district,
        estate: listing.estate,
        address_line: listing.address_line,
        amenities: listing.amenities || [],
        highlights: listing.highlights || [],
        featured_image_url: listing.featured_image_url || listing.photo_urls?.[0] || null,
        image_urls: listing.image_urls?.length ? listing.image_urls : (listing.photo_urls || []),
        reference_number: listing.reference_number,
        slug: listing.slug,
        status: "published",
        availability_status: "available",
        visibility: "public",
        is_new_listing: true,
        owner_id: listing.owner_id,
        owner_name: listing.owner_name,
        listing_agent_id: listing.owner_id,
        listing_agent_name: listing.owner_name,
        source_listing_id: listing.id,
        published_at: new Date().toISOString(),
      });
      propertyId = created.id;
    }
    await base44.entities.PropertyListing.update(listing.id, { approved_property_id: propertyId });
  };

  if (loading) return <p className="p-8">Loading submissions…</p>;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Property Submission Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submissions from homeowners and agents. Approving publishes the property to the public site.
        </p>
      </div>

      {listings.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No property submissions awaiting review.
        </div>
      )}

      {listings.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{item.property_title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_TONE[item.status] || "bg-slate-100 text-slate-600"}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.property_address || [item.address_line, item.city, item.state].filter(Boolean).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submitted by {item.submitter_type || "homeowner"} • {item.owner_name || item.owner_email || "—"}
              </p>
            </div>
            <p className="text-sm font-medium whitespace-nowrap">
              {item.currency || "NGN"} {item.preferred_price?.toLocaleString?.() ?? item.preferred_price}
            </p>
          </div>

          {item.description && <p className="text-sm">{item.description}</p>}

          {item.featured_image_url || item.photo_urls?.length || item.image_urls?.length ? (
            <div className="flex gap-2 flex-wrap">
              {[item.featured_image_url, ...(item.image_urls || []), ...(item.photo_urls || [])]
                .filter(Boolean)
                .map((url, i) => (
                  <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded" />
                ))}
            </div>
          ) : null}

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

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <button
              onClick={() => updateStatus(item.id, "approved")}
              disabled={busyId === item.id || item.status === "approved"}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {item.status === "approved" ? "Approved" : "Approve & Publish"}
            </button>
            <button
              onClick={() => updateStatus(item.id, "rejected")}
              disabled={busyId === item.id || item.status === "rejected"}
              className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              onClick={() => updateStatus(item.id, "under_review")}
              disabled={busyId === item.id}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Clock className="h-3.5 w-3.5" /> Mark Under Review
            </button>
            {item.status === "approved" && item.approved_property_id && (
              <>
                <button
                  onClick={() => toggleSold(item)}
                  disabled={busyId === item.id}
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${soldMap[item.id] === "sold" ? "bg-rose-600 text-white hover:bg-rose-700" : "border border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                >
                  {soldMap[item.id] === "sold"
                    ? (<><RotateCcw className="h-3.5 w-3.5" /> Mark Available</>)
                    : (<><Tag className="h-3.5 w-3.5" /> Mark as Sold</>)}
                </button>
                <a
                  href={`/properties/${item.approved_property_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Live
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}