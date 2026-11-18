// Remark plugin: let posts written in Obsidian render as plain Markdown.
//   ![[shot.png]] / ![[shot.png|600]]  → <img src="./assets/shot.png" width="600">  (Astro then optimises it)
//   ![alt|700x143](url)                  → <img alt="alt" width="700">            (Obsidian size hint)
//   [[Some note]] / [[Some note|text]]   → plain text "Some note" / "text"
//   > [!tip] Title                        → blockquote.callout.callout-tip
//   a lone [[toc]] paragraph              → removed (the article page renders its own TOC)
const EMBED = /!\[\[([^\]|]+?)(?:\|(\d+)(?:x(\d+))?)?\]\]/g;
const WIKI = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
const SIZE = /^(.*?)\|(\d+)(?:x(\d+))?$/;

const toUrl = (file) => {
  const clean = file.trim();
  if (/^(https?:)?\/\//.test(clean) || clean.startsWith('/') || clean.startsWith('.')) return clean;
  return './assets/' + clean.split('/').pop();
};
const sized = (node, w, h) => {
  if (!w) return node;
  node.data = { ...node.data, hProperties: { ...(node.data?.hProperties ?? {}), width: Number(w), ...(h ? { height: Number(h) } : {}) } };
  return node;
};

function splitText(value) {
  const out = [];
  let last = 0;
  const re = new RegExp(`${EMBED.source}|${WIKI.source}`, 'g');
  for (const m of value.matchAll(re)) {
    if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
    if (m[0].startsWith('!')) out.push(sized({ type: 'image', url: toUrl(m[1]), alt: '' }, m[2], m[3]));
    else out.push({ type: 'text', value: (m[5] ?? m[4]).trim() });
    last = m.index + m[0].length;
  }
  if (last === 0) return null;
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

function walk(node) {
  if (!node.children) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'paragraph' && child.children?.length === 1 && child.children[0].type === 'text' && child.children[0].value.trim() === '[[toc]]') continue;
    if (child.type === 'text') {
      const parts = splitText(child.value);
      if (parts) { next.push(...parts); continue; }
    }
    if (child.type === 'image') {
      const m = SIZE.exec(child.alt ?? '');
      if (m) { child.alt = m[1].trim(); sized(child, m[2], m[3]); }
    }
    if (child.type === 'blockquote') {
      const first = child.children?.[0]?.children?.[0];
      const m = first?.type === 'text' && /^\[!(\w+)\][+-]?\s*/.exec(first.value);
      if (m) {
        first.value = first.value.slice(m[0].length);
        child.data = { ...child.data, hProperties: { className: ['callout', `callout-${m[1].toLowerCase()}`] } };
      }
    }
    walk(child);
    next.push(child);
  }
  node.children = next;
}

export default function remarkObsidian() {
  return (tree) => walk(tree);
}
