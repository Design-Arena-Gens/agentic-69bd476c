const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const { URL } = require('url');
const vm = require('vm');

const BASE_URL = 'https://overleaf.writefull.ai';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'palette.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(`Request to ${url} failed with status ${res.statusCode}`)
          );
          res.resume();
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}

function extractPaletteSnippet(source) {
  const marker = 'm={sections:';
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error('Could not locate palette data in script source.');
  }

  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  throw new Error('Failed to extract palette data block.');
}

function parsePalette(snippet) {
  const script = `
    (() => {
      var m;
      ${snippet};
      return m;
    })()
  `;

  const context = {};
  vm.createContext(context);
  return vm.runInContext(script, context);
}

function normaliseIntentKey(rawKey) {
  const match = rawKey.match(/^\s*(\d+)\.\s*(.+)$/);
  if (!match) {
    return { id: Number.NaN, title: rawKey, rawTitle: rawKey };
  }

  return {
    id: Number.parseInt(match[1], 10),
    title: match[2],
    rawTitle: rawKey,
  };
}

function buildPaletteData(structure) {
  const intents = new Map();
  structure.intents.forEach((entry) => {
    const [rawKey, examples] = Object.entries(entry)[0];
    const meta = normaliseIntentKey(rawKey);
    intents.set(meta.id, { ...meta, examples });
  });
  const categories = structure.sections.map((section) => {
    const [category, ids] = Object.entries(section)[0];
    const topics = ids
      .map((id) => {
        const intent = intents.get(id);
        if (!intent) {
          throw new Error(`Missing intent definition for id ${id}`);
        }
        return {
          id,
          title: intent.title,
          rawTitle: intent.rawTitle,
          examples: intent.examples,
        };
      })
      .sort((a, b) => a.id - b.id);

    return { category, topics };
  });

  categories.sort((a, b) => a.category.localeCompare(b.category));
  return categories;
}

async function main() {
  const html = await fetch(new URL('/palette.html', BASE_URL));
  const scriptMatch = html.match(
    /<script[^>]+src="([^"]*legacy\/[^"]+\.js[^"]*)"/i
  );

  if (!scriptMatch) {
    throw new Error('Could not find palette script reference in HTML.');
  }

  const scriptUrl = new URL(scriptMatch[1], BASE_URL);
  const scriptSource = await fetch(scriptUrl);
  const snippet = extractPaletteSnippet(scriptSource);
  const structure = parsePalette(snippet);
  const palette = buildPaletteData(structure);

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(palette, null, 2)}\n`);
  console.log(`Extracted palette data to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
