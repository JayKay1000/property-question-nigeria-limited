import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, Save, MapPin, Milestone, Pentagon, Trash2, Undo2, Info, History, Search, LocateFixed, BadgeCheck,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { hasCoordinates, formatCoordinates, VERIFICATION_DISPLAY, COORDINATE_SOURCE_LABELS } from '@/lib/geo-utils';
import LocationAutocomplete from '@/components/gis/LocationAutocomplete';
import MapView from '@/components/gis/MapView';

const STATUS_OPTIONS = ['unverified', 'approximate', 'verified'];
const SOURCE_OPTIONS = Object.keys(COORDINATE_SOURCE_LABELS);

const blankForm = {
  latitude: '',
  longitude: '',
  access_point_latitude: '',
  access_point_longitude: '',
  access_instructions: '',
  boundary_points: [],
  coordinate_source: 'manual_map_pick',
  location_verification_status: 'unverified',
  map_precision_note: '',
  location_notes: '',
};

const toNumber = (value) => (value === '' || value == null ? undefined : Number(value));

/**
 * Area of a mapped boundary, in square metres.
 *
 * Equirectangular approximation around the boundary's own centre — accurate to
 * well within the tolerance of a hand-placed polygon, and always presented as an
 * approximation, never as a survey figure.
 */
function boundaryAreaSqm(points) {
  if (!Array.isArray(points) || points.length < 3) return null;
  const valid = points.filter((p) => hasCoordinates(p?.lat, p?.lng));
  if (valid.length < 3) return null;
  const lat0 = valid.reduce((sum, p) => sum + p.lat, 0) / valid.length;
  const mPerDegLat = 111132.92;
  const mPerDegLng = 111319.49 * Math.cos((lat0 * Math.PI) / 180);
  const xy = valid.map((p) => [p.lng * mPerDegLng, p.lat * mPerDegLat]);
  let sum = 0;
  for (let i = 0; i < xy.length; i += 1) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.round(Math.abs(sum / 2));
}

/**
 * Staff console for verified property locations.
 *
 * Staff capture the real map position, the road access point and (optionally)
 * the land boundary, state where the coordinates came from, and mark how far the
 * position has actually been checked. Every status change is appended to the
 * record's audit trail with who made it and when, so an "approximate" pin can
 * never quietly become a "verified" one.
 */
