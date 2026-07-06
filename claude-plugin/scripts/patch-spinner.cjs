const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.CLAUDE_PLUGIN_OPTION_API_BASE || 'http://localhost:4000';
const CAMPAIGN_ID = process.env.CLAUDE_PLUGIN_OPTION_CAMPAIGN_ID || '';
const CACHE_FILE = path.join(process.env.CLAUDE_PLUGIN_DATA || __dirname, 'current-ad.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON: ' + data)); }
      });
    }).on('error', reject);
  });
}

function findClaudeBinary() {
  const candidates = [];
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const localAppData = process.env.LOCALAPPDATA || '';

  if (home) {
    candidates.push(path.join(home, '.local', 'bin', 'claude.exe'));
    candidates.push(path.join(home, '.local', 'bin', 'claude'));
  }
  if (localAppData) {
    const versionsDir = path.join(localAppData, 'Claude', 'versions');
    if (fs.existsSync(versionsDir)) {
      const dirs = fs.readdirSync(versionsDir).sort().reverse();
      for (const d of dirs) {
        candidates.push(path.join(versionsDir, d, 'claude.exe'));
        candidates.push(path.join(versionsDir, d, 'claude'));
      }
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

async function patchBinary(binaryPath, headline, displayUrl) {
  const content = fs.readFileSync(binaryPath, 'binary');
  let patched = content;

  const spinnerWords = [
    'Accomplishing', 'Actioning', 'Actualizing', 'Baking', 'Beaming',
    'Beboppin\'', 'Befuddling', 'Billowing', 'Blanching', 'Bloviating',
    'Boogieing', 'Boondoggling', 'Booping', 'Bootstrapping', 'Brewing',
    'Burrowing', 'Calculating', 'Canoodling', 'Caramelizing', 'Cascading',
    'Catapulting', 'Cerebrating', 'Channeling', 'Choreographing', 'Churning',
    'Clauding', 'Coalescing', 'Cogitating', 'Combobulating', 'Composing',
    'Computing', 'Concocting', 'Considering', 'Contemplating', 'Cooking',
    'Crafting', 'Creating', 'Crunching', 'Crystallizing', 'Cultivating',
    'Deciphering', 'Deliberating', 'Determining', 'Dilly-dallying',
    'Discombobulating', 'Doing', 'Doodling', 'Drizzling', 'Ebbing',
    'Effecting', 'Elucidating', 'Embellishing', 'Enchanting', 'Envisioning',
    'Evaporating', 'Fermenting', 'Fiddle-faddling', 'Finagling', 'Flambeing',
    'Flibbertigibbeting', 'Flowing', 'Flummoxing', 'Fluttering', 'Forging',
    'Forming', 'Frolicking', 'Frosting', 'Gallivanting', 'Galloping',
    'Garnishing', 'Generating', 'Germinating', 'Gitifying', 'Grooving',
    'Gusting', 'Harmonizing', 'Hashing', 'Hatching', 'Herding', 'Honking',
    'Hullaballooing', 'Hyperspacing', 'Ideating', 'Imagining', 'Improvising',
    'Incubating', 'Inferring', 'Infusing', 'Ionizing', 'Jitterbugging',
    'Julienning', 'Kneading', 'Leavening', 'Levitating', 'Lollygagging',
    'Manifesting', 'Marinating', 'Meandering', 'Metamorphosing', 'Misting',
    'Moonwalking', 'Moseying', 'Mulling', 'Mustering', 'Musing',
    'Nebulizing', 'Nesting', 'Noodling', 'Nucleating', 'Orbiting',
    'Orchestrating', 'Osmosing', 'Perambulating', 'Percolating', 'Perusing',
    'Philosophising', 'Photosynthesizing', 'Pollinating', 'Pondering',
    'Pontificating', 'Pouncing', 'Precipitating', 'Prestidigitating',
    'Processing', 'Proofing', 'Propagating', 'Puttering', 'Puzzling',
    'Quantumizing', 'Razzle-dazzling', 'Razzmatazzing', 'Recombobulating',
    'Reticulating', 'Roosting', 'Ruminating', 'Sauteing', 'Scampering',
    'Schlepping', 'Scurrying', 'Seasoning', 'Shenaniganing', 'Shimmying',
    'Simmering', 'Skedaddling', 'Sketching', 'Slithering', 'Smooshing',
    'Sock-hopping', 'Spelunking', 'Spinning', 'Sprouting', 'Stewing',
    'Sublimating', 'Swirling', 'Swooping', 'Symbioting', 'Synthesizing',
    'Tempering', 'Thinking', 'Thundering', 'Tinkering', 'Tomfoolering',
    'Topsy-turvying', 'Transfiguring', 'Triangulating', 'Vamooseing',
    'Vaporizing', 'Vibing', 'Warping', 'Wibbling', 'Wiggling', 'Wrestling',
    'Zigzagging'
  ];

  const completionVerbs = ['Baked', 'Brewed', 'Churned', 'Cogitated', 'Cooked', 'Crunched', 'Sauteed', 'Worked'];

  const adText = (headline || 'Sponsored').slice(0, 25);
  const urlText = (displayUrl || 'thinksoft.dev').slice(0, 20);

  let replacements = 0;
  for (const word of spinnerWords) {
    const count = (patched.match(new RegExp(escapeRegex(word), 'g')) || []).length;
    if (count > 0) {
      patched = patched.split(word).join(adText);
      replacements += count;
    }
  }

  for (const verb of completionVerbs) {
    const count = (patched.match(new RegExp(escapeRegex(verb), 'g')) || []).length;
    if (count > 0) {
      patched = patched.split(verb).join(urlText);
      replacements += count;
    }
  }

  if (replacements > 0) {
    const backupPath = binaryPath + '.thinksoft.backup';
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(binaryPath, backupPath);
    }
    fs.writeFileSync(binaryPath, patched, 'binary');
    console.log(JSON.stringify({ ok: true, replacements, binary: binaryPath, ad: adText, url: urlText }));
  } else {
    console.log(JSON.stringify({ ok: true, replacements: 0, note: 'No spinner words found (already patched or different version)' }));
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  try {
    const adsUrl = API_BASE + '/api/ads/active' + (CAMPAIGN_ID ? '?campaign_id=' + encodeURIComponent(CAMPAIGN_ID) : '');
    const ad = await fetch(adsUrl);

    if (!ad || !ad.headline) {
      console.log(JSON.stringify({ ok: false, note: 'No active ads found' }));
      return;
    }

    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(ad));

    const binaryPath = findClaudeBinary();
    if (!binaryPath) {
      console.log(JSON.stringify({ ok: false, note: 'Claude Code binary not found. Ad cached for future use.' }));
      return;
    }

    await patchBinary(binaryPath, ad.headline, ad.display_url);
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: err.message }));
  }
}

main();
