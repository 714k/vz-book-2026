import { defineCollection, z } from 'astro:content';
import type { ZodType } from 'zod';
import { file, glob } from 'astro/loaders';

// `file()` loader keys entries by whatever top-level keys the parsed JSON
// has. For "single blob" files (an entire page's data in one JSON object or
// array, not a list of separate content items), wrap the parsed content
// under one fixed key so the whole file becomes exactly one entry (id
// "data") instead of being split into one entry per top-level key.
const asSingleEntry = (text: string) => ({ data: JSON.parse(text) });

const tocItemSchema = z.object({
  title: z.string(),
  href: z.string(),
  text: z.string(),
  classes: z.string().optional(),
  prefixText: z.union([z.string(), z.number()]).optional(),
  sufixText: z.string().optional(),
  separator: z.string().optional(),
});

const linkSchema = z.object({
  href: z.string(),
  title: z.string(),
  text: z.string(),
});

// ---- projects: one entry per file under src/content/projects/*.json ----

const projectBriefSchema = z.object({
  title: z.string(),
  year: z.union([z.string(), z.number()]).optional(),
  timeline: z.string().optional(),
  role: z.string().optional(),
  company: z.string(),
  industry: z.string(),
  work: z.string(),
  // Only present on the case-study-style briefs (HBO Max, HBO, Aeris, Citi Banamex, Johnson & Johnson, American Airlines).
  scope: z.string().optional(),
  problem: z.string().optional(),
  key_challenges: z.array(z.string()).optional(),
  product_team: z.array(z.string()).optional(),
  product_team_text: z.string().optional(),
  key_contributions: z.array(z.string()).optional(),
  technical_focus: z.array(z.string()).optional(),
  suggested_diagrams: z.string().optional(),
  // One Mermaid diagram source string per suggested_diagrams idea.
  suggested_diagrams_charts: z.array(z.string()).optional(),
  system_impact: z.array(z.string()).optional(),
  learnings: z.array(z.string()).optional(),
  technologies: z.array(z.string()),
  status: z.string().optional(),
  links: z.array(linkSchema).optional(),
  apps: z.array(linkSchema).optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    // Redundant with brief.title; present-but-unused in a few source files.
    title: z.string().optional(),
    brief: projectBriefSchema,
    galleries: z.array(z.object({ title: z.string() })).optional(),
    projectsNavigation: z.object({
      current: z.string(),
      next: z.string(),
      previous: z.string(),
    }),
  }),
});

// ---- shared toc + gallery config used by every project page ----

const galleryLinkSchema = z.object({
  title: z.string(),
  href: z.string(),
  text: z.string(),
  separator: z.string().optional(),
});

const projectLayout = defineCollection({
  loader: file('src/content/project.json', { parser: asSingleEntry }),
  schema: z.object({
    toc: z.array(tocItemSchema),
    galleries: z.array(z.object({ title: z.string(), links: z.array(galleryLinkSchema) })),
    galleryTypes: z.array(galleryLinkSchema),
  }),
});

// ---- site navigation ----

const mainNavSubsectionSchema = z.object({
  title: z.string(),
  href: z.string(),
  classes: z.string(),
  prefixText: z.string(),
  sufixText: z.string(),
  text: z.string(),
});

const mainNavigation = defineCollection({
  loader: file('src/content/main-navigation.json', { parser: asSingleEntry }),
  schema: z.array(
    z.object({
      title: z.string(),
      href: z.string(),
      text: z.string(),
      prefixText: z.string(),
      classes: z.string().optional(),
      subsections: z.array(mainNavSubsectionSchema).optional(),
    }),
  ),
});

// ---- single-page toc/content blobs ----

const atTheBeginning = defineCollection({
  loader: file('src/content/at-the-beginning.json', { parser: asSingleEntry }),
  schema: z.object({ toc: z.array(tocItemSchema) }),
});

const noOneKnows = defineCollection({
  loader: file('src/content/no-one-knows.json', { parser: asSingleEntry }),
  schema: z.object({ toc: z.array(tocItemSchema) }),
});

