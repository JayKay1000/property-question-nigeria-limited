// Post-processes blog post HTML before render so website links and
// promotional images point to the live site. Uses lightweight string
// replacement (not DOM parsing) so large base64-embedded images are
// preserved exactly. Fixes a known domain typo ("propertyquesion" ->
// "propertyquestion") and ensures the site link uses https. Images not
// already wrapped in a link become clickable links to the website.

const WEBSITE_URL = 'https://propertyquestion.net';
const BUY2FLIP_URL = 'https://buy2flip.net';

// Converts "(hyperlink)" placeholder markers the author leaves beside entity
// names into real anchor tags. "Buy2Flip" -> buy2flip.net, "Property Question
// Nigeria Limited" -> propertyquestion.net. The marker is written two ways in
// the rich-text editor: as plain text "(hyperlink)", or split across styled
// spans with "hyperlink" coloured red between black "(" and ")". Both forms
// are matched. Bare "Property Question Nigeria Limited" mentions (no marker)
// are also linked to the website.
const MARKER =
  '(?:\\(hyperlink\\)|\\(<\\/span>\\s*<span[^>]*>\\s*hyperlink\\s*<\\/span>\\s*<span[^>]*>\\s*\\))';

function applyHyperlinkMarkers(html) {
  let out = html;
  const link = (href, text) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

  // Property Question Nigeria Limited (optional comma before the marker).
  out = out.replace(
    new RegExp(`(Property Question Nigeria Limited)(,?)\\s*${MARKER}`, 'g'),
    (_, text, comma) => link(WEBSITE_URL, text) + (comma || ''),
  );
  // Buy2Flip, optionally followed by "team" or "Relationship Officer".
  out = out.replace(
    new RegExp(`(Buy2Flip(?:\\s+(?:team|Relationship Officer))?)(,?)\\s*${MARKER}`, 'g'),
    (_, text, comma) => link(BUY2FLIP_URL, text) + (comma || ''),
  );

  // Link any remaining bare "Property Question Nigeria Limited" mentions that
  // are not already inside an anchor. Protect existing <a>...</a> blocks first.
  const anchors = [];
  out = out.replace(/<a\s[^>]*>[\s\S]*?<\/a>/gi, (m) => {
    anchors.push(m);
    return `\u0000A${anchors.length - 1}\u0000`;
  });
  out = out.replace(
    /Property Question Nigeria Limited/g,
    (text) => link(WEBSITE_URL, text),
  );
  out = out.replace(/\u0000A(\d+)\u0000/g, (_, i) => anchors[Number(i)]);
  return out;
}

export function processBlogContent(html) {
  if (!html) return html;
  let out = html;
  // Fix the domain typo and force https for the website link.
  out = out.replace(/propertyquesion/g, 'propertyquestion');
  out = out.replace(/http:\/\/propertyquestion\.net/g, 'https://propertyquestion.net');
  // Turn "(hyperlink)" markers beside entity names into real links.
  out = applyHyperlinkMarkers(out);
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