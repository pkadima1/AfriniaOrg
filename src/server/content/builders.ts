/**
 * builders.ts — published builder profiles for server-rendered pages (M2+).
 * EN and FR profiles are separate documents (builders_en / builders_fr).
 */
import 'server-only';
import type { Builder } from '@/integrations/firebase/types';
import { getBuilderCollectionForLang } from '@/integrations/firebase/types';
import { mapBuilder } from '@/integrations/firebase/mappers';
import type { Lang } from '@/utils/languageUtils';
import { runQuery } from './firestoreRest';
import { contentTags } from './tags';

/** Alphabetical, like the /builders directory. */
export async function getPublishedBuilders(lang: Lang): Promise<Builder[]> {
  const docs = await runQuery(getBuilderCollectionForLang(lang), {
    where: { status: 'published' },
    tags: [contentTags.builders(lang)],
  });
  return docs.map(doc => mapBuilder(doc.id, doc.data)).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPublishedBuilder(lang: Lang, slug: string): Promise<Builder | null> {
  const [doc] = await runQuery(getBuilderCollectionForLang(lang), {
    where: { status: 'published', slug },
    limit: 1,
    tags: [contentTags.builders(lang), contentTags.builder(lang, slug)],
  });
  return doc ? mapBuilder(doc.id, doc.data) : null;
}
