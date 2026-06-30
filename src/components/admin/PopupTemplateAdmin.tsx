/**
 * PopupTemplateAdmin.tsx — Admin UI for managing the subscribe popup.
 *
 * WHY: The popup copy and active template need to be changeable without a code
 * deploy. This panel writes to site_config/popup_config in Firestore, which the
 * SubscribePopup component reads in real time.
 *
 * Accessible at /admin/popup (admin role only).
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, EyeOff, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPopupConfig,
  savePopupConfig,
  DEFAULT_CONFIG,
  type PopupConfig,
  type TemplateId,
  type FeatureHighlightContent,
} from '@/integrations/firebase/popupService';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const A = {
  bg:    '#0f172a',
  bg2:   '#131f35',
  gold:  '#B8912A',
  cream: '#F5F0E8',
  muted: '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
};

// ── Template metadata ─────────────────────────────────────────────────────────
const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Clean dark card. Headline + subheadline + email input. No distractions.',
  },
  {
    id: 'feature_highlight',
    label: 'Feature Highlight',
    desc: "Lists what subscribers receive (3 bullet points). Great for first-time visitors.",
  },
  {
    id: 'exclusive_access',
    label: 'Exclusive Access',
    desc: "\"By invitation\" framing. Makes the newsletter feel premium and curated.",
  },
];

// ── Mini preview cards ────────────────────────────────────────────────────────

const MiniPreview = ({ id, active }: { id: TemplateId; active: boolean }) => {
  const borderColor = active ? A.gold : A.border;
  const bg = '#0c1526';

  const previews: Record<TemplateId, React.ReactNode> = {
    minimal: (
      <div style={{ padding: '12px 14px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 10, height: 1, background: A.gold }} />
          <span style={{ fontSize: 7, color: A.gold, letterSpacing: '2px', textTransform: 'uppercase' }}>THE AFRINIA BRIEF</span>
        </div>
        <div style={{ fontSize: 11, color: A.cream, marginBottom: 4, fontFamily: 'Georgia, serif' }}>Stay informed.</div>
        <div style={{ fontSize: 8, color: A.muted, marginBottom: 8, lineHeight: 1.5 }}>Weekly intelligence for Africa's builders.</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A.border}`, borderRadius: 1 }} />
          <div style={{ width: 40, height: 16, background: A.gold, borderRadius: 1 }} />
        </div>
      </div>
    ),
    feature_highlight: (
      <div style={{ padding: '12px 14px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, ${A.gold}, transparent)`, marginBottom: 8 }} />
        <div style={{ fontSize: 11, color: A.cream, marginBottom: 6, fontFamily: 'Georgia, serif' }}>What you get:</div>
        {['Analysis', 'Profiles', 'Audio'].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', border: `1px solid ${A.gold}`, background: 'rgba(184,145,42,0.15)', flexShrink: 0 }} />
            <span style={{ fontSize: 7, color: A.cream }}>{f}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A.border}`, borderRadius: 1 }} />
          <div style={{ width: 36, height: 14, background: A.gold, borderRadius: 1 }} />
        </div>
      </div>
    ),
    exclusive_access: (
      <div style={{ fontFamily: 'sans-serif' }}>
        <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${A.border}`, background: 'rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'inline-block', padding: '2px 6px', border: `1px solid ${A.gold}`, fontSize: 6, color: A.gold, letterSpacing: '2px', textTransform: 'uppercase' }}>
            BY INVITATION
          </div>
        </div>
        <div style={{ padding: '10px 14px' }}>
          <div style={{ fontSize: 10, color: A.cream, marginBottom: 5, fontFamily: 'Georgia, serif', lineHeight: 1.3 }}>Intelligence reserved for Africa's builders.</div>
          <div style={{ height: 14, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A.border}`, borderRadius: 1, marginBottom: 5 }} />
          <div style={{ height: 14, background: 'transparent', border: `1px solid ${A.gold}`, borderRadius: 1 }} />
        </div>
      </div>
    ),
  };

  return (
    <div style={{
      background: bg,
      border: `2px solid ${borderColor}`,
      borderRadius: 4,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
      minHeight: 110,
    }}>
      {previews[id]}
    </div>
  );
};

// ── Field groups ──────────────────────────────────────────────────────────────

const FieldRow = ({
  labelEn, labelFr, valueEn, valueFr,
  onChangeEn, onChangeFr, disabled,
}: {
  labelEn: string; labelFr: string;
  valueEn: string; valueFr: string;
  onChangeEn: (v: string) => void; onChangeFr: (v: string) => void;
  disabled?: boolean;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{labelEn}</label>
      <Input value={valueEn} onChange={e => onChangeEn(e.target.value)} disabled={disabled} />
    </div>
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{labelFr}</label>
      <Input value={valueFr} onChange={e => onChangeFr(e.target.value)} disabled={disabled} />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const PopupTemplateAdmin = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const uiLang: 'en' | 'fr' = userProfile?.language === 'fr' ? 'fr' : 'en';

  const [config, setConfig] = useState<PopupConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<TemplateId>('minimal');

  useEffect(() => {
    void getPopupConfig().then(cfg => {
      setConfig(cfg);
      setActiveTab(cfg.active_template);
      setLoading(false);
    });
  }, []);

  const setTemplate = (id: TemplateId) => {
    setConfig(c => ({ ...c, active_template: id }));
    setActiveTab(id);
  };

  const updateBaseField = (
    tplId: TemplateId,
    field: keyof import('@/integrations/firebase/popupService').BaseTemplateContent,
    value: string,
  ) => {
    setConfig(c => ({
      ...c,
      templates: {
        ...c.templates,
        [tplId]: { ...c.templates[tplId], [field]: value },
      },
    }));
  };

  const updateFeatureList = (lang: 'en' | 'fr', value: string) => {
    const items = value.split('\n').map(s => s.trim()).filter(Boolean);
    const key = lang === 'fr' ? 'features_fr' : 'features_en';
    setConfig(c => ({
      ...c,
      templates: {
        ...c.templates,
        feature_highlight: { ...c.templates.feature_highlight, [key]: items },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePopupConfig(config);
      toast({ title: uiLang === 'fr' ? 'Enregistré.' : 'Saved.', description: uiLang === 'fr' ? 'Le popup est mis à jour en temps réel.' : 'Popup updated in real time.' });
    } catch (err) {
      console.error('[PopupTemplateAdmin] Save failed:', err);
      toast({ title: uiLang === 'fr' ? 'Erreur lors de la sauvegarde.' : 'Save failed.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fh = config.templates.feature_highlight as FeatureHighlightContent;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {uiLang === 'fr' ? 'Retour' : 'Back'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {uiLang === 'fr' ? 'Popup d\'abonnement' : 'Subscribe Popup'}
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {uiLang === 'fr'
                ? 'Modifiez le contenu et le template actif. Les changements sont immédiats.'
                : 'Edit copy and switch the active template. Changes are live immediately.'}
            </p>
          </div>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {uiLang === 'fr' ? 'Enregistrer' : 'Save changes'}
        </Button>
      </div>

      {/* Enable/disable toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {uiLang === 'fr' ? 'Popup activé' : 'Popup enabled'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {uiLang === 'fr'
                  ? 'Désactivez pour masquer le popup sur tout le site sans supprimer la config.'
                  : 'Disable to hide the popup sitewide without losing your config.'}
              </p>
            </div>
            <button
              onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: config.enabled ? A.gold : A.muted }}
            >
              {config.enabled
                ? <><ToggleRight size={28} /> {uiLang === 'fr' ? 'Activé' : 'Enabled'}</>
                : <><ToggleLeft  size={28} /> {uiLang === 'fr' ? 'Désactivé' : 'Disabled'}</>
              }
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Template selector */}
      <Card>
        <CardHeader>
          <CardTitle>{uiLang === 'fr' ? 'Choisir un template' : 'Select template'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                onClick={() => setTemplate(tpl.id)}
                className="cursor-pointer space-y-2"
              >
                <MiniPreview id={tpl.id} active={config.active_template === tpl.id} />
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${config.active_template === tpl.id ? A.gold : A.muted}`,
                    background: config.active_template === tpl.id ? A.gold : 'transparent',
                    flexShrink: 0, transition: 'all 0.2s',
                  }} />
                  <span className="text-sm font-medium">{tpl.label}</span>
                  {config.active_template === tpl.id && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {uiLang === 'fr' ? 'Actif' : 'Active'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content editor — tabs per template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{uiLang === 'fr' ? 'Modifier le contenu' : 'Edit content'}</CardTitle>
            <div className="flex gap-1">
              {TEMPLATES.map(tpl => (
                <Button
                  key={tpl.id}
                  variant={activeTab === tpl.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tpl.id)}
                >
                  {tpl.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Minimal fields */}
          {activeTab === 'minimal' && (
            <>
              <FieldRow
                labelEn="Headline (EN)" labelFr="Titre (FR)"
                valueEn={config.templates.minimal.headline_en}
                valueFr={config.templates.minimal.headline_fr}
                onChangeEn={v => updateBaseField('minimal', 'headline_en', v)}
                onChangeFr={v => updateBaseField('minimal', 'headline_fr', v)}
              />
              <FieldRow
                labelEn="Subheadline (EN)" labelFr="Sous-titre (FR)"
                valueEn={config.templates.minimal.subheadline_en}
                valueFr={config.templates.minimal.subheadline_fr}
                onChangeEn={v => updateBaseField('minimal', 'subheadline_en', v)}
                onChangeFr={v => updateBaseField('minimal', 'subheadline_fr', v)}
              />
              <FieldRow
                labelEn="CTA Button (EN)" labelFr="Bouton (FR)"
                valueEn={config.templates.minimal.cta_en}
                valueFr={config.templates.minimal.cta_fr}
                onChangeEn={v => updateBaseField('minimal', 'cta_en', v)}
                onChangeFr={v => updateBaseField('minimal', 'cta_fr', v)}
              />
            </>
          )}

          {/* Feature highlight fields */}
          {activeTab === 'feature_highlight' && (
            <>
              <FieldRow
                labelEn="Headline (EN)" labelFr="Titre (FR)"
                valueEn={fh.headline_en}
                valueFr={fh.headline_fr}
                onChangeEn={v => updateBaseField('feature_highlight', 'headline_en', v)}
                onChangeFr={v => updateBaseField('feature_highlight', 'headline_fr', v)}
              />
              <FieldRow
                labelEn="Subheadline (EN)" labelFr="Sous-titre (FR)"
                valueEn={fh.subheadline_en}
                valueFr={fh.subheadline_fr}
                onChangeEn={v => updateBaseField('feature_highlight', 'subheadline_en', v)}
                onChangeFr={v => updateBaseField('feature_highlight', 'subheadline_fr', v)}
              />
              <FieldRow
                labelEn="CTA Button (EN)" labelFr="Bouton (FR)"
                valueEn={fh.cta_en}
                valueFr={fh.cta_fr}
                onChangeEn={v => updateBaseField('feature_highlight', 'cta_en', v)}
                onChangeFr={v => updateBaseField('feature_highlight', 'cta_fr', v)}
              />
              {/* Feature bullet points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Features (EN) — one per line
                  </label>
                  <textarea
                    rows={4}
                    value={(fh.features_en ?? []).join('\n')}
                    onChange={e => updateFeatureList('en', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Features (FR) — une par ligne
                  </label>
                  <textarea
                    rows={4}
                    value={(fh.features_fr ?? []).join('\n')}
                    onChange={e => updateFeatureList('fr', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </>
          )}

          {/* Exclusive access fields */}
          {activeTab === 'exclusive_access' && (
            <>
              <FieldRow
                labelEn="Headline (EN)" labelFr="Titre (FR)"
                valueEn={config.templates.exclusive_access.headline_en}
                valueFr={config.templates.exclusive_access.headline_fr}
                onChangeEn={v => updateBaseField('exclusive_access', 'headline_en', v)}
                onChangeFr={v => updateBaseField('exclusive_access', 'headline_fr', v)}
              />
              <FieldRow
                labelEn="Subheadline (EN)" labelFr="Sous-titre (FR)"
                valueEn={config.templates.exclusive_access.subheadline_en}
                valueFr={config.templates.exclusive_access.subheadline_fr}
                onChangeEn={v => updateBaseField('exclusive_access', 'subheadline_en', v)}
                onChangeFr={v => updateBaseField('exclusive_access', 'subheadline_fr', v)}
              />
              <FieldRow
                labelEn="CTA Button (EN)" labelFr="Bouton (FR)"
                valueEn={config.templates.exclusive_access.cta_en}
                valueFr={config.templates.exclusive_access.cta_fr}
                onChangeEn={v => updateBaseField('exclusive_access', 'cta_en', v)}
                onChangeFr={v => updateBaseField('exclusive_access', 'cta_fr', v)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Timing settings */}
      <Card>
        <CardHeader>
          <CardTitle>{uiLang === 'fr' ? 'Paramètres de déclenchement' : 'Trigger settings'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {uiLang === 'fr' ? 'Délai avant affichage (secondes)' : 'Timer delay (seconds)'}
            </label>
            <Input
              type="number"
              min={10}
              max={300}
              value={config.timer_seconds}
              onChange={e => setConfig(c => ({ ...c, timer_seconds: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-500">
              {uiLang === 'fr' ? 'Recommandé : 60s' : 'Recommended: 60s'}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {uiLang === 'fr' ? 'Masquer après fermeture (jours)' : 'Suppress after dismiss (days)'}
            </label>
            <Input
              type="number"
              min={1}
              max={90}
              value={config.dismiss_days}
              onChange={e => setConfig(c => ({ ...c, dismiss_days: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-500">
              {uiLang === 'fr' ? 'Recommandé : 7 jours' : 'Recommended: 7 days'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live preview toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{uiLang === 'fr' ? 'Aperçu du popup' : 'Popup preview'}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(v => !v)}>
              {showPreview
                ? <><EyeOff className="w-4 h-4 mr-2" />{uiLang === 'fr' ? 'Masquer' : 'Hide'}</>
                : <><Eye    className="w-4 h-4 mr-2" />{uiLang === 'fr' ? 'Afficher' : 'Preview'}</>
              }
            </Button>
          </div>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <p className="text-xs text-gray-500 mb-4">
              {uiLang === 'fr'
                ? 'Aperçu statique du template actif avec le contenu actuel (EN).'
                : 'Static preview of the active template with current content (EN).'}
            </p>
            <div style={{
              position: 'relative', background: A.bg2,
              border: `1px solid ${A.border}`, maxWidth: 480,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <PreviewRenderer config={config} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save footer */}
      <div className="flex justify-end pb-8">
        <Button onClick={() => void handleSave()} disabled={saving} size="lg" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {uiLang === 'fr' ? 'Enregistrer les modifications' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
};

// ── Static preview renderer (no triggers, no form submit) ─────────────────────

const PreviewRenderer = ({ config }: { config: PopupConfig }) => {
  const A_local = { gold: '#B8912A', cream: '#F5F0E8', muted: '#8a9bb5', border: 'rgba(184,145,42,0.18)', bg: '#0f172a' };

  if (config.active_template === 'minimal') {
    const t = config.templates.minimal;
    return (
      <div style={{ padding: '32px 28px 24px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 16, height: 1, background: A_local.gold }} />
          <span style={{ fontSize: 8, color: A_local.gold, letterSpacing: '3px', textTransform: 'uppercase' }}>THE AFRINIA BRIEF</span>
        </div>
        <div style={{ fontSize: 22, color: A_local.cream, fontFamily: 'Georgia, serif', marginBottom: 8 }}>{t.headline_en}</div>
        <div style={{ fontSize: 12, color: A_local.muted, marginBottom: 20, lineHeight: 1.7 }}>{t.subheadline_en}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 34, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A_local.border}`, borderRadius: 2 }} />
          <div style={{ padding: '0 16px', height: 34, background: A_local.gold, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: A_local.bg }}>{t.cta_en}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, color: A_local.muted, marginTop: 14, opacity: 0.6 }}>Free · Unsubscribe anytime</div>
      </div>
    );
  }

  if (config.active_template === 'feature_highlight') {
    const t = config.templates.feature_highlight as FeatureHighlightContent;
    return (
      <div style={{ padding: '32px 28px 24px', fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', height: 1, background: `linear-gradient(90deg, ${A_local.gold}, transparent)`, marginBottom: 20 }} />
        <div style={{ fontSize: 20, color: A_local.cream, fontFamily: 'Georgia, serif', marginBottom: 14 }}>{t.headline_en}</div>
        {(t.features_en ?? []).map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${A_local.gold}`, background: 'rgba(184,145,42,0.15)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: A_local.cream }}>{f}</span>
          </div>
        ))}
        <div style={{ fontSize: 12, color: A_local.muted, margin: '14px 0 18px', lineHeight: 1.7 }}>{t.subheadline_en}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, height: 34, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A_local.border}`, borderRadius: 2 }} />
          <div style={{ padding: '0 16px', height: 34, background: A_local.gold, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: A_local.bg }}>{t.cta_en}</span>
          </div>
        </div>
      </div>
    );
  }

  // exclusive_access
  const t = config.templates.exclusive_access;
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ padding: '24px 28px 18px', borderBottom: `1px solid ${A_local.border}`, background: 'rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'inline-block', padding: '3px 8px', border: `1px solid ${A_local.gold}`, fontSize: 8, color: A_local.gold, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 10 }}>
          BY INVITATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 1, background: A_local.gold }} />
          <span style={{ fontSize: 8, color: A_local.gold, letterSpacing: '3px', textTransform: 'uppercase' }}>THE AFRINIA BRIEF</span>
        </div>
      </div>
      <div style={{ padding: '24px 28px' }}>
        <div style={{ fontSize: 18, color: A_local.cream, fontFamily: 'Georgia, serif', marginBottom: 10, lineHeight: 1.3 }}>{t.headline_en}</div>
        <div style={{ fontSize: 12, color: A_local.muted, marginBottom: 18, lineHeight: 1.7 }}>{t.subheadline_en}</div>
        <div style={{ height: 34, background: 'rgba(255,255,255,0.06)', border: `1px solid ${A_local.border}`, borderRadius: 2, marginBottom: 8 }} />
        <div style={{ height: 34, border: `1px solid ${A_local.gold}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: A_local.gold }}>{t.cta_en}</span>
        </div>
      </div>
    </div>
  );
};
