import { useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, Music, CheckCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  uploadAudioEpisode,
  type AudioUploadMetadata,
} from '@/integrations/firebase/audioAdminService';

type Lang = 'en' | 'fr';

// ── Duration auto-detection ───────────────────────────────────────────────────
function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m} min ${s} sec`;
}

async function detectAudioDuration(file: File): Promise<string> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(isFinite(audio.duration) ? formatSeconds(audio.duration) : '');
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve('');
    });
    audio.src = url;
  });
}

const AUDIO_ACCEPT = 'audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac';

// ── Component ─────────────────────────────────────────────────────────────────
export const AudioUpload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [lang, setLang] = useState<Lang>(
    (searchParams.get('lang') as Lang) ?? 'en',
  );
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const [episodeNumber, setEpisodeNumber] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }, [toast]);

  const handleFile = useCallback(
    async (f: File) => {
      const isAudio =
        f.type.startsWith('audio/') ||
        /\.(mp3|mp4|m4a|wav|ogg|flac|aac)$/i.test(f.name);
      if (!isAudio) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an audio file (MP3, M4A, WAV, OGG…).',
          variant: 'destructive',
        });
        return;
      }
      setFile(f);
      const detected = await detectAudioDuration(f);
      if (detected) setDuration(detected);
    },
    [toast],
  );

  // Drag events
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'No file selected', variant: 'destructive' });
      return;
    }
    if (!episodeNumber || !title || !duration) {
      toast({
        title: 'Missing required fields',
        description: 'Episode number, title, and duration are required.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const meta: AudioUploadMetadata = {
        episode_number: parseInt(episodeNumber, 10),
        title: title.trim(),
        duration: duration.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        status,
        lang,
        imageFile: imageFile ?? undefined,
      };
      await uploadAudioEpisode(file, meta, setProgress);
      setUploadDone(true);
      toast({
        title: 'Episode uploaded!',
        description: `${lang.toUpperCase()} — Episode ${episodeNumber}: ${title}`,
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      toast({
        title: 'Upload failed',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setUploadDone(false);
    setFile(null);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setEpisodeNumber('');
    setTitle('');
    setDuration('');
    setCategory('');
    setDescription('');
    setProgress(0);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (uploadDone) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardContent className="pt-10 pb-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Episode uploaded!</h2>
            <p className="text-muted-foreground mb-6">
              Now live in the <strong>{lang.toUpperCase()}</strong> audio feed.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => navigate('/admin/audio')}>
                View all episodes
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Upload another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Upload form ─────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/audio')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Upload Audio Episode</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Language selector ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Language / Bucket
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3">
              {(['en', 'fr'] as Lang[]).map(l => (
                <Button
                  key={l}
                  type="button"
                  variant={lang === l ? 'default' : 'outline'}
                  className="w-36"
                  onClick={() => setLang(l)}
                >
                  {l === 'en' ? 'English (EN)' : 'Français (FR)'}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              File → <code>audio/{lang}/</code> in Storage &nbsp;·&nbsp; Metadata
              → <code>audio_{lang}</code> in Firestore
            </p>
          </CardContent>
        </Card>

        {/* ── Drag & drop zone ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Audio File
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              role="button"
              tabIndex={0}
              aria-label="Drop audio file here or click to browse"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer select-none ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : file
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={e =>
                e.key === 'Enter' && fileInputRef.current?.click()
              }
            >
              {file ? (
                <div className="flex items-center justify-center gap-4">
                  <Music className="w-9 h-9 text-green-500 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {duration && (
                      <Badge variant="secondary" className="mt-1">
                        {duration}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium mb-1">Drop your audio file here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse — MP3, M4A, WAV, OGG, FLAC supported
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={AUDIO_ACCEPT}
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </CardContent>
        </Card>

        {/* ── Cover image (optional) ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Cover Image <span className="font-normal normal-case tracking-normal text-muted-foreground/60">(optional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80"
                >
                  ✕
                </button>
                <p className="text-xs text-muted-foreground mt-2">{imageFile?.name}</p>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label="Drop cover image here or click to browse"
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer select-none ${
                  isDraggingImage
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
                onDrop={e => {
                  e.preventDefault();
                  setIsDraggingImage(false);
                  const f = e.dataTransfer.files[0];
                  if (f) handleImageFile(f);
                }}
                onDragOver={e => { e.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={() => setIsDraggingImage(false)}
                onClick={() => imageInputRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && imageInputRef.current?.click()}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Drop a cover image here</p>
                <p className="text-xs text-muted-foreground">or click to browse — JPG, PNG, WebP</p>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />
          </CardContent>
        </Card>

        {/* ── Episode metadata ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Episode Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ep-number">Episode Number *</Label>
                <Input
                  id="ep-number"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={episodeNumber}
                  onChange={e => setEpisodeNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ep-duration">
                  Duration *{' '}
                  <span className="text-muted-foreground font-normal text-xs">
                    (auto-detected)
                  </span>
                </Label>
                <Input
                  id="ep-duration"
                  placeholder="e.g. 7 min 24 sec"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ep-title">Title *</Label>
              <Input
                id="ep-title"
                placeholder={
                  lang === 'en'
                    ? 'e.g. How three free AI tools built a $40K/year business'
                    : 'e.g. Comment trois outils IA gratuits ont bâti une affaire à 40K$/an'
                }
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ep-category">Category</Label>
              <Input
                id="ep-category"
                placeholder="e.g. Systems + AI"
                value={category}
                onChange={e => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ep-desc">Description</Label>
              <Textarea
                id="ep-desc"
                placeholder="Short summary of the episode…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Publish Status</Label>
              <Select
                value={status}
                onValueChange={v => setStatus(v as typeof status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published — visible on the site</SelectItem>
                  <SelectItem value="draft">Draft — hidden from public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Upload progress ── */}
        {uploading && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm font-medium mb-2">
                Uploading to Storage… {progress}%
              </p>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        <Button
          type="submit"
          disabled={uploading || !file}
          className="w-full"
          size="lg"
        >
          {uploading ? `Uploading… ${progress}%` : 'Upload Episode'}
        </Button>
      </form>
    </div>
  );
};
