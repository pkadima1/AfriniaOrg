import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { fetchBuilderById, saveBuilder, uploadBuilderPhoto } from "@/integrations/firebase/builderService";
import { ArrowLeft, Save, Eye, X, Plus, Trash2 } from "lucide-react";
import type { Lang } from "@/utils/languageUtils";
import type { DecisionInsight } from '@/integrations/firebase/types';

interface BuilderForm {
  id?: string;
  slug: string;
  name: string;
  role: string;
  countries: string[];
  photo_url?: string;
  bio: string;
  decisionFrameworks: DecisionInsight[];
  keyFailures: DecisionInsight[];
  mentalModels: DecisionInsight[];
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

const emptyInsight: DecisionInsight = { title: '', sourceUrl: '' };

/**
 * Repeatable list editor for one decision-mind category (frameworks / failures / models).
 * Single-language paraphrase + an optional citation URL — never a direct quote, per the
 * synthesis-only rule the Atelier tool already enforces upstream.
 */
const InsightListEditor = ({
  label,
  hint,
  items,
  onChange,
}: {
  label: string;
  hint: string;
  items: DecisionInsight[];
  onChange: (items: DecisionInsight[]) => void;
}) => {
  const update = (index: number, patch: Partial<DecisionInsight>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, { ...emptyInsight }]);

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {items.map((item, index) => (
        <Card key={index} className="bg-muted/30">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  value={item.title}
                  onChange={e => update(index, { title: e.target.value })}
                  placeholder="Paraphrase..."
                />
                <Input
                  value={item.sourceUrl ?? ''}
                  onChange={e => update(index, { sourceUrl: e.target.value })}
                  placeholder="Source URL (citation)..."
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-2" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  );
};

export const BuilderEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  // builders_en / builders_fr are independent collections — same pattern as BlogPostEditor.
  const langParam = searchParams.get('lang');
  const lang: Lang = langParam === 'fr' ? 'fr' : 'en';

  const [builder, setBuilder] = useState<BuilderForm>({
    slug: '',
    name: '',
    role: '',
    countries: [],
    bio: '',
    decisionFrameworks: [],
    keyFailures: [],
    mentalModels: [],
    status: 'draft',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [countryInput, setCountryInput] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) return;
    setIsLoading(true);
    fetchBuilderById(id, lang)
      .then(data => {
        if (!data) return;
        setBuilder({
          id: data.id,
          slug: data.slug,
          name: data.name,
          role: data.role || '',
          countries: data.countries,
          photo_url: data.photo_url,
          bio: data.bio,
          decisionFrameworks: data.decisionFrameworks,
          keyFailures: data.keyFailures,
          mentalModels: data.mentalModels,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      })
      .catch(error => {
        console.error('Error loading builder:', error);
        toast({ title: "Error", description: "Failed to load builder profile", variant: "destructive" });
        navigate(`/admin/builders?lang=${lang}`);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing, lang, navigate]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const handleNameChange = (name: string) => {
    setBuilder(prev => ({ ...prev, name, slug: !isEditing ? generateSlug(name) : prev.slug }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const url = await uploadBuilderPhoto(file);
      if (!url) throw new Error('Upload failed');
      setBuilder(prev => ({ ...prev, photo_url: url }));
      toast({ title: "Success", description: "Photo uploaded successfully" });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
    } finally {
      setPhotoUploading(false);
    }
  };

  const addCountry = () => {
    const c = countryInput.trim();
    if (c && !builder.countries.includes(c)) {
      setBuilder(prev => ({ ...prev, countries: [...prev.countries, c] }));
      setCountryInput('');
    }
  };
  const removeCountry = (c: string) =>
    setBuilder(prev => ({ ...prev, countries: prev.countries.filter(x => x !== c) }));

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!builder.name.trim() || !builder.slug.trim()) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = { ...builder, ...(status && { status }) };
      const docId = await saveBuilder(data, builder.id, lang);
      if (!docId) throw new Error('Failed to save');

      toast({ title: "Success", description: `Builder profile ${status === 'published' ? 'published' : 'saved'} successfully` });

      if (!isEditing) {
        navigate(`/admin/builders?lang=${lang}`);
      } else {
        setBuilder(prev => ({ ...prev, id: docId, status: status ?? prev.status }));
      }
    } catch (error) {
      console.error('Error saving builder:', error);
      toast({ title: "Error", description: "Failed to save builder profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/admin/builders?lang=${lang}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Builders
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Builder Profile' : 'New Builder Profile'}</h1>
          <Badge
            variant="outline"
            className={lang === 'fr' ? 'border-blue-400 text-blue-400' : 'border-green-400 text-green-400'}
          >
            {lang === 'fr' ? '🇫🇷 Français → builders_fr' : '🇺🇸 English → builders_en'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={isSaving}>
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={builder.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Aliko Dangote" className="text-lg" />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={builder.slug} onChange={e => setBuilder(prev => ({ ...prev, slug: e.target.value }))} placeholder="aliko-dangote" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={builder.role}
                onChange={e => setBuilder(prev => ({ ...prev, role: e.target.value }))}
                placeholder={lang === 'fr' ? 'Fondateur et PDG, Dangote Group' : 'Founder & CEO, Dangote Group'}
              />
            </div>

            <div>
              <Label>Countries</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={countryInput}
                  onChange={e => setCountryInput(e.target.value)}
                  placeholder="Add a country..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCountry(); } }}
                />
                <Button type="button" onClick={addCountry} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {builder.countries.map(c => (
                  <Badge key={c} variant="secondary" className="flex items-center gap-1">
                    {c}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeCountry(c)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={builder.status} onValueChange={(v: 'draft' | 'published') => setBuilder(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="photo">Photo</Label>
              <div className="space-y-2">
                {builder.photo_url && (
                  <img src={builder.photo_url} alt={builder.name} className="w-32 h-32 object-cover rounded-full" />
                )}
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={photoUploading} />
                  {photoUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bio</CardTitle></CardHeader>
          <CardContent>
            <Label htmlFor="bio">{lang === 'fr' ? 'Bio (FR)' : 'Bio (EN)'}</Label>
            <Textarea
              id="bio"
              value={builder.bio}
              onChange={e => setBuilder(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              placeholder={lang === 'fr' ? 'Bio factuelle courte...' : 'Short factual bio...'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Mind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <InsightListEditor
              label="Decision Frameworks"
              hint="Reusable reasoning patterns — e.g. 'backward integration: produce what you import'. Paraphrase only, cite the source."
              items={builder.decisionFrameworks}
              onChange={items => setBuilder(prev => ({ ...prev, decisionFrameworks: items }))}
            />
            <InsightListEditor
              label="Key Failures / Pivots"
              hint="Exits, mistakes, or course corrections and the constraint that forced them."
              items={builder.keyFailures}
              onChange={items => setBuilder(prev => ({ ...prev, keyFailures: items }))}
            />
            <InsightListEditor
              label="Mental Models"
              hint="Recurring beliefs or heuristics that shape how this builder decides."
              items={builder.mentalModels}
              onChange={items => setBuilder(prev => ({ ...prev, mentalModels: items }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