const norWhereToFindHim = defineCollection({
  loader: file('src/content/nor-where-to-find-him.json', { parser: asSingleEntry }),
  schema: z.object({ toc: z.array(tocItemSchema) }),
});

const nobodyKnowsHeWorkedOn = defineCollection({
  loader: file('src/content/nobody-knows-he-worked-on.json', { parser: asSingleEntry }),
  schema: z.object({
    toc: z.array(tocItemSchema),
    summaries: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        year: z.union([z.string(), z.number()]),
        industry: z.string(),
        technologies: z.array(z.string()),
        classes: z.string(),
        link: linkSchema,
        image: z.object({ id: z.string(), src: z.string(), alt: z.string() }),
      }),
    ),
  }),
});

// ---- "no one knows" detail pages ----

// ---- book-content pages: a whole page's copy, shaped like the page itself ----
// Every text on the page lives in the JSON; the .astro file only arranges it.
// The page's parts are lists of sections, and each section shares one skeleton
// (see SectionContent in book-content/types.ts) so the page can map over
// them. `kind` on a section's body picks the component that renders it — the
// one place where these content files touch presentation.

const focusAreaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  iconName: z.string().optional(),
});

const decisionItemSchema = z.union([
  z.string(),
  z.object({ title: z.string(), description: z.string().optional() }),
]);

const impactMetricSchema = z.union([
  z.string(),
  z.object({ value: z.string().optional(), label: z.string() }),
]);

const relatedWorkItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  href: z.string().optional(),
  type: z.string().optional(),
});

// A composition tree of arbitrary depth. Zod needs the explicit annotation +
// getter because the type refers to itself. `astro:content` re-exports zod as a
// value only, so the annotation's type comes from the zod package directly.
type CompositionNode = { name: string; children?: CompositionNode[] };
const compositionNodeSchema: ZodType<CompositionNode> = z.object({
  name: z.string(),
  get children() {
    return z.array(compositionNodeSchema).optional();
  },
});

// Every diagram carries the same copy; only the body varies, so `kind`
// discriminates it and the union keeps the three bodies from being mixed.
const diagramMeta = {
  title: z.string(),
  description: z.string().optional(),
  caption: z.string(),
  summary: z.string().optional(),
  footnote: z.string().optional(),
};

const diagramSchema = z.discriminatedUnion('kind', [
  z.object({
    ...diagramMeta,
    kind: z.literal('stages'),
    stages: z.array(z.object({ name: z.string(), note: z.string().optional() })),
  }),
  z.object({ ...diagramMeta, kind: z.literal('code'), code: z.string() }),
  z.object({ ...diagramMeta, kind: z.literal('tree'), tree: z.array(compositionNodeSchema) }),
]);

const sectionBodySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('focusAreas'), items: z.array(focusAreaSchema) }),
  z.object({ kind: z.literal('decisions'), items: z.array(decisionItemSchema) }),
  z.object({ kind: z.literal('metrics'), items: z.array(impactMetricSchema) }),
  z.object({ kind: z.literal('relatedWork'), items: z.array(relatedWorkItemSchema) }),
  z.object({ kind: z.literal('list'), items: z.array(z.string()) }),
  z.object({
    kind: z.literal('groups'),
    groups: z.array(z.object({ title: z.string(), items: z.array(z.string()) })),
  }),
  z.object({
    kind: z.literal('topics'),
    items: z.array(z.object({ title: z.string(), description: z.string() })),
  }),
  z.object({
    kind: z.literal('table'),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  }),
]);

// Mirrors SectionContent: everything but the heading is optional, and
// ContentSection renders whatever is present in a fixed order.
const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  statement: z.string().optional(),
  paragraphs: z.array(z.string()).optional(),
  body: sectionBodySchema.optional(),
  closingParagraphs: z.array(z.string()).optional(),
  diagram: diagramSchema.optional(),
  closingStatement: z.string().optional(),
});

