import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in to save properties.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { property_id } = body;
    if (!property_id) return Response.json({ error: 'Property ID is required.' }, { status: 400 });

    // Check for an existing saved record (RLS enforces user_id === user.id)
    const existing = await base44.entities.SavedProperty.filter({ user_id: user.id, property_id });
    const existingItems = (existing as any).items || existing;

    if (existingItems.length > 0) {
      await base44.entities.SavedProperty.delete(existingItems[0].id);
      return Response.json({ saved: false });
    }

    // Fetch property title for the saved record (best-effort)
    const property = await base44.entities.Property.get(property_id).catch(() => null);
    await base44.entities.SavedProperty.create({
      user_id: user.id,
      property_id,
      property_title: property?.title || '',
      saved_date: new Date().toISOString(),
      collection_name: 'Favorites',
    });

    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: 'Failed to save property.' }, { status: 500 });
  }
}