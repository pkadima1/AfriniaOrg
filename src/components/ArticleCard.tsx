/**
 * ArticleCard.tsx — Shared signal-article card, skeleton, brand tokens and mapper.
 *
 * WHY this exists: The blog listing and the /builders page both render the exact
 * same article card from the same Firestore posts. Extracting it here keeps ONE
 * source of truth so the two entry points never drift apart.
 *
 * Connects to: Blog.tsx (main feed) and Builders.tsx (BUILDER-filtered view).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { BlogPost as FirestorePost, PostCategory } from '@/integrations/firebase/types';
import { getCategoryLabel } from '@/constants/taxonomy';
import { type Lang, getPostUrl } from '@/utils/languageUtils';

// ── Afrinia brand tokens ──────────────────────────────────────────────────────
// Single source of truth for the card palette/fonts. Imported wherever the card
// (or a page framing it) is rendered — never re-typed in a component.
export const A = {
  bg:     '#0f172a',
  bg2:    '#131f35',
  bg3:    '#1a2744',
  gold:   '#B8912A',
  goldLt: '#d4a83a',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  serif:  "'Cormorant Garamond', Georgia, serif",
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image?: string;
  readTime: string;
  targetCountries: string[];
  contentLang: string;
  tags: string[];
}

/** Map a raw Firestore post into the shape the card renders, in the given locale. */
export function toCard(post: FirestorePost, lang: Lang): ArticleCardData {
  const words = (post.excerpt || post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || post.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '…' || '',
    category: post.category || 'analysis',
    author: post.author_name,
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })
      : post.created_at
        ? new Date(post.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })
        : '—',
    image: post.featured_image_url,
    readTime: `${mins} min${lang === 'fr' ? ' de lecture' : ' read'}`,
    targetCountries: post.target_countries ?? [],
    contentLang: post.content_language ?? lang,
    tags: post.tags ?? [],
  };
}

// ── Article card component ──────────────────────────────────────────────────
export const ArticleCard = ({ card, lang }: { card: ArticleCardData; lang: Lang }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={getPostUrl(lang, card.slug)}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article style={{
        background: A.bg2,
        borderRadius: '16px',
        border: `1px solid ${hovered ? 'rgba(184,145,42,0.4)' : A.border}`,
        overflow: 'hidden',
        transition: 'border-color 0.3s, transform 0.3s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {card.image && (
          <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s', transform: hovered ? 'scale(1.03)' : 'scale(1)' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div style={{ padding: '28px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{
              fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: A.gold, border: `1px solid rgba(184,145,42,0.25)`,
              padding: '3px 10px',
            }}>{getCategoryLabel(card.category as PostCategory, lang)}</span>
            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>{card.readTime}</span>
          </div>

          <h2 style={{
            fontFamily: A.serif, fontSize: 'clamp(18px,2vw,22px)',
            fontWeight: 400, color: A.cream,
            lineHeight: 1.3, marginBottom: 12, flex: 1,
          }}>{card.title}</h2>

          <p style={{
            fontFamily: A.sans, fontSize: 13, fontWeight: 300,
            color: A.muted, lineHeight: 1.7,
            marginBottom: 20,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{card.excerpt}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>{card.date}</span>
            <span style={{
              fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: hovered ? A.goldLt : A.gold,
              transition: 'color 0.2s',
            }}>{lang === 'fr' ? 'Lire →' : 'Read →'}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// ── Skeleton card for loading state ──────────────────────────────────────────
export const SkeletonCard = () => (
  <div style={{ background: A.bg2, borderRadius: '16px', border: `1px solid ${A.border}`, overflow: 'hidden' }}>
    <div style={{ width: '100%', aspectRatio: '16/9', background: A.bg3 }} />
    <div style={{ padding: '28px' }}>
      <div style={{ width: 80, height: 10, background: A.bg3, marginBottom: 16 }} />
      <div style={{ width: '90%', height: 18, background: A.bg3, marginBottom: 8 }} />
      <div style={{ width: '70%', height: 18, background: A.bg3, marginBottom: 20 }} />
      <div style={{ width: '100%', height: 12, background: A.bg3, marginBottom: 6 }} />
      <div style={{ width: '80%', height: 12, background: A.bg3 }} />
    </div>
  </div>
);