// The shape every book-content page shares. `theAssembly` and `theServer` are
// both exactly this; a page that needs extra keys of its own `.extend()`s it.
const bookContentPageSchema = z.object({
  page: z.object({
    title: z.string(),
    description: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    previousPage: z.string(),
    previousTitle: z.string(),
    nextPage: z.string(),
    nextTitle: z.string(),
  }),
  hero: z.object({
    number: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    lead: z.string().optional(),
    intro: z.string().optional(),
  }),
  metadata: z.object({
    role: z.string().optional(),
    focus: z.string().optional(),
    experience: z.string().optional(),
    scope: z.string().optional(),
    impact: z.string().optional(),
    // Custom term/value pairs, rendered in order instead of the fixed fields
    // when present (see MetadataStrip).
    items: z.array(z.object({ term: z.string(), value: z.string() })).optional(),
  }),
  labels: z.object({ core: z.string().optional(), impact: z.string().optional() }),
  primaryContent: z.array(sectionSchema),
  impact: z.array(sectionSchema),
  relatedWork: sectionSchema,
  closingThought: z.object({
    statement: z.string().optional(),
    // A closing thought can be a bare statement, so the prose is optional.
    paragraphs: z.array(z.string()).optional(),
  }),
  footer: z.object({
    sectionTitle: z.string(),
    pageTitle: z.string(),
    fileId: z.string().optional(),
    version: z.string().optional(),
    lastUpdated: z.string().optional(),
    author: z.string().optional(),
    role: z.string().optional(),
    // Sources the copy cites. The copy carries the bare marker ("[2]"); the
    // footer lists the sources in the same order (see BookFooter).
    references: z
      .array(z.object({ marker: z.string(), title: z.string(), href: z.string() }))
      .optional(),
  }),
});

const theAssembly = defineCollection({
  loader: file('src/content/the-assembly.json', { parser: asSingleEntry }),
  schema: bookContentPageSchema,
});

const theServer = defineCollection({
  loader: file('src/content/the-server.json', { parser: asSingleEntry }),
  // `coverline` is the cover blurb the two index pages pull from this file
  // (see at-the-beginning/index.astro and no-one-knows/index.astro). It belongs
  // to those covers rather than to this page's anatomy, so it sits outside it.
  schema: bookContentPageSchema.extend({ coverline: z.string() }),
});

const theNavigator = defineCollection({
  loader: file('src/content/the-navigator.json', { parser: asSingleEntry }),
  // Same shape as theServer: a book-content page plus the `coverline` blurb the
  // two index pages read (see at-the-beginning/index.astro and
  // no-one-knows/index.astro).
  schema: bookContentPageSchema.extend({ coverline: z.string() }),
});

const theFixer = defineCollection({
  loader: file('src/content/the-fixer.json', { parser: asSingleEntry }),
  // Same shape as theServer and theNavigator: a book-content page plus the
  // `coverline` blurb the two index covers read. It held the older `toc` +
  // `ammos` skills matrix until the section was rewritten as written copy
  // (see ADR 0011).
  schema: bookContentPageSchema.extend({ coverline: z.string() }),
});

const theMap = defineCollection({
  loader: file('src/content/the-map.json', { parser: asSingleEntry }),
  // A plain book-content page, like theAssembly: no `coverline`, since no index
  // cover reads from it.
  schema: bookContentPageSchema,
});

const thePattern = defineCollection({
  loader: file('src/content/the-pattern.json', { parser: asSingleEntry }),
  // A plain book-content page, like theAssembly and theMap: no `coverline`.
  schema: bookContentPageSchema,
});

const theSignal = defineCollection({
  loader: file('src/content/the-signal.json', { parser: asSingleEntry }),
  // A plain book-content page, like theAssembly, theMap, and thePattern.
  schema: bookContentPageSchema,
});

const theIntegrator = defineCollection({
  loader: file('src/content/the-integrator.json', { parser: asSingleEntry }),
  // A plain book-content page, like the other "how he thinks" architecture pages.
  schema: bookContentPageSchema,
});

export const collections = {
  projects,
  projectLayout,
  mainNavigation,
  atTheBeginning,
  noOneKnows,
  norWhereToFindHim,
  nobodyKnowsHeWorkedOn,
  theAssembly,
  theFixer,
  theNavigator,
  theServer,
  theMap,
  thePattern,
  theSignal,
  theIntegrator,
};
