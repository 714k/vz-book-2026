import { getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';

// Single-entry ("data") content collections are always populated by the
// `file()` loader at build time - the only way `getEntry` returns undefined
// for them is a genuinely missing/malformed content file, which should fail
// loudly rather than propagate `undefined` through the page.
export async function getRequiredEntry<C extends CollectionKey>(
  collection: C,
  id: string,
): Promise<CollectionEntry<C>> {
  const entry = await getEntry(collection, id);
  if (!entry) {
    throw new Error(`Missing required content entry: ${collection}/${id}`);
  }
  return entry as CollectionEntry<C>;
}
