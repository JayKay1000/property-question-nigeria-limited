import { useEffect, useState } from 'react';
import { Search, MapPin, Building2, ChevronRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = {
  draft: 'secondary', pending: 'secondary', under_review: 'default',
  verified: 'default', approved: 'default', published: 'default',
  active: 'default', inactive: 'secondary', reserved: 'default',
  sold: 'destructive', archived: 'secondary',
};

export default function PropertyExplorer() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const updateDisplayOrder = async () => {

    if(!selected) return;

    try{

        await base44.entities.Property.update(
            selected.id,
            {
                displayOrder:selected.displayOrder
            }
        );

        alert("Display Order Updated");

        loadProperties();

    }catch(error){

        console.error(error);

    }

};
  const deleteProperty = async (propertyId) => {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this property?"
  );

  if (!confirmed) return;

  try {
    await base44.entities.Property.delete(propertyId);

    setProperties(properties.filter((p) => p.id !== propertyId));

    setSelected(null);

    alert("Property deleted successfully.");
  } catch (error) {
    console.error(error);
    alert("Unable to delete property.");
  }
};

  const loadProperties = () => {

    setLoading(true);

    base44.entities.Property
        .list("displayOrder",100)
        .then(setProperties)
        .catch(console.error)
        .finally(() => setLoading(false));

};

useEffect(() => {

    loadProperties();

}, []);

  const filtered = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.title || '').toLowerCase().includes(q)
      || (p.reference_number || '').toLowerCase().includes(q)
      || (p.state || '').toLowerCase().includes(q)
      || (p.city || '').toLowerCase().includes(q);
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-brand-700" /> Properties ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] space-y-1 overflow-y-auto">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, ref, location..." className="pl-9" />
          </div>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading properties...</p> : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No properties found.</p>
          ) : filtered.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)} className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-muted ${selected?.id === p.id ? 'bg-muted' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.title || 'Untitled'}</p>
                <p className="truncate text-xs text-muted-foreground">{p.reference_number || 'No ref'} · {p.city || p.state || 'No location'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={STATUS_COLORS[p.status] || 'secondary'} className="text-xs capitalize">{(p.status || '').replace(/_/g, ' ')}</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Property Details</span>
            {selected && <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">Select a property to view full details.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-lg font-bold">{selected.title || 'Untitled Property'}</h3>
                <p className="text-sm text-muted-foreground">{selected.reference_number} · {selected.property_type}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Status</p><Badge variant={STATUS_COLORS[selected.status] || 'secondary'} className="mt-1 capitalize text-xs">{(selected.status || '').replace(/_/g, ' ')}</Badge></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Purpose</p><p className="mt-1 text-sm font-medium capitalize">{selected.listing_purpose || '—'}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Price</p><p className="mt-1 text-sm font-bold">₦{(selected.price || 0).toLocaleString()}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Bedrooms</p><p className="mt-1 text-sm font-medium">{selected.bedrooms || '—'}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Bathrooms</p><p className="mt-1 text-sm font-medium">{selected.bathrooms || '—'}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Land Size</p><p className="mt-1 text-sm font-medium">{selected.land_size_sqm ? `${selected.land_size_sqm} sqm` : '—'}</p></div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="mb-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                <p className="text-sm">{[selected.address_line, selected.city, selected.lga, selected.state].filter(Boolean).join(', ') || 'No address'}</p>
              </div>
              {selected.description && <div className="rounded-lg border p-3"><p className="mb-1 text-xs text-muted-foreground">Description</p><p className="text-sm leading-relaxed">{selected.description}</p></div>}
              {selected.tags && selected.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{selected.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>}
            </div>
          )}
          <div className="mt-6">

    <label className="block mb-2 font-medium">

        Display Order

    </label>

    <input

        type="number"

        value={selected.displayOrder ?? 9999}

        onChange={(e)=>

            setSelected({

                ...selected,

                displayOrder:Number(e.target.value)

            })

        }

        className="w-40 rounded border px-3 py-2"

    />

</div>
<button

    onClick={updateDisplayOrder}

    className="mt-4 rounded bg-blue-600 px-5 py-2 text-white"

>

Save Display Order

</button>
          <div className="pt-4">
    <button
        onClick={() => deleteProperty(selected.id)}
        className="rounded-md bg-red-600 px-5 py-2 text-white hover:bg-red-700"
    >
        Delete Property
    </button>
</div>
        </CardContent>
      </Card>
    </div>
  );
}