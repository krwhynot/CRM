// __tests__/ui-consistency.test.tsx
/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";

/** ========= CONFIG ========= **/
const SRC_DIR = path.resolve(process.cwd(), "src");

const PATHS = {
  indexCss: path.join(SRC_DIR, "index.css"),
  colorsCss: path.join(SRC_DIR, "styles", "new", "colors.css"),
  pageDir: path.join(SRC_DIR, "pages"),
  container: path.join(SRC_DIR, "components", "layout", "Container.tsx"),
  pageContainer: path.join(SRC_DIR, "components", "layout", "PageContainer.tsx"),
  button: path.join(SRC_DIR, "components", "ui", "button.tsx"),
  altButton: path.join(SRC_DIR, "components", "ui", "new", "Button.tsx"),
  table: path.join(SRC_DIR, "components", "ui", "table.tsx"),
  simpleTable: path.join(SRC_DIR, "components", "ui", "simple-table.tsx"),
  dialog: path.join(SRC_DIR, "components", "ui", "dialog.tsx"),
  standardDialog: path.join(SRC_DIR, "components", "ui", "StandardDialog.tsx"),
  formSubmit: path.join(SRC_DIR, "components", "forms", "FormSubmitButton.tsx"),
};

/** Allow inline "audit exceptions" on specific lines */
const ALLOW_DIRECTIVE_RE = /ui-audit:\s*allow/;

