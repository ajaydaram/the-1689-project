# 1689 Confession Reader

A modern, highly optimized web application for studying the 1689 London Baptist Confession of Faith. Designed to bridge the gap between historical theological research and modern software engineering practices, this application provides an immersive, typography-driven reading experience with integrated commentary and real-time scripture reference parsing.

## Features

- **Dual-Pane Study View:** Seamlessly toggle between the original text of the 1689 Confession and integrated theological commentary.
- **Dynamic Scripture Parsing:** Automatically detects and parses Bible references (e.g., `Romans 9:22-23`) within the markdown commentary. It injects a custom tooltip component (`<BibleHover />`) using an AST (Abstract Syntax Tree) transformation approach, querying custom bundled JSON structures.
- **Advanced AST Processing:** Utilizes custom `remark` plugins to traverse and manipulate content structure at build-time and run-time, automatically generating clean `id` links and navigable heading hierarchies for the Table of Contents.
- **Architectural UI & Design:** A "Parchment-glow" typography-first interface powered by Tailwind CSS, with fluid scaling, structural sidebars, and responsive typography optimized for long-form reading.
- **Lightweight & Fast:** Built on Vite and React 18 without bloat. Pure string-parsing, caching algorithms, and static asset distribution replace massive CMS dependencies.

## Technology Stack

- **Framework:** React 18, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Content Engine:** 
  - `react-markdown`
  - `remark-gfm`, `rehype-raw`, `rehype-slug`
  - Custom DOM modification: `github-slugger` for generating safe headings.
- **Database / Corpus:** 
  - Raw JSON extraction of the full KJV Bible text (`public/bible.json`) mapped dynamically via Regex algorithms.
  - JSON API extracted text of the 1689 London Baptist Confession.

## Engineering Highlight: Scripture AST Transformation

Instead of hardcoding links, the project extends standard Markdown parsers with a custom plugin (`remark-bible.ts`). It traverses the AST tree looking for pattern variations of biblical references. 

When found, the AST node is transformed on-the-fly to a custom React component, decoupling the raw data files authoring process from the UI display layer. This ensures that authors can right plain text while the reading experience surfaces deeply integrated reference material via `bibleData.ts`.

## Development Setup

Requirements:
- Node.js >= 18.x

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs with hot-module reloading on `0.0.0.0:3000`):
   ```bash
   npm run dev
   ```

## Build

To create a production-ready, minified build:
```bash
npm run build
```
The optimized bundle is placed into `dist/`. Since the app operates entirely client-side, the result can be directly hosted on any static edge CDN.

## Project Structure

```
├── src/
│   ├── components/       # Core UI implementations (ArticleLayout, BibleHover, Navigation)
│   ├── data/             # Mapped structures (chapters.ts, 1689 JSON mappings)
│   ├── lib/              # Core utilities, AST plugin implementations, logic parsing
│   └── content/          # Main MDX source commentary documents
├── public/               # Static assets & bulk metadata corpuses (bible.json)
```

## Future Architecture

- **Semantic Search Vectorization:** Plans to incorporate an LLM-based RAG approach over the text corpus for deep theological topic similarity searches.
- **Web Workers Background Parsing:** Enhancing the initial load efficiency by dropping regex compilation and string manipulation routines to secondary threads as the text corpus grows.

---

## Repository Metadata 

*Tip: For developers cloning or hosting this repository on GitHub, consider adding these tags to your repository's "About" section to attract like-minded developers and theologians.*

**Suggested Topics:** 
`react`, `vite`, `reformed-theology`, `baptist-history`, `mdx`, `tailwind-css`, `1689-confession`, `static-site-generator`

*(Note: We replaced `nextjs` with `react` and `vite` as this specific implementation is powered by Vite and React 18).*
