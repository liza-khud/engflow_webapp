// Generates sources_and_defaults.md and sources_and_defaults.html from defaults.json.
// Usage: node gen-docs.js
const fs = require('fs');
const path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults.json'), 'utf8'));
const i = D.inputs;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const conf = (c) => (typeof c === 'object' ? Object.entries(c).map(([k, v]) => `${k}: ${v}`).join('; ') : c);
const val = (x) => (x.values ? JSON.stringify(x.values) : JSON.stringify(x.value));
const flag = (x) => (x.placeholder || x.source === 'PLACEHOLDER' ? 'PLACEHOLDER'
  : x.source === 'judgment constant' ? 'judgment constant'
  : /^(low|none)/.test(typeof x.confidence === 'string' ? x.confidence : 'low') ? 'low confidence' : '');

const rows = Object.entries(i).map(([k, x]) => ({
  name: k, value: val(x), source: x.source, confidence: conf(x.confidence), flag: flag(x),
  detail: x.source_detail || x.note || '',
  urls: [].concat(x.source_urls && !Array.isArray(x.source_urls) ? Object.values(x.source_urls).flat() : x.source_urls || []),
}));
const ai = rows.find((r) => r.name === 'ai_multiplier');
ai.source = 'benchmark proxy (assisted); PLACEHOLDER (heavy_agentic)';
ai.flag = 'PLACEHOLDER: heavy_agentic; low confidence: assisted';
ai.urls = [].concat(...Object.values(i.ai_multiplier.source_urls));
ai.detail = Object.entries(i.ai_multiplier.sources).map(([k, v]) => `${k}: ${v}`).join(' | ');

let md = '# Sources and defaults\n\nGenerated from defaults.json (' + D.version + '). Savings rates and defaults are industry benchmarks and illustrative estimates, not EngFlow customer results.\n\n';
md += '| Input | Value | Source | Confidence | Flag |\n|---|---|---|---|---|\n';
rows.forEach((r) => { md += `| ${r.name} | ${r.value} | ${r.source} | ${r.confidence} | ${r.flag} |\n`; });
md += '\n## Detail and URLs\n';
rows.forEach((r) => {
  md += `\n### ${r.name}\n${r.detail}\n`;
  if (r.name === 'build_minutes' && i.build_minutes.note) md += `\nNote: ${i.build_minutes.note}\n`;
  r.urls.forEach((u) => { md += `- ${u}\n`; });
});
fs.writeFileSync(path.join(__dirname, 'sources_and_defaults.md'), md);

const link = (u) => (/^https?:/.test(u) ? `<a href="${esc(u)}">${esc(u)}</a>` : esc(u));
let h = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sources and Defaults</title>' +
  '<style>body{font:15px/1.5 system-ui,sans-serif;max-width:980px;margin:24px auto;padding:0 16px;color:#1a1f2b}table{border-collapse:collapse;width:100%}th,td{border:1px solid #dfe3ea;padding:6px 8px;text-align:left;vertical-align:top;word-break:break-word}' +
  '.f{background:#fff3d6;color:#7a5300;font-weight:600}</style></head><body><h1>Sources and defaults</h1>' +
  `<p>Generated from defaults.json (${esc(D.version)}). Savings rates and defaults are industry benchmarks and illustrative estimates, not EngFlow customer results.</p>` +
  '<table><tr><th>Input</th><th>Value</th><th>Source</th><th>Confidence</th><th>Flag</th></tr>' +
  rows.map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.value)}</td><td>${esc(r.source)}</td><td>${esc(r.confidence)}</td><td class="${r.flag ? 'f' : ''}">${esc(r.flag)}</td></tr>`).join('') +
  '</table><h2>Detail and URLs</h2>' +
  rows.map((r) => `<h3>${esc(r.name)}</h3><p>${esc(r.detail)}</p>` + (r.name === 'build_minutes' ? `<p><i>Note: ${esc(i.build_minutes.note)}</i></p>` : '') +
    (r.urls.length ? '<ul>' + r.urls.map((u) => `<li>${link(u)}</li>`).join('') + '</ul>' : '')).join('') +
  '</body></html>';
fs.writeFileSync(path.join(__dirname, 'sources_and_defaults.html'), h);
console.log('sources_and_defaults.md/.html written');
