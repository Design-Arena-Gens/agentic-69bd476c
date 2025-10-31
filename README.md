# Sentence Palette Explorer

This project extracts every Sentence Palette example from [Writefull for Overleaf](https://overleaf.writefull.ai/palette.html) and presents it in a searchable, filterable interface built with Next.js. Each research-paper section (Abstract, Introduction, etc.) is grouped with its example sentences so you can quickly locate the right phrasing.

## ✨ Highlights

- Automated scraper (`npm run extract`) that fetches the latest palette bundle, parses the embedded data, and saves the structured output to `data/palette.json`.
- Clean, responsive Next.js UI with live search across categories, topics, and individual sentences.
- Pre-sorted categories to match Sentence Palette sections and retain topic ordering.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Installation & Data Extraction

```bash
npm install
npm run extract
```

The extract script downloads the current palette bundle, converts it into structured JSON, and writes it to `data/palette.json`.

### Local Development

```bash
npm run dev
```

Open your browser at http://localhost:3000 to browse the explorer.

### Production Build

```bash
npm run build
npm start
```

## 📁 Key Files

- `scripts/extract.js` – pulls content from Writefull and shapes it into grouped JSON.
- `data/palette.json` – generated dataset with categories, topics, and example sentences.
- `app/page.jsx` – main UI with search and grouped rendering.
- `app/globals.css` – global styling for the explorer.

## 📝 Notes

- Re-run `npm run extract` whenever you need to refresh the dataset from Writefull.
- The UI automatically reflects any changes in `data/palette.json` during development.
