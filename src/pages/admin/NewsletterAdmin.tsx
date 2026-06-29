/**
 * NewsletterAdmin.tsx — Admin interface for composing and sending newsletter broadcasts.
 *
 * Accessible at /admin/newsletter (admin role only).
 *
 * Capabilities:
 *   - Live subscriber count (EN / FR / total) fetched from Firestore
 *   - Bilingual compose: separate subject + body fields for EN and FR
 *   - Language filter: send to EN subscribers / FR subscribers / All
 *   - HTML preview of the rendered email
 *   - Authenticated send via POST /.netlify/functions/send-newsletter
 *     (Firebase ID token verified server-side — only admins can trigger sends)
 *
 * Future extensions: scheduling, open-rate tracking, send history log.
 */

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Send, Eye, EyeOff, Loader2, Users, Globe } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubscriberStats {
  total: number;
  en: number;
  fr: number;
  loading: boolean;
}

type LangFilter = 'all' | 'en' | 'fr';

interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

// ── Copy (bilingual admin UI) ─────────────────────────────────────────────────

const UI = {
  en: {
    title: 'Newsletter',
    subtitle: 'Compose and send to your subscriber list',
    statsLabel: 'Active subscribers',
    allLang: 'All languages',
    sendTo: (n: number, filter: LangFilter) => {
      const lang = filter === 'en' ? 'English' : filter === 'fr' ? 'French' : 'all';
      return `Send to ${n} ${lang} subscriber${n !== 1 ? 's' : ''}`;
    },
    subjectEnLabel: 'Subject (English)',
    subjectFrLabel: 'Subject (French)',
    bodyEnLabel: 'Body (English) — HTML allowed',
    bodyFrLabel: 'Body (French) — HTML allowed',
    frFallback: 'Leave blank to use English content for French subscribers',
    previewLabel: 'Preview',
    hidePreview: 'Hide preview',
    confirmTitle: 'Confirm send',
    confirmBody: (n: number) => `You are about to send an email to ${n} subscriber${n !== 1 ? 's' : ''}. This cannot be undone.`,
    cancel: 'Cancel',
    confirm: 'Send now',
    successMsg: (r: SendResult) => `Sent to ${r.sent} subscriber${r.sent !== 1 ? 's' : ''}${r.failed > 0 ? `. ${r.failed} failed.` : '.'}`,
    errorMsg: 'Send failed. Check the console and try again.',
    missingFields: 'English subject and body are required.',
    noSubscribers: 'No active subscribers match the selected language filter.',
  },
  fr: {
    title: 'Newsletter',
    subtitle: 'Rédigez et envoyez à votre liste d\'abonnés',
    statsLabel: 'Abonnés actifs',
    allLang: 'Toutes les langues',
    sendTo: (n: number, filter: LangFilter) => {
      const lang = filter === 'en' ? 'anglophones' : filter === 'fr' ? 'francophones' : 'au total';
      return `Envoyer à ${n} abonné${n !== 1 ? 's' : ''} ${lang}`;
    },
    subjectEnLabel: 'Objet (anglais)',
    subjectFrLabel: 'Objet (français)',
    bodyEnLabel: 'Corps (anglais) — HTML autorisé',
    bodyFrLabel: 'Corps (français) — HTML autorisé',
    frFallback: 'Laissez vide pour utiliser le contenu anglais pour les abonnés francophones',
    previewLabel: 'Aperçu',
    hidePreview: 'Masquer l\'aperçu',
    confirmTitle: 'Confirmer l\'envoi',
    confirmBody: (n: number) => `Vous êtes sur le point d\'envoyer un e-mail à ${n} abonné${n !== 1 ? 's' : ''}. Cette action est irréversible.`,
    cancel: 'Annuler',
    confirm: 'Envoyer maintenant',
    successMsg: (r: SendResult) => `Envoyé à ${r.sent} abonné${r.sent !== 1 ? 's' : ''}${r.failed > 0 ? `. ${r.failed} échec(s).` : '.'}`,
    errorMsg: 'L\'envoi a échoué. Vérifiez la console et réessayez.',
    missingFields: 'L\'objet et le corps en anglais sont obligatoires.',
    noSubscribers: 'Aucun abonné actif ne correspond au filtre de langue sélectionné.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export const NewsletterAdmin = () => {
  const { user, userProfile } = useAuth();
  // Admin UI language follows the admin's profile language preference.
  const uiLang: 'en' | 'fr' = userProfile?.language === 'fr' ? 'fr' : 'en';
  const copy = UI[uiLang];

  // ── Subscriber stats ──────────────────────────────────────────────────────
  const [stats, setStats] = useState<SubscriberStats>({ total: 0, en: 0, fr: 0, loading: true });

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'newsletter_subscribers'));
        let en = 0, fr = 0;
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.status === 'unsubscribed') return;
          const l = data.lang ?? data.language ?? 'en';
          if (l === 'fr') fr++; else en++;
        });
        setStats({ total: en + fr, en, fr, loading: false });
      } catch {
        setStats(s => ({ ...s, loading: false }));
      }
    };
    void load();
  }, []);

  // ── Compose form state ────────────────────────────────────────────────────
  const [subjectEn, setSubjectEn] = useState('');
  const [subjectFr, setSubjectFr] = useState('');
  const [bodyEn, setBodyEn]       = useState('');
  const [bodyFr, setBodyFr]       = useState('');
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'fr'>('en');

  // ── Send state ────────────────────────────────────────────────────────────
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const targetCount =
    langFilter === 'en' ? stats.en :
    langFilter === 'fr' ? stats.fr :
    stats.total;

  const handleSend = async () => {
    if (!subjectEn.trim() || !bodyEn.trim()) {
      toast({ title: copy.missingFields, variant: 'destructive' });
      return;
    }
    if (targetCount === 0) {
      toast({ title: copy.noSubscribers, variant: 'destructive' });
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setSending(true);
    try {
      const idToken = await user!.getIdToken();
      const res = await fetch('/.netlify/functions/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          subject_en: subjectEn.trim(),
          subject_fr: subjectFr.trim(),
          body_en:    bodyEn.trim(),
          body_fr:    bodyFr.trim(),
          lang_filter: langFilter,
        }),
      });

      const result = await res.json() as SendResult & { message?: string };

      if (!res.ok) throw new Error(result.message ?? 'send_failed');

      toast({
        title: copy.successMsg(result),
        description: result.failed > 0 ? result.errors?.join(', ') : undefined,
      });

      // Reset form after successful send.
      setSubjectEn(''); setSubjectFr('');
      setBodyEn(''); setBodyFr('');
    } catch (err) {
      console.error('[NewsletterAdmin] Send failed:', err);
      toast({ title: copy.errorMsg, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  // ── Preview HTML (branded wrapper stub for the admin's reference) ─────────
  const previewHtml = previewLang === 'fr'
    ? (bodyFr.trim() || bodyEn.trim())
    : bodyEn.trim();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="text-gray-400 mt-1">{copy.subtitle}</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: copy.allLang, count: stats.total, icon: <Globe className="w-4 h-4" /> },
          { label: '🇺🇸 English', count: stats.en, icon: null },
          { label: '🇫🇷 Français', count: stats.fr, icon: null },
        ].map(({ label, count, icon }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-1 text-gray-400 text-sm">
                {icon}
                {label}
              </div>
              <div className="text-2xl font-bold">
                {stats.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : count}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compose card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            {uiLang === 'fr' ? 'Rédiger' : 'Compose'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Language filter */}
          <div>
            <p className="text-sm text-gray-400 mb-2">
              {uiLang === 'fr' ? 'Envoyer à' : 'Send to'}
            </p>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'en', 'fr'] as LangFilter[]).map(f => (
                <Button
                  key={f}
                  variant={langFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLangFilter(f)}
                >
                  {f === 'all' ? copy.allLang : f === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
                  <Badge variant="secondary" className="ml-2">
                    {f === 'all' ? stats.total : f === 'en' ? stats.en : stats.fr}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Subject lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {copy.subjectEnLabel}
              </label>
              <Input
                value={subjectEn}
                onChange={e => setSubjectEn(e.target.value)}
                placeholder="e.g. The African AI opportunity"
                disabled={sending}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {copy.subjectFrLabel}
              </label>
              <Input
                value={subjectFr}
                onChange={e => setSubjectFr(e.target.value)}
                placeholder="ex. L'opportunité IA africaine"
                disabled={sending}
              />
              <p className="text-xs text-gray-500">{copy.frFallback}</p>
            </div>
          </div>

          {/* Body fields */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {copy.bodyEnLabel}
            </label>
            <textarea
              value={bodyEn}
              onChange={e => setBodyEn(e.target.value)}
              rows={10}
              disabled={sending}
              placeholder="<p>Your newsletter content here...</p>"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {copy.bodyFrLabel}
            </label>
            <textarea
              value={bodyFr}
              onChange={e => setBodyFr(e.target.value)}
              rows={10}
              disabled={sending}
              placeholder="<p>Votre contenu ici... (optionnel)</p>"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          {/* Preview toggle */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(v => !v)}
            >
              {showPreview
                ? <><EyeOff className="w-4 h-4 mr-2" />{copy.hidePreview}</>
                : <><Eye className="w-4 h-4 mr-2" />{copy.previewLabel}</>
              }
            </Button>

            {showPreview && (
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  {(['en', 'fr'] as const).map(l => (
                    <Button
                      key={l}
                      variant={previewLang === l ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewLang(l)}
                    >
                      {l === 'en' ? '🇺🇸 EN' : '🇫🇷 FR'}
                    </Button>
                  ))}
                </div>
                <div
                  className="rounded-md border border-border bg-background p-4 prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-gray-500">Nothing to preview yet.</p>' }}
                />
              </div>
            )}
          </div>

          {/* Send button */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <Button
              onClick={handleSend}
              disabled={sending || stats.loading || !subjectEn.trim() || !bodyEn.trim()}
              className="gap-2"
            >
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" />{uiLang === 'fr' ? 'Envoi en cours…' : 'Sending…'}</>
                : <><Send className="w-4 h-4" />{copy.sendTo(targetCount, langFilter)}</>
              }
            </Button>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {targetCount} {uiLang === 'fr' ? 'destinataire(s)' : 'recipient(s)'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{copy.confirmTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{copy.confirmBody(targetCount)}</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  {copy.cancel}
                </Button>
                <Button onClick={() => void confirmSend()}>
                  {copy.confirm}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
