import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Image } from "@/components/ui/image";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Globe,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Home,
  Ruler,
  CheckCircle2,
} from "lucide-react";
import {
  isImage,
  isVideo,
  isPdf,
  fileNameFromUrl,
  downloadFile,
  downloadAll,
} from "@/lib/media-download";

const NONE = "—";

function val(v) {
  if (v === null || v === undefined || v === "") return NONE;
  return String(v);
}

function Field({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="mt-0.5 break-words text-sm text-foreground">{val(value)}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function MediaGroup({ title, icon: Icon, urls, accent }) {
  const [downloading, setDownloading] = useState(false);
  if (!urls || !urls.length) return null;

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      await downloadAll(urls, title.toLowerCase().replace(/\s+/g, "-"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4" /> {title}
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {urls.length}
          </span>
        </h3>
        <button
          onClick={handleDownloadAll}
          disabled={downloading}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
        >
          <Download className="h-3 w-3" /> {downloading ? "Downloading…" : "Download all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {urls.map((url, i) => (
          <MediaItem key={`${url}-${i}`} url={url} label={`${title} ${i + 1}`} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function MediaItem({ url, label, accent }) {
  const image = isImage(url);
  const video = isVideo(url);
  const pdf = isPdf(url);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-square w-full bg-muted">
        {image ? (
          <Image src={url} alt={label} fittingType="fill" className="h-full w-full" />
        ) : video ? (
          <video src={url} className="h-full w-full object-cover" controls preload="metadata" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-muted-foreground">
            {pdf ? <FileText className="h-7 w-7 text-rose-500" /> : <FileText className="h-7 w-7" />}
            <span className="line-clamp-2 break-all text-[10px]">{fileNameFromUrl(url)}</span>
          </div>
        )}
        <span className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white ${accent}`}>
          {image ? "Img" : video ? "Video" : pdf ? "PDF" : "File"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-1 px-1.5 py-1">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-700 hover:underline"
        >
          <Eye className="h-3 w-3" /> Open
        </a>
        <button
          onClick={() => downloadFile(url, fileNameFromUrl(url))}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-foreground hover:text-flame-600"
        >
          <Download className="h-3 w-3" /> Save
        </button>
      </div>
    </div>
  );
}

function Chips({ items }) {
  if (!items || !items.length) return <span className="text-sm text-muted-foreground">{NONE}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((it, i) => (
        <span key={i} className="rounded-full bg-flame-50 px-2 py-0.5 text-[11px] font-medium text-flame-700">
          {it}
        </span>
      ))}
    </div>
  );
}

export default function SubmissionDetailSheet({ listing, open, onOpenChange }) {
  if (!listing) return null;

  const images = [
    ...(listing.featured_image_url ? [listing.featured_image_url] : []),
    ...(listing.image_urls || []),
    ...(listing.photo_urls || []),
  ];
  const uniqueImages = [...new Set(images)];
  const videos = listing.video_urls || [];
  const tours = listing.tour_360_urls || [];
  const docs = listing.document_urls || [];

  const fullAddress = [
    listing.property_address,
    listing.address_line,
    listing.estate,
    listing.district,
    listing.lga,
    listing.city,
    listing.state,
  ].filter(Boolean).join(", ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="pr-6">{listing.property_title || "Submission"}</SheetTitle>
          <SheetDescription>
            Reference {listing.reference_number || "—"} • Submitted by {listing.submitter_type || "homeowner"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <Section title="Overview">
            <Field label="Title" value={listing.property_title} icon={Home} />
            <Field label="Price" value={`${listing.currency || "NGN"} ${Number(listing.preferred_price || 0).toLocaleString()}`} icon={Star} />
            <Field label="Purpose" value={listing.listing_purpose} />
            <Field label="Type" value={listing.property_type} />
            <Field label="Classification" value={listing.property_classification} />
            <Field label="Condition" value={listing.property_condition} />
            <Field label="Furnishing" value={listing.furnishing_status} />
            <Field label="Status" value={listing.status} icon={CheckCircle2} />
            <Field label="POA Signed" value={listing.poa_signed ? "Yes" : "No"} />
            <Field label="Reference" value={listing.reference_number} />
            <Field label="Slug" value={listing.slug} />
            <Field label="Visibility" value={listing.visibility} />
          </Section>

          {listing.short_description && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Short Description</div>
              <p className="mt-1 text-sm text-foreground">{listing.short_description}</p>
            </div>
          )}

          {listing.description && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Description</div>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{listing.description}</p>
            </div>
          )}

          <Section title="Property Specifications">
            <Field label="Bedrooms" value={listing.bedrooms} icon={Home} />
            <Field label="Bathrooms" value={listing.bathrooms} />
            <Field label="Parking" value={listing.parking_spaces} />
            <Field label="Year Built" value={listing.year_built} icon={Calendar} />
            <Field label="Land (sqm)" value={listing.land_size_sqm} icon={Ruler} />
            <Field label="Built-up (sqm)" value={listing.built_up_area_sqm} icon={Ruler} />
          </Section>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Amenities</h3>
            <Chips items={listing.amenities} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Highlights</h3>
            <Chips items={listing.highlights} />
          </div>

          <Section title="Location">
            <div className="col-span-2">
              <Field label="Full Address" value={fullAddress} icon={MapPin} />
            </div>
            <Field label="State" value={listing.state} />
            <Field label="City" value={listing.city} />
            <Field label="LGA" value={listing.lga} />
            <Field label="District" value={listing.district} />
            <Field label="Estate" value={listing.estate} />
            <Field label="Address Line" value={listing.address_line} />
            <Field
              label="Coordinates"
              value={
                listing.latitude != null && listing.longitude != null
                  ? `${listing.latitude}, ${listing.longitude}`
                  : NONE
              }
            />
            {listing.latitude != null && listing.longitude != null && (
              <a
                href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Google Maps
              </a>
            )}
          </Section>

          <Section title="Submitter Contact">
            <Field label="Name" value={listing.owner_name} icon={User} />
            <Field label="Submitter Type" value={listing.submitter_type} />
            <Field label="Email" value={listing.owner_email} icon={Mail} />
            <Field label="Phone" value={listing.owner_phone} icon={Phone} />
            <Field label="Owner ID" value={listing.owner_id} />
            <Field label="Approved Property" value={listing.approved_property_id} />
          </Section>

          {listing.admin_notes && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Admin Notes</div>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{listing.admin_notes}</p>
            </div>
          )}

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">Uploads</h3>
            {uniqueImages.length === 0 && videos.length === 0 && tours.length === 0 && docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No uploads attached to this submission.</p>
            ) : (
              <>
                <MediaGroup title="Images" icon={ImageIcon} urls={uniqueImages} accent="bg-emerald-600" />
                <MediaGroup title="Videos" icon={Video} urls={videos} accent="bg-violet-600" />
                <MediaGroup title="360° Tours" icon={Globe} urls={tours} accent="bg-sky-600" />
                <MediaGroup title="Documents" icon={FileText} urls={docs} accent="bg-rose-600" />
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}