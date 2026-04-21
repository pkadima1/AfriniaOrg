import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Facebook, Linkedin, Twitter } from 'lucide-react';

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

const DEFAULT_LINKS: SocialLink[] = [
  { id: 'linkedin',  label: 'LinkedIn',    url: 'https://linkedin.com/company/afrinia',                      enabled: false },
  { id: 'twitter',   label: 'X / Twitter', url: 'https://x.com/afrinia_org',                                 enabled: false },
  { id: 'facebook',  label: 'Facebook',    url: 'https://www.facebook.com/profile.php?id=61573268155274',    enabled: true  },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-4 h-4" />,
  twitter:  <Twitter  className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
};

const DOC_REF = () => doc(db, 'site_settings', 'social_links');

export function SocialLinksSettings() {
  const [links, setLinks] = useState<SocialLink[]>(DEFAULT_LINKS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  /* ── load from Firestore ── */
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(DOC_REF());
        if (snap.exists()) {
          const data = snap.data() as { links: SocialLink[] };
          // Merge with defaults so new platforms appear automatically
          const saved = data.links ?? [];
          const merged = DEFAULT_LINKS.map(def => {
            const found = saved.find(s => s.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          setLinks(merged);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const updateLink = (id: string, field: keyof SocialLink, value: string | boolean) =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(DOC_REF(), { links, updatedAt: new Date().toISOString() });
      toast({ title: 'Saved', description: 'Social links updated successfully.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save social links.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Links</h2>
          <p className="text-gray-400 text-sm mt-1">
            Toggle each platform on or off. Disabled links are hidden site-wide until activated.
          </p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save changes
        </Button>
      </div>

      <div className="space-y-4">
        {links.map(link => (
          <Card key={link.id} className={link.enabled ? 'border-primary/30' : 'opacity-70'}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {ICON_MAP[link.id] ?? <Globe className="w-4 h-4" />}
                  {link.label}
                  <Badge variant={link.enabled ? 'default' : 'secondary'} className="text-xs ml-1">
                    {link.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{link.enabled ? 'Shown' : 'Hidden'}</span>
                  <Switch
                    checked={link.enabled}
                    onCheckedChange={val => updateLink(link.id, 'enabled', val)}
                  />
                </div>
              </div>
              <CardDescription>
                {link.enabled
                  ? 'Visible on Contact page and Footer.'
                  : 'Hidden everywhere. Toggle on when the page is ready.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor={`url-${link.id}`} className="text-xs text-muted-foreground mb-1 block">
                URL
              </Label>
              <Input
                id={`url-${link.id}`}
                value={link.url}
                onChange={e => updateLink(link.id, 'url', e.target.value)}
                placeholder="https://..."
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
