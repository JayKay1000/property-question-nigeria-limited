/**
 * Client-side SEO metadata for property detail pages.
 * Sets document title, meta description, Open Graph, Twitter card, canonical URL,
 * and JSON-LD structured data. In a Vite SPA these are set client-side, so crawlers
 * that do not execute JavaScript will not see property-specific metadata.
 */

const DEFAULT_TITLE = 'Property Question Nigeria Limited';

function upsertMeta(selector, attr, name, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  if (content) el.setAttribute('content', content);
  else el.remove();
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export function setPropertySEO(property) {
  if (!property) return;
  const title = `${property.title} | Property Question Nigeria`;
  const description = (property.short_description || property.description || '').slice(0, 160);
  const image = property.featured_image_url || property.image_urls?.[0] || '';
  const url = window.location.href;

  document.title = title;

  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
  if (image) upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
  upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  if (image) upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

  upsertLink('canonical', url);

  // JSON-LD structured data — only real fields, no fabricated ratings/reviews
  const ld = {
    '@context': 'https://schema.org',
    '@type': property.listing_purpose === 'rent' ? 'Residence' : 'Product',
    name: property.title,
    description: description || undefined,
    url,
    image: image || undefined,
  };
  if (property.price != null) {
    ld.offers = {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency || 'NGN',
      availability: property.availability_status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    };
  }
  if (property.latitude && property.longitude) {
    ld.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    };
  }
  upsertJsonLd('property-jsonld', ld);
}

export function clearPropertySEO() {
  document.title = DEFAULT_TITLE;
  removeJsonLd('property-jsonld');
}