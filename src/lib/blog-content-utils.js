// Post-processes blog post HTML before render so that website links and
// promotional images always point to the live site. Fixes a known domain
// typo ("propertyquesion" -> "propertyquestion") and ensures the site link
// uses https. Images not already wrapped in a link become clickable links
// to the website (e.g. "click here" banner graphics baked into an image).

const WEBSITE_URL = 'https://propertyquestion.net';

export function processBlogContent(html) {
  if (!html || typeof window === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Fix existing links: correct the domain typo and force https.
    doc.querySelectorAll('a[href]').forEach((a) => {
      let href = a.getAttribute('href') || '';
      if (href.includes('propertyquesion')) {
        href = href.replace(/propertyquesion/g, 'propertyquestion');
      }
      if (href.includes('propertyquestion.net')) {
        if (href.startsWith('http://')) href = 'https://' + href.slice(7);
        else if (!href.startsWith('https://')) href = 'https://' + href.replace(/^(https?:)?\/\//, '');
      }
      a.setAttribute('href', href);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });

    // Wrap images that are not already inside a link.
    doc.querySelectorAll('img').forEach((img) => {
      const parent = img.parentElement;
      if (parent && parent.tagName === 'A') return;
      const a = doc.createElement('a');
      a.setAttribute('href', WEBSITE_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    });

    return doc.body ? doc.body.innerHTML : html;
  } catch {
    return html;
  }
}