// @vitest-environment node
// `astro:content` only resolves in a server-side environment, unlike the
// jsdom environment the rest of the suite uses for DOM-dependent tests.
import { getCollection } from 'astro:content';
import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('projects content collection', () => {
  it('parses every project JSON file against the Zod schema', async () => {
    const projects = await getCollection('projects');
    const filesOnDisk = readdirSync('./src/content/projects').filter((file) =>
      file.endsWith('.json'),
    );

    expect(projects).toHaveLength(filesOnDisk.length);

    for (const project of projects) {
      expect(project.data.brief.title).toBeTruthy();
      expect(project.data.brief.company).toBeTruthy();
      expect(project.data.projectsNavigation.current).toBeTruthy();
    }
  });

  it('links every project to a previous/next name that resolves to a real project id', async () => {
    // Mirrors the slugification ProjectsNavigation.astro applies to these
    // display names (`previous.split(' ').join('-').toLowerCase()`). An empty
    // string is a valid sentinel meaning "no link" (start/end of the chain) -
    // ProjectsNavigation.astro itself skips rendering with `{previous && ...}`.
    const toKebabId = (displayName: string) => displayName.split(' ').join('-').toLowerCase();

    const projects = await getCollection('projects');
    const ids = new Set(projects.map((project) => project.id));

    for (const project of projects) {
      const { previous, next } = project.data.projectsNavigation;
      if (previous) expect(ids.has(toKebabId(previous))).toBe(true);
      if (next) expect(ids.has(toKebabId(next))).toBe(true);
    }
  });
});