export default function LocationVerificationManager() {
  const [properties, setProperties] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [captureMode, setCaptureMode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const apiRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [props, locations] = await Promise.all([
      base44.entities.Property.list('-created_date', 300).catch(() => []),
      base44.entities.PropertyLocation.list('-created_date', 500).catch(() => []),
    ]);
    setProperties(props || []);
    const map = {};
    (locations || []).forEach((record) => {
      if (record?.property_id) map[record.property_id] = record;
    });
    setRecords(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openProperty = useCallback(
    (property) => {
      const record = records[property.id];
      setSelected(property);
      setMessage(null);
      setCaptureMode(null);
      setShowHistory(false);
      setForm({
        ...blankForm,
        latitude: record?.latitude ?? property.latitude ?? '',
        longitude: record?.longitude ?? property.longitude ?? '',
        access_point_latitude: record?.access_point_latitude ?? '',
        access_point_longitude: record?.access_point_longitude ?? '',
        access_instructions: record?.access_instructions || '',
        boundary_points: Array.isArray(record?.boundary_points) ? record.boundary_points : [],
        coordinate_source: record?.coordinate_source || 'manual_map_pick',
        location_verification_status: record?.location_verification_status || 'unverified',
        map_precision_note: record?.map_precision_note || '',
        location_notes: record?.location_notes || '',
      });
    },
    [records],
  );

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? properties.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.reference_number?.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q) ||
            p.state?.toLowerCase().includes(q),
        )
      : properties;
    return list.slice(0, 60);
  }, [properties, query]);

  const draftPosition = useMemo(() => {
    if (!form) return null;
    const lat = toNumber(form.latitude);
    const lng = toNumber(form.longitude);
    return hasCoordinates(lat, lng) ? { lat, lng } : null;
  }, [form]);

  const boundary = useMemo(
    () => (form?.boundary_points || []).filter((p) => hasCoordinates(p?.lat, p?.lng)).map((p) => [p.lat, p.lng]),
    [form],
  );

  const accessPoint = useMemo(() => {
    const lat = toNumber(form?.access_point_latitude);
    const lng = toNumber(form?.access_point_longitude);
    return hasCoordinates(lat, lng) ? { lat, lng, instructions: form?.access_instructions } : null;
  }, [form]);

  // Preview property object so the map can render the draft position as a marker.
  const previewProperty = useMemo(() => {
    if (!selected || !draftPosition) return null;
    return { ...selected, latitude: draftPosition.lat, longitude: draftPosition.lng };
  }, [selected, draftPosition]);

  const handleMapPick = useCallback(
    ({ lat, lng }) => {
      if (!captureMode) return;
      const rounded = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      setForm((prev) => {
        if (!prev) return prev;
        if (captureMode === 'position') return { ...prev, latitude: rounded.lat, longitude: rounded.lng };
        if (captureMode === 'access') return { ...prev, access_point_latitude: rounded.lat, access_point_longitude: rounded.lng };
        return { ...prev, boundary_points: [...(prev.boundary_points || []), rounded] };
      });
    },
    [captureMode],
  );

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const applySearchedPlace = (place) => {
    if (!place) return;
    setForm((prev) => ({
      ...prev,
      latitude: Number(place.lat.toFixed(6)),
      longitude: Number(place.lng.toFixed(6)),
      coordinate_source: prev.coordinate_source === 'manual_map_pick' ? 'address_geocode' : prev.coordinate_source,
    }));
    setMessage(`Set the position from “${place.shortLabel || place.label}”. Confirm it on the map before verifying.`);
  };

  const handleSave = async () => {
    if (!selected || !form) return;
    const existing = records[selected.id];
    const nextStatus = form.location_verification_status;
    const changedStatus = (existing?.location_verification_status || 'unverified') !== nextStatus;
    const area = boundaryAreaSqm(form.boundary_points);
    let me = null;
    try {
      me = await base44.auth.me();
    } catch {
      me = null;
    }

    const history = Array.isArray(existing?.verification_history) ? [...existing.verification_history] : [];
    if (!existing || changedStatus) {
      history.push({
        at: new Date().toISOString(),
        by: me?.id || null,
        by_name: me?.full_name || me?.email || 'Staff member',
        from_status: existing?.location_verification_status || 'none',
        to_status: nextStatus,
        note: form.location_notes?.trim() || '',
      });
    }

    const payload = {
      property_id: selected.id,
      property_title: selected.title,
      latitude: toNumber(form.latitude),
      longitude: toNumber(form.longitude),
      access_point_latitude: toNumber(form.access_point_latitude),
      access_point_longitude: toNumber(form.access_point_longitude),
      access_instructions: form.access_instructions?.trim() || undefined,
      boundary_points: form.boundary_points || [],
      boundary_area_sqm: area ?? undefined,
      coordinate_source: form.coordinate_source,
      location_verification_status: nextStatus,
      map_precision_note: form.map_precision_note?.trim() || undefined,
      location_notes: form.location_notes?.trim() || undefined,
      verification_history: history,
    };

    if (nextStatus === 'verified') {
      payload.location_verified_at = new Date().toISOString();
      payload.location_verified_by = me?.id || undefined;
      payload.location_verified_by_name = me?.full_name || me?.email || 'Staff member';
    }

    setSaving(true);
    try {
      const saved = existing
        ? await base44.entities.PropertyLocation.update(existing.id, payload)
        : await base44.entities.PropertyLocation.create(payload);
      setRecords((prev) => ({ ...prev, [selected.id]: saved }));
      setMessage(`Location record ${existing ? 'updated' : 'created'} for ${selected.title}.`);
    } catch {
      setMessage('We could not save this location record. Check that every coordinate is a valid number and try again.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const existing = selected ? records[selected.id] : null;
    if (!existing) return;
    setSaving(true);
    try {
      await base44.entities.PropertyLocation.delete(existing.id);
      setRecords((prev) => {
        const next = { ...prev };
        delete next[selected.id];
        return next;
      });
      setMessage('Verification record removed. This property will show as unverified again.');
    } catch {
      setMessage('We could not remove that record. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
          <h3 className="font-heading text-sm font-bold text-brand-900">Choose a property</h3>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, reference, city…"
              className="pl-9"
            />
          </div>
          <div className="mt-3 max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
            {candidates.map((property) => {
              const record = records[property.id];
              const status = record?.location_verification_status || 'unverified';
              const display = VERIFICATION_DISPLAY[status];
              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => openProperty(property)}
                  className={`flex w-full items-start gap-2 rounded-xl border p-2.5 text-left transition ${
                    selected?.id === property.id ? 'border-flame-500 bg-flame-50' : 'border-border hover:border-brand-200'
                  }`}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-brand-900">{property.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {[property.city, property.state].filter(Boolean).join(', ') || 'Location not recorded'}
                    </span>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        status === 'verified'
                          ? 'bg-success/10 text-success'
                          : status === 'approximate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {display?.label || status}
                    </span>
                  </span>
                </button>
              );
            })}
            {candidates.length === 0 && <p className="p-2 text-sm text-muted-foreground">No property matches that search.</p>}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-8">
        {!selected ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-card">
            <MapPin className="mx-auto h-10 w-10 text-brand-200" />
            <p className="mt-3 text-sm text-muted-foreground">Select a property to record or update its verified location.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-brand-900">{selected.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {[selected.address_line, selected.estate, selected.city, selected.state].filter(Boolean).join(', ') || 'No address recorded'}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Listing coordinates: {formatCoordinates(selected.latitude, selected.longitude) || 'none on record'}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {records[selected.id] && (
                    <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving} className="border-destructive/40 text-destructive">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove record
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSave} disabled={saving} className="bg-flame-500 hover:bg-flame-600">
                    {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />} Save
                  </Button>
                </div>
              </div>
              {message && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-ice-50 p-2.5 text-xs leading-relaxed text-brand-800">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span>{message}</span>
                </p>
              )}
            </div>

            <div className="h-[360px] overflow-hidden rounded-2xl border border-border">
              <MapView
                properties={previewProperty ? [previewProperty] : []}
                landmarks={[]}
                selectedProperty={previewProperty}
                onSelectProperty={() => {}}
                mapType={mapType}
                accessPoint={accessPoint}
                boundary={boundary}
                showBoundary
                pickingMode={captureMode}
                onMapPick={handleMapPick}
                apiRef={apiRef}
              />
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={captureMode === 'position' ? 'default' : 'outline'}
                  className={captureMode === 'position' ? 'bg-brand-900' : 'border-brand-200'}
                  onClick={() => setCaptureMode(captureMode === 'position' ? null : 'position')}
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" /> {captureMode === 'position' ? 'Tap the map…' : 'Place property position'}
                </Button>
                <Button
                  size="sm"
                  variant={captureMode === 'access' ? 'default' : 'outline'}
                  className={captureMode === 'access' ? 'bg-brand-900' : 'border-brand-200'}
                  onClick={() => setCaptureMode(captureMode === 'access' ? null : 'access')}
                >
                  <Milestone className="mr-1.5 h-3.5 w-3.5" /> {captureMode === 'access' ? 'Tap the map…' : 'Place road access point'}
                </Button>
                <Button
                  size="sm"
                  variant={captureMode === 'boundary' ? 'default' : 'outline'}
                  className={captureMode === 'boundary' ? 'bg-brand-900' : 'border-brand-200'}
                  onClick={() => setCaptureMode(captureMode === 'boundary' ? null : 'boundary')}
                >
                  <Pentagon className="mr-1.5 h-3.5 w-3.5" /> {captureMode === 'boundary' ? 'Tap the map to add points…' : 'Draw land boundary'}
                </Button>
                {boundary.length > 0 && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-brand-200"
                      onClick={() => setField('boundary_points', (form.boundary_points || []).slice(0, -1))}
                    >
                      <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Undo point
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setField('boundary_points', [])}>
                      Clear boundary
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" className="border-brand-200" onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}>
                  <LocateFixed className="mr-1.5 h-3.5 w-3.5" /> {mapType === 'satellite' ? 'Satellite' : 'Street'} view
                </Button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Boundary vertices captured: {boundary.length}
                {boundary.length >= 3
                  ? ` · approximate area ${boundaryAreaSqm(form.boundary_points).toLocaleString()} m² (from the mapped boundary, not a survey).`
                  : ' — at least 3 points are needed for a boundary.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <h4 className="font-heading text-sm font-bold text-brand-900">Verified map position</h4>
              <div className="mt-3">
                <Label htmlFor="loc-search" className="text-xs font-semibold text-brand-800">Search the address or landmark</Label>
                <div className="mt-1.5">
                  <LocationAutocomplete
                    inputId="loc-search"
                    ariaLabel="Search the address to place the position"
                    value={null}
                    onChange={applySearchedPlace}
                    placeholder="Search the street, estate or landmark…"
                    near={selected.latitude && selected.longitude ? { lat: selected.latitude, lng: selected.longitude } : undefined}
                    onPickOnMap={() => setCaptureMode('position')}
                  />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="loc-lat" className="text-xs font-semibold text-brand-800">Latitude</Label>
                  <Input id="loc-lat" value={form.latitude} onChange={(e) => setField('latitude', e.target.value)} inputMode="decimal" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="loc-lng" className="text-xs font-semibold text-brand-800">Longitude</Label>
                  <Input id="loc-lng" value={form.longitude} onChange={(e) => setField('longitude', e.target.value)} inputMode="decimal" className="mt-1.5" />
                </div>
              </div>
              {!draftPosition && (
                <p className="mt-2 text-xs text-amber-700">Enter or capture a valid latitude and longitude to place this property on the map.</p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <h4 className="font-heading text-sm font-bold text-brand-900">Road access point</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Where a driver actually turns in. Often different from the plot position, especially for land.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="access-lat" className="text-xs font-semibold text-brand-800">Access latitude</Label>
                  <Input id="access-lat" value={form.access_point_latitude} onChange={(e) => setField('access_point_latitude', e.target.value)} inputMode="decimal" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="access-lng" className="text-xs font-semibold text-brand-800">Access longitude</Label>
                  <Input id="access-lng" value={form.access_point_longitude} onChange={(e) => setField('access_point_longitude', e.target.value)} inputMode="decimal" className="mt-1.5" />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="access-notes" className="text-xs font-semibold text-brand-800">Approach instructions (shown to visitors)</Label>
                <Textarea
                  id="access-notes"
                  value={form.access_instructions}
                  onChange={(e) => setField('access_instructions', e.target.value)}
                  placeholder="e.g. Turn off the Lekki-Epe expressway at the second gate, then 200m past the filling station."
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-card">
              <h4 className="font-heading text-sm font-bold text-brand-900">Verification</h4>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold text-brand-800">Status</Label>
                  <Select value={form.location_verification_status} onValueChange={(value) => setField('location_verification_status', value)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{VERIFICATION_DISPLAY[option]?.label || option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    {VERIFICATION_DISPLAY[form.location_verification_status]?.description}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-brand-800">How the position was obtained</Label>
                  <Select value={form.coordinate_source} onValueChange={(value) => setField('coordinate_source', value)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{COORDINATE_SOURCE_LABELS[option]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="precision-note" className="text-xs font-semibold text-brand-800">Precision note shown to visitors</Label>
                <Textarea
                  id="precision-note"
                  value={form.map_precision_note}
                  onChange={(e) => setField('map_precision_note', e.target.value)}
                  placeholder="e.g. Plot position checked on site; boundary is indicative only."
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div className="mt-3">
                <Label htmlFor="internal-notes" className="text-xs font-semibold text-brand-800">Internal review notes (staff only)</Label>
                <Textarea
                  id="internal-notes"
                  value={form.location_notes}
                  onChange={(e) => setField('location_notes', e.target.value)}
                  placeholder="What was checked, who confirmed it, and any caveat."
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowHistory((value) => !value)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 hover:text-flame-600"
                >
                  <History className="h-3.5 w-3.5" /> Verification history
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">
                    {(records[selected.id]?.verification_history || []).length}
                  </span>
                </button>
                {showHistory && (
                  <ul className="mt-2 space-y-1.5">
                    {(records[selected.id]?.verification_history || []).length === 0 && (
                      <li className="text-[11px] text-muted-foreground">No verification decisions recorded yet.</li>
                    )}
                    {(records[selected.id]?.verification_history || [])
                      .slice()
                      .reverse()
                      .map((entry, index) => (
                        <li key={index} className="rounded-lg bg-ice-50 p-2 text-[11px] leading-relaxed text-brand-800">
                          <span className="font-semibold">
                            {entry.from_status || 'none'} → {entry.to_status}
                          </span>{' '}
                          · {entry.by_name || 'Staff member'}
                          {entry.at ? ` · ${new Date(entry.at).toLocaleString('en-NG')}` : ''}
                          {entry.note ? <span className="mt-0.5 block text-muted-foreground">{entry.note}</span> : null}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-xl border border-brand-100 bg-white p-3 text-[11px] leading-relaxed text-muted-foreground">
              <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span>
                A verified position here takes precedence over the coordinates captured when the listing was created, and appears on the public
                GIS map and the property page. Mark a position verified only after it has actually been checked.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}