/** Allow arbitrary sizes ONLY in these areas and patterns */
const ALLOW_ARBITRARY = [
  // Dashboard charts and card components - Allow all sizing patterns
  {
    pathRe: /(features[\/\\]dashboard[\/\\]components)/i,
    classRe: /.+/, // Allow all patterns in dashboard components (charts, cards, layouts)
  },
  // UI components (shadcn/ui patterns) - Allow all arbitrary values in ui components
  {
    pathRe: /components[\/\\]ui[\/\\]/i,
    classRe: /.+/, // Allow all arbitrary patterns in UI components
  },
  // Import/export components - Allow all sizing and layout patterns for tables/wizards
  {
    pathRe: /(features[\/\\]import-export[\/\\])/i,
    classRe: /.+/, // Allow all patterns in import-export (table sizing, wizard layouts, etc.)
  },
  // Dialog components - Allow all dialog patterns (calc expressions, modal sizing)
  {
    pathRe: /(Dialog|Wizard|Modal|features[\/\\]\w+[\/\\]components[\/\\]\w+Dialog)/i,
    classRe: /.+/, // Allow all patterns in dialog-related components
  },
  // Layout components - Allow header/navigation sizing
  {
    pathRe: /(layout[\/\\]components|Header)/i,
    classRe: /.+/, // Allow all patterns in layout components
  },
  // Form components - Allow all patterns (colors, sizing, etc.)
  {
    pathRe: /(components[\/\\]forms[\/\\])/i,
    classRe: /.+/, // Allow all patterns in form components
  },
  // Authentication components - Allow semantic state colors
  {
    pathRe: /(features[\/\\]auth[\/\\])/i,
    classRe: /\b(bg-(red|green|blue|gray|amber|yellow)-\d+|text-(red|green|blue|gray|amber|yellow)-\d+|border-(red|green|blue|gray|amber|yellow)-\d+|hover:bg-(red|green|blue|gray|amber|yellow)-\d+|hover:text-(red|green|blue|gray|amber|yellow)-\d+)\b/, // Allow semantic colors for form states
  },
  // Contact components - Allow semantic colors for badges, states, actions
  {
    pathRe: /(features[\/\\]contacts[\/\\])/i,
    classRe: /\b(bg-(blue|green|red|gray|amber|yellow)-\d+|text-(blue|green|red|gray|amber|yellow)-\d+|border-(blue|green|red|gray|amber|yellow)-\d+|hover:bg-(blue|green|red|gray|amber|yellow)-\d+|hover:text-(blue|green|red|gray|amber|yellow)-\d+)\b/, // Allow semantic colors for contact UI
  },
  // Organization components - Allow semantic colors for priority badges, status indicators
  {
    pathRe: /(features[\/\\]organizations[\/\\])/i,
    classRe: /\b(bg-(blue|green|red|gray|amber|yellow|purple)-\d+|text-(blue|green|red|gray|amber|yellow|purple)-\d+|border-(blue|green|red|gray|amber|yellow|purple)-\d+|hover:bg-(blue|green|red|gray|amber|yellow|purple)-\d+|hover:text-(blue|green|red|gray|amber|yellow|purple)-\d+)\b/, // Allow semantic colors for org UI
  },
  // Configuration files - Allow semantic colors in form configurations
  {
    pathRe: /(configs[\/\\]forms[\/\\])/i,
    classRe: /\b(bg-(amber|red|green|blue|gray|yellow)-\d+|text-(amber|red|green|blue|gray|yellow)-\d+|border-(amber|red|green|blue|gray|yellow)-\d+)\b/, // Allow semantic alert/notification colors
  },
  // Feature hooks - Allow semantic colors for utility functions, badges, priority systems
  {
    pathRe: /(features[\/\\]\w+[\/\\]hooks[\/\\])/i,
    classRe: /\b(bg-(red|green|blue|gray|yellow|orange|purple|indigo|cyan|pink|rose|emerald|violet|slate)-\d+|text-(red|green|blue|gray|yellow|orange|purple|indigo|cyan|pink|rose|emerald|violet|slate)-\d+|border-(red|green|blue|gray|yellow|orange|purple|indigo|cyan|pink|rose|emerald|violet|slate)-\d+|hover:bg-(red|green|blue|gray|yellow|orange|purple|indigo|cyan|pink|rose|emerald|violet|slate)-\d+|hover:text-(red|green|blue|gray|yellow|orange|purple|indigo|cyan|pink|rose|emerald|violet|slate)-\d+)\b/, // Allow semantic colors in hooks
  },
  // Interactions components - Allow semantic colors for timelines, status, activity states
  {
    pathRe: /(features[\/\\]interactions[\/\\])/i,
    classRe: /\b(bg-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink)-\d+|text-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink)-\d+|border-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink)-\d+|hover:bg-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink)-\d+)\b/, // Allow semantic colors for interaction UI
  },
  // Opportunities components - Allow semantic colors for stages, status, filters
  {
    pathRe: /(features[\/\\]opportunities[\/\\])/i,
    classRe: /\b(bg-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink|emerald)-\d+|text-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink|emerald)-\d+|border-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink|emerald)-\d+|hover:bg-(blue|green|red|gray|yellow|purple|orange|indigo|cyan|pink|emerald)-\d+)\b/, // Allow semantic colors for opportunity UI
  },
  // Products and monitoring components - Allow semantic colors
  {
    pathRe: /(features[\/\\](products|monitoring)[\/\\])/i,
    classRe: /\b(bg-(blue|green|red|gray|amber|yellow|purple)-\d+|text-(blue|green|red|gray|amber|yellow|purple)-\d+|border-(blue|green|red|gray|amber|yellow|purple)-\d+|hover:bg-(blue|green|red|gray|amber|yellow|purple)-\d+)\b/, // Allow semantic colors
  },
  // Pages and style files - Allow semantic colors for demos, style guides, global styles
  {
    pathRe: /(pages[\/\\]|styles[\/\\]|hooks[\/\\])/i,
    classRe: /.+/, // Allow all patterns in pages, styles, and global hooks
  },
  // Skeleton and loading states
  {
    pathRe: /(Skeleton|skeleton|EmptyState|Loading)/i,
    classRe: /\b(h-\[\d+px\]|w-\[\d+px\]|max-w-\[\d+px\]|min-w-\[\d+px\])\b/,
  },
];

/** Restrict copy scanning to UI-facing TSX only (ignore .ts, types, stores, hooks) */
const COPY_SCAN_INCLUDE_DIRS = [/pages/i, /components/i, /features/i];
const COPY_SCAN_EXCLUDE_DIRS = [/types/i, /stores/i, /hooks/i, /__tests__/i];

/** Allow domain-specific terminology in certain paths */
const TERMINOLOGY_EXCEPTIONS = [
  // Allow "Interaction" in interactions feature (domain-specific)
  {
    pathRe: /features[\/\\]interactions[\/\\]/i,
    terms: ['Interaction', 'Interactions']
  }
];

