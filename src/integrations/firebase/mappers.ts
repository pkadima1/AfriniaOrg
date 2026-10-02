/**
 * mappers.ts — turns raw Firestore document data into the app's types.
 * WHY one module: the browser services (blogService, builderService,
 * audioService) and the server readers (src/server/content/*) must produce
 * identical objects from the same document — two mappings would drift.
 * Pure functions: no Firebase SDK, so they run anywhere.
 */
import { convertTimestamp, type AudioEpisode, type BlogPost, type Builder } from './types';

type DocData = Record<string, unknown>;

/**
 * Article. `clean` sanitizes the HTML — the browser passes cleanArticleHtml,
 * the server cleanArticleHtmlOnServer (the same cleaner, src/utils/contentSanitizer.ts).
 */
export function mapPost(id: string, d: DocData, clean: (html: string) => string): BlogPost {
  return {
    ...d,
    id,
    content: typeof d.content === 'string' ? clean(d.content) : d.content,
    created_at: convertTimestamp(d.created_at),
    updated_at: convertTimestamp(d.updated_at),
    published_at: d.published_at != null ? convertTimestamp(d.published_at) : undefined,
  } as BlogPost;
}

/** Builder profile — list fields default to [] so pages can map over them. */
export function mapBuilder(id: string, d: DocData): Builder {
  return {
    ...d,
    id,
    countries: (d.countries as string[] | undefined) ?? [],
    decisionFrameworks: (d.decisionFrameworks as Builder['decisionFrameworks'] | undefined) ?? [],
    keyFailures: (d.keyFailures as Builder['keyFailures'] | undefined) ?? [],
    mentalModels: (d.mentalModels as Builder['mentalModels'] | undefined) ?? [],
    created_at: convertTimestamp(d.created_at),
    updated_at: convertTimestamp(d.updated_at),
  } as Builder;
}

/** Audio episode (stored fields are used as they are). */
export function mapEpisode(id: string, d: DocData): AudioEpisode {
  return { ...d, id } as AudioEpisode;
}
