import { defineCollection, z } from 'astro:content';
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
  // Only present on hbo-max.json's longer case-study-style brief.
  scope: z.string().optional(),
  problem: z.string().optional(),
  key_challenges: z.array(z.string()).optional(),
  product_team: z.array(z.string()).optional(),
  product_team_text: z.string().optional(),
  key_contributions: z.array(z.string()).optional(),
  technical_focus: z.array(z.string()).optional(),
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
    galleries: z.array(
      z.object({ title: z.string(), links: z.array(galleryLinkSchema) })
    ),
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
    })
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
      })
    ),
  }),
});

// ---- "no one knows" detail pages ----

const ammoRecordSchema = z.object({
  name: z.string(),
  type: z.string(),
  years: z.string(),
  use: z.string(),
  level: z.string(),
  percentage: z.string(),
  decorative: z.string().optional(),
  isLibrary: z.boolean().optional(),
  isFramework: z.boolean().optional(),
});

const theFixer = defineCollection({
  loader: file('src/content/the-fixer.json', { parser: asSingleEntry }),
  schema: z.object({
    toc: z.array(tocItemSchema),
    coverline: z.string(),
    ammos: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        caption: z.string(),
        data: z.array(ammoRecordSchema),
      })
    ),
  }),
});

const adventureLinkSchema = z.object({
  title: z.string().optional(),
  text: z.string(),
  href: z.string().optional(),
});

const theNavigator = defineCollection({
  loader: file('src/content/the-navigator.json', { parser: asSingleEntry }),
  schema: z.object({
    toc: z.array(tocItemSchema),
    coverline: z.string(),
    adventures: z.array(
      z.object({
        adventureNumber: z.number(),
        title: z.string(),
        period: z.string(),
        company: z.string(),
        industry: z.string(),
        role: z.string(),
        summary: z.object({
          activities: z.array(
            z.object({ title: z.string(), links: z.array(adventureLinkSchema) })
          ),
          accounts: z.array(
            z.object({
              title: z.string(),
              text: z.string(),
              links: z.array(adventureLinkSchema),
            })
          ),
        }),
      })
    ),
  }),
});

// the-server.json's `courses` array was hand-authored over time and is
// ragged: only these fields are consistently present across all entries,
// plus one legacy entry that also carries a batch of one-off fields
// (including a stray lowercase `instructor` alongside every other entry's
// `Instructor`). Modeled as optional rather than cleaned up here to avoid
// touching content as part of a schema migration.
const courseSchema = z.object({
  title: z.string(),
  academy: z.string(),
  year: z.string(),
  type: z.string(),
  certificateHref: z.string(),
  categories: z.array(z.string()),
  Instructor: z.string().optional(),
  instructor: z.string().optional(),
  country: z.string().optional(),
  role: z.string().optional(),
  nationality: z.string().optional(),
  'short-description': z.string().optional(),
  language: z.string().optional(),
  'last-updated': z.string().optional(),
  students: z.string().optional(),
  duration: z.string().optional(),
  rating: z.string().optional(),
  where: z.string().optional(),
});

const theServer = defineCollection({
  loader: file('src/content/the-server.json', { parser: asSingleEntry }),
  schema: z.object({
    toc: z.array(tocItemSchema),
    coverline: z.string(),
    courses: z.array(courseSchema),
  }),
});

export const collections = {
  projects,
  projectLayout,
  mainNavigation,
  atTheBeginning,
  noOneKnows,
  norWhereToFindHim,
  nobodyKnowsHeWorkedOn,
  theFixer,
  theNavigator,
  theServer,
};
