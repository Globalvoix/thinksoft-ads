const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(process.env.CLAUDE_PLUGIN_DATA || __dirname, 'current-ad.json');

function loadAd() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch {}
  return null;
}

function inlineImageBase64(base64Data, mimeType) {
  const img = `\x1b]1337;File=inline=1;width=auto;preserveAspectRatio=1:${base64Data}\x07`;
  return img;
}

function dataUrlToInline(dataUrl) {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  return inlineImageBase64(match[2], match[1]);
}

function main() {
  const ad = loadAd();
  if (!ad) return;

  const headline = ad.headline || 'Sponsored';
  const logoUrl = ad.logo_url || '';

  let img = '';
  if (logoUrl) {
    const inline = dataUrlToInline(logoUrl);
    if (inline) img = inline + ' ';
  }

  process.stderr.write(`\n  ${img}\x1b[1m${headline}\x1b[0m\n\n`);
}

main();
