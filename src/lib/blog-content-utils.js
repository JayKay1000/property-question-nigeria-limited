// Post-processes blog post HTML before render so website links and
// promotional images point to the live site. Uses lightweight string
// replacement (not DOM parsing) so large base64-embedded images are
// preserved exactly. Fixes a known domain typo ("propertyquesion" ->
// "propertyquestion") and ensures the site link uses https. Images not
// already wrapped in a link become clickable links to the website.

const WEBSITE_URL = 'https://propertyquestion.net';

export function processBlogContent(html) {
  if (!html) return html;
  let out = html;
  // Fix the domain typo and force https for the website link.
  out = out.replace(/propertyquesion/g, 'propertyquestion');
  out = out.replace(/http:\/\/propertyquestion\.net/g, 'https://propertyquestion.net');
  // Wrap images not already inside a link. Protect <a ...>...<img ...>...</a>
  // blocks first, then wrap the remaining standalone <img> tags.
  const LINKED_IMG = /<a\s[^>]*>[\s\S]*?<img\s[^>]*>[\s\S]*?<\/a>/gi;
  const placeholders = [];
  out = out.replace(LINKED_IMG, (m) => {
    placeholders.push(m);
    return `\u0000IMG${placeholders.length - 1}\u0000`;
  });
  out = out.replace(/<img\s([^>]*?)>/gi, `<a href="${WEBSITE_URL}" target="_blank" rel="noopener noreferrer"><img $1></a>`);
  out = out.replace(/\u0000IMG(\d+)\u0000/g, (_, i) => placeholders[Number(i)]);
  return out;
}