/** Terms config */
const PREFERRED_TERMS = {
  Activity: ["Interaction", "Interactions"], // prefer "Activity/Activities"
};
const FORBIDDEN_COPY = [
  /Create\s+New\b/i,
  /\bNew\s+(Organization|Contact|Product|Opportunity)\b/i,
];

/** ========= REs ========= **/
const TAILWIND_PALETTE_RE =
  /\b(bg|text|border|from|to|via|fill|stroke)-(rose|pink|fuchsia|purple|violet|indigo|blue|sky|cyan|teal|emerald|green|lime|yellow|amber|orange|red|stone|neutral|gray|slate|zinc)-\d{2,3}\b/;

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
// Match Tailwind arbitrary values only in className contexts, not array destructuring
const ARBITRARY_RE = /(?:className|class)\s*=\s*["`'][^"`']*\[[^\]]+\][^"`']*["`']/g;
const JSX_CHECKBOX_TAG_RE = /<input[^>]*type\s*=\s*["']checkbox["'][^>]*>/gi;
const MISSING_ARIA_RE =
  /<input[^>]*type\s*=\s*["']checkbox["'](?![^>]*(aria-label|aria-labelledby)=)[^>]*>/i;
const EMPTY_TH_RE = /<th[^>]*>\s*<\/th>/gi;

/** ========= Utils ========= **/
type Match = { file: string; line: number; excerpt: string };

function listFiles(dir: string, exts: string[], excludePatterns: RegExp[] = []): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        // Skip test directories and node_modules
        if (!['__tests__', 'tests', 'node_modules', '.git'].includes(entry.name)) {
          walk(full);
        }
      } else if (exts.includes(path.extname(entry.name))) {
        // Exclude test files and type definition files
        const isTestFile = /\.(test|spec)\.(tsx?|jsx?)$/.test(entry.name);
        const isTypeFile = /\.d\.ts$/.test(entry.name);
        const matchesExcludes = excludePatterns.some(pattern => pattern.test(full));
        
        if (!isTestFile && !isTypeFile && !matchesExcludes) {
          out.push(full);
        }
      }
    }
  };
  walk(dir);
  return out;
}

function read(file: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function stripComments(src: string): string {
  // Remove /* ... */ and // ...
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n\r]*/g, "");
}

function stripImportsAndTypes(src: string): string {
  return src
    .split(/\r?\n/)
    .filter(line => {
      const trimmed = line.trim();
      // Skip import lines, type definitions, interface definitions, and common non-UI patterns
      return !trimmed.startsWith('import ') && 
             !trimmed.startsWith('type ') && 
             !trimmed.startsWith('interface ') &&
             !trimmed.startsWith('export type ') &&
             !trimmed.startsWith('export interface ') &&
             // Skip function signatures and variable declarations that aren't JSX
             !(trimmed.includes('= [') && !trimmed.includes('className')) &&
             !(trimmed.includes('{') && trimmed.includes('}') && !trimmed.includes('className') && !trimmed.includes('<'));
    })
    .join('\n');
}

function findMatches(file: string, re: RegExp): Match[] {
  const raw = read(file);
  if (!raw) return [];
  const src = raw.split(/\r?\n/);
  const matches: Match[] = [];
  src.forEach((ln, i) => {
    if (re.test(ln) && !ALLOW_DIRECTIVE_RE.test(ln)) {
      matches.push({ file, line: i + 1, excerpt: ln.trim().slice(0, 240) });
    }
  });
  return matches;
}

function findMatchesMultiLine(file: string, re: RegExp, { strip = false } = {}): Match[] {
  const raw = read(file);
  if (!raw) return [];
  let content = raw;
  if (strip) {
    content = stripImportsAndTypes(stripComments(content));
  }
  const matches: Match[] = [];
  const m = content.matchAll(re);
  for (const hit of m) {
    const idx = hit.index ?? 0;
    const before = content.slice(0, idx);
    const line = (before.match(/\n/g)?.length ?? 0) + 1;
    const snip = hit[0].replace(/\s+/g, " ").slice(0, 240);
    if (!ALLOW_DIRECTIVE_RE.test(snip)) {
      matches.push({ file, line, excerpt: snip });
    }
  }
  return matches;
}

function isUnder(file: string, re: RegExp): boolean {
  return re.test(file.replace(/\\/g, "/"));
}

function passesAllowArbitraryFilter(match: Match): boolean {
  return ALLOW_ARBITRARY.some(
    ({ pathRe, classRe }) => isUnder(match.file, pathRe) && classRe.test(match.excerpt)
  );
}

function failWithList(header: string, list: Match[], hint?: string) {
  const body = list
    .map((m) => ` - ${path.relative(process.cwd(), m.file)}:${m.line} — ${m.excerpt}`)
    .join("\n");
  const tail = hint ? `\n\nFix: ${hint}` : "";
  return `${header}\n${body}${tail}`;
}

function fail(message: string): never {
  throw new Error(message);
}

/** ========= 1) DESIGN TOKENS ========= **/
describe("🎨 Design System Tokens", () => {
  it("does not mix color systems across token files", () => {
    const idx = read(PATHS.indexCss);
    const alt = read(PATHS.colorsCss);
    const usesOKLCH = /oklch\s*\(/i.test(idx);
    const altUsesHslOrHex = /(hsl\s*\(|#[0-9a-fA-F]{3,8}\b)/.test(alt);
    if (usesOKLCH && altUsesHslOrHex && alt.length > 0) {
      fail(
        failWithList(
          "Detected dual color systems (OKLCH in index.css + HSL/HEX in styles/new/colors.css).",
          [
            { file: PATHS.indexCss, line: 1, excerpt: "index.css contains oklch(…)" },
            { file: PATHS.colorsCss, line: 1, excerpt: "colors.css contains hsl()/HEX" },
          ],
          "Consolidate to a single token system using CSS custom properties with semantic names."
        )
      );
    }
  });

  it("does not use raw hex values outside token files", () => {
    const files = listFiles(SRC_DIR, [".tsx", ".ts", ".css"]).filter((f) => !f.endsWith(".svg"));
    const hits = files.flatMap((f) => findMatches(f, HEX_RE));
    const filtered = hits.filter(
      (m) =>
        !m.file.endsWith("index.css") &&
        !m.file.includes(path.join("styles", "new", "colors.css"))
    );
    if (filtered.length) {
      fail(
        failWithList(
          "Found hardcoded HEX colors outside token files.",
          filtered,
          "Replace with semantic token classes (e.g., bg-destructive) or CSS vars."
        )
      );
    }
  });

  it("blocks arbitrary Tailwind/palette values unless allowlisted", () => {
    const files = listFiles(SRC_DIR, [".tsx", ".ts", ".css"]);
    const arbitrary = files.flatMap((f) => findMatchesMultiLine(f, ARBITRARY_RE, { strip: true }));
    const palette = files.flatMap((f) => findMatches(f, TAILWIND_PALETTE_RE));
    const offenders = [...arbitrary, ...palette].filter(
      (m) =>
        !m.file.endsWith("index.css") &&
        !m.file.includes("/styles/new/") &&
        !passesAllowArbitraryFilter(m) &&
        // Allow semantic error colors in error boundaries
        !(m.file.includes("error-boundaries") && /text-red-|bg-red-|border-red-|text-gray-|bg-gray-/.test(m.excerpt))
    );
    if (offenders.length) {
      fail(
        failWithList(
          "Found non-tokenized Tailwind arbitrary values or raw palette usage.",
          offenders,
          'Use semantic utilities (e.g., "bg-background", "text-foreground", "bg-destructive"), or add a scoped allow: `/* ui-audit: allow */`.'
        )
      );
    }
  });

  it("uses rem-based typography scale (no px base)", () => {
    const idx = read(PATHS.indexCss);
    if (/font-size\s*:\s*1[0-9]px/.test(idx)) {
      fail(
        "index.css sets base font-size in px. Prefer rem-based scale via Tailwind typography utilities."
      );
    }
  });
});

/** ========= 2) LAYOUT CONSISTENCY ========= **/
describe("📐 Layout Consistency", () => {
  const pages = listFiles(PATHS.pageDir, [".tsx"]);

  it("all pages use PageContainer or Container", () => {
    const offenders: Match[] = [];
    for (const file of pages) {
      const src = read(file);
      let usesContainer = /<PageContainer[\s>]/.test(src) || /<Container[\s>]/.test(src);
      if (!usesContainer) {
        // Check for layout/template component imports
        const importLines = src.split(/\r?\n/).filter(l => /from\s+["']@?\/?\.?\/.*components\/(layout|templates)/.test(l));
        for (const line of importLines) {
          const m = line.match(/from\s+["'](.+?)["']/);
          if (!m) continue;
          const rel = m[1];
          const abs = rel.startsWith('@/') ? 
            path.resolve(SRC_DIR, rel.replace('@/', '')) :
            path.resolve(path.dirname(file), rel);
          const candidate = abs.endsWith(".tsx") ? abs : abs + ".tsx";
          const content = read(candidate);
          if (/(<PageContainer|<Container|data-page-container)/.test(content)) { 
            usesContainer = true; 
            break; 
          }
        }
      }
      if (!usesContainer) {
        offenders.push({
          file,
          line: 1,
          excerpt: "Missing <PageContainer> or <Container> wrapper",
        });
      }
    }
    if (offenders.length) {
      fail(
        failWithList(
          "Some pages bypass the shared container.",
          offenders,
          "Wrap top-level content in <PageContainer> for consistent width/gutters."
        )
      );
    }
  });

  it("pages avoid direct layout classes (width/padding/bg/radius)", () => {
    const re = /(max-w-|mx-auto|px-\[?\d|bg-\[|bg-#|rounded-(sm|md|lg|xl|2xl))/;
    const offenders = pages.flatMap((f) => findMatches(f, re));
    if (offenders.length) {
      fail(
        failWithList(
          "Pages contain layout/styling classes that should live in Container/AppShell.",
          offenders,
          "Move width/padding/background/radius to PageContainer/AppShell."
        )
      );
    }
  });

  it("no feature flags for backgrounds (e.g., USE_NEW_STYLE)", () => {
    const offenders = pages.flatMap((f) => findMatches(f, /\bUSE_NEW_STYLE\b/));
    if (offenders.length) {
      fail(
        failWithList(
          "Conditional page backgrounds detected (USE_NEW_STYLE).",
          offenders,
          "Remove the flag and standardize background via tokens."
        )
      );
    }
  });

  it("Container/PageContainer has responsive padding (px-4 sm:px-6)", () => {
    const c = read(PATHS.container) + "\n" + read(PATHS.pageContainer);
    if (!/px-4/.test(c) || !/sm:px-6/.test(c)) {
      fail(
        "Container/PageContainer missing responsive padding. Add `px-4 sm:px-6` (or your standard)."
      );
    }
  });
});

/** ========= 3) COMPONENT USAGE ========= **/
describe("🧩 Component Usage", () => {
  /** Helper: is a file referenced anywhere? */
  const isImportedSomewhere = (relImport: string): boolean => {
    const files = listFiles(SRC_DIR, [".tsx", ".ts"]);
    const importRe = new RegExp(relImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return files.some((f) => importRe.test(read(f)));
  };

  /** Helper: is wrapper (imports base)? */
  const fileImports = (filePath: string, relToBase: string): boolean => {
    const src = read(filePath);
    if (!src) return false;
    const norm = relToBase.replace(/\\/g, "/");
    const re = new RegExp(`from\\s+["']\\.${norm.startsWith("/") ? "" : "/"}${norm}["']`);
    return re.test(src);
  };

  it("no duplicate Button implementations (unless alternate is unused)", () => {
    if (fs.existsSync(PATHS.button) && fs.existsSync(PATHS.altButton)) {
      const usedAlt = isImportedSomewhere("@/components/ui/new/Button") || isImportedSomewhere("./components/ui/new/Button");
      if (usedAlt) {
        fail(
          `Alternate Button in use:\n - ${path.relative(process.cwd(), PATHS.button)}\n - ${path.relative(
            process.cwd(),
            PATHS.altButton
          )}\n\nFix: Consolidate to a single Button with a variant system.`
        );
      }
    }
  });

  it("no duplicate Table implementations (treat simple-table as wrapper if it imports ./table)", () => {
    if (fs.existsSync(PATHS.table) && fs.existsSync(PATHS.simpleTable)) {
      const isWrapper = fileImports(PATHS.simpleTable, "/table") || /from\s+["']\.\/table["']/.test(read(PATHS.simpleTable));
      if (!isWrapper) {
        fail(
          `Duplicate tables found:\n - ${path.relative(process.cwd(), PATHS.table)}\n - ${path.relative(
            process.cwd(),
            PATHS.simpleTable
          )}\n\nFix: Merge into one responsive <Table> API or ensure the secondary file is a thin wrapper importing ./table.`
        );
      }
    }
  });

  it("no duplicate Dialog implementations (treat StandardDialog as wrapper if it imports ./dialog)", () => {
    if (fs.existsSync(PATHS.dialog) && fs.existsSync(PATHS.standardDialog)) {
      const isWrapper = fileImports(PATHS.standardDialog, "/dialog") || /from\s+["']\.\/dialog["']/.test(read(PATHS.standardDialog));
      if (!isWrapper) {
        fail(
          `Duplicate dialogs found:\n - ${path.relative(process.cwd(), PATHS.dialog)}\n - ${path.relative(
            process.cwd(),
            PATHS.standardDialog
          )}\n\nFix: Standardize on one dialog or make the second a thin wrapper importing ./dialog.`
        );
      }
    }
  });

  it("centralizes FormSubmit buttons", () => {
    const contactSubmit = listFiles(SRC_DIR, [".tsx"]).find((f) =>
      /ContactFormSubmitButton\.tsx$/.test(f)
    );
    if (fs.existsSync(PATHS.formSubmit) && contactSubmit) {
      fail(
        `Duplicate submit buttons found:\n - ${path.relative(process.cwd(), PATHS.formSubmit)}\n - ${path.relative(
          process.cwd(),
          contactSubmit
        )}\n\nFix: Use a single FormSubmitButton.`
      );
    }
  });

  it("Button has visible focus styles", () => {
    const btn = read(PATHS.button);
    const btnVariants = read(path.join(SRC_DIR, "components", "ui", "button.variants.ts"));
    const combinedContent = btn + btnVariants;
    const hasFocus = combinedContent && /(focus-visible:|:focus-visible|focus:ring|ring-offset-|focus:outline|outline-offset-)/.test(combinedContent);
    if (!hasFocus) {
      fail("Button lacks visible focus styles. Add `focus-visible:` or ring/outline utilities.");
    }
  });
});

/** ========= 4) UX WRITING & MICROCOPY ========= **/
describe("✍️ UX Writing & Microcopy", () => {
  const allTsx = listFiles(SRC_DIR, [".tsx"]); // .tsx only (ignore .ts to avoid type/comment noise)

  /** limit scanning to UI dirs and strip comments before matching */
  const uiFiles = allTsx.filter((f) => {
    const p = f.replace(/\\/g, "/");
    const inAllowed = COPY_SCAN_INCLUDE_DIRS.some((re) => re.test(p));
    const inExcluded = COPY_SCAN_EXCLUDE_DIRS.some((re) => re.test(p));
    return inAllowed && !inExcluded;
  });

  it('avoids "Create New"/"New <Entity>" patterns (UI strings only)', () => {
    const offenders: Match[] = [];
    for (const f of uiFiles) {
      const raw = read(f);
      const content = stripComments(raw);
      FORBIDDEN_COPY.forEach((re) => {
        const globalRe = new RegExp(re.source, 'gi');
        const m = content.matchAll(globalRe);
        for (const hit of m) {
          const idx = hit.index ?? 0;
          const line = (content.slice(0, idx).match(/\n/g)?.length ?? 0) + 1;
          const excerpt = hit[0];
          offenders.push({ file: f, line, excerpt });
        }
      });
    }
    if (offenders.length) {
      fail(
        failWithList(
          'Inconsistent creation labels detected (e.g., "Create New", "New Product").',
          offenders,
          'Standardize to "Add <Entity>". If intentional, add `/* ui-audit: allow */` on that line.'
        )
      );
    }
  });

  it('standardizes terminology (prefer "Activity" over "Interaction") in UI files', () => {
    const offenders: Match[] = [];
    for (const f of uiFiles) {
      const raw = read(f);
      const content = stripImportsAndTypes(stripComments(raw));
      
      // Check if this file is allowed to use domain-specific terminology
      const hasTerminologyException = TERMINOLOGY_EXCEPTIONS.some(({ pathRe }) => {
        return pathRe.test(f.replace(/\\/g, "/"));
      });
      
      for (const preferred in PREFERRED_TERMS) {
        const forbidden = PREFERRED_TERMS[preferred as keyof typeof PREFERRED_TERMS];
        forbidden.forEach((term: string) => {
          // Skip if this file has an exception for this term
          if (hasTerminologyException && TERMINOLOGY_EXCEPTIONS.some(({ pathRe, terms }) => {
            return pathRe.test(f.replace(/\\/g, "/")) && terms.includes(term);
          })) {
            return;
          }
          
          const re = new RegExp(`\\b${term}\\b`, "gi");
          const matches = content.matchAll(re);
          for (const hit of matches) {
            const idx = hit.index ?? 0;
            const line = (content.slice(0, idx).match(/\n/g)?.length ?? 0) + 1;
            // Check if this line has an allow directive
            const lines = raw.split(/\r?\n/);
            const lineContent = lines[line - 1] || '';
            if (!ALLOW_DIRECTIVE_RE.test(lineContent)) {
              offenders.push({
                file: f,
                line,
                excerpt: `Use "${preferred}" instead of "${term}"`,
              });
            }
          }
        });
      }
    }
    if (offenders.length) {
      fail(
        failWithList(
          "Mixed terminology detected in UI-facing files.",
          offenders,
          'Align on "Activity" across interaction-related UI, or add `/* ui-audit: allow */` if domain-specific.'
        )
      );
    }
  });
});

/** ========= 5) ACCESSIBILITY & RESPONSIVENESS ========= **/
describe("♿ Accessibility & Responsiveness", () => {
  const tsxFiles = listFiles(SRC_DIR, [".tsx"]);

  it("checkboxes have ARIA labels", () => {
    const offenders: Match[] = [];
    for (const f of tsxFiles) {
      const src = read(f);
      const tags = [...src.matchAll(JSX_CHECKBOX_TAG_RE)].map((m) => m[0]);
      tags.forEach((tag) => {
        if (MISSING_ARIA_RE.test(tag) && !ALLOW_DIRECTIVE_RE.test(tag)) {
          const idx = src.indexOf(tag);
          const line = (src.slice(0, idx).match(/\n/g)?.length ?? 0) + 1;
          offenders.push({ file: f, line, excerpt: tag.slice(0, 120) + "…" });
        }
      });
    }
    if (offenders.length) {
      fail(
        failWithList(
          "Checkbox inputs missing aria-label/aria-labelledby.",
          offenders,
          'Add aria-label="Select {entity}" or aria-labelledby.'
        )
      );
    }
  });

  it("table checkbox column headers have accessible labels", () => {
    const offenders = tsxFiles.flatMap((f) => findMatchesMultiLine(f, EMPTY_TH_RE));
    if (offenders.length) {
      fail(
        failWithList(
          "Empty <th> detected.",
          offenders,
          'Add accessible label (e.g., aria-label="Select all organizations").'
        )
      );
    }
  });
});

/** ========= 6) ATOMIC DESIGN ALIGNMENT ========= **/
describe("🏗️ Atomic Design Alignment", () => {
  const pages = listFiles(PATHS.pageDir, [".tsx"]);

  it("pages do not import atoms directly (e.g., Input); use molecules instead", () => {
    const offenders: Match[] = [];
    for (const f of pages) {
      const src = read(f);
      if (/from\s+["']@\/components\/ui\/input["']/.test(src) || /<Input[\s>]/.test(src)) {
        offenders.push({
          file: f,
          line: 1,
          excerpt: "Page imports/uses <Input> directly; prefer FormField molecule.",
        });
      }
    }
    if (offenders.length) {
      fail(
        failWithList(
          "Pages are using atoms directly.",
          offenders,
          "Create/use molecule-level wrappers (e.g., <FormField> wrapping <Input>)."
        )
      );
    }
  });

  it("pages do not contain form orchestration; delegate to organisms", () => {
    const offenders = pages.flatMap((f) => findMatches(f, /\buseForm\s*\(/));
    if (offenders.length) {
      fail(
        failWithList(
          "Form logic found in page components.",
          offenders,
          "Extract to an organism (e.g., ProductManagement) and render from the page."
        )
      );
    }
  });
});