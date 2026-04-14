import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllAudioEpisodes,
  deleteAudioEpisode,
  updateAudioEpisodeStatus,
} from '@/integrations/firebase/audioAdminService';
import type { AudioEpisode } from '@/integrations/firebase/types';

type Lang = 'en' | 'fr';

export const AudioEpisodeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lang, setLang] = useState<Lang>('en');
  const [episodes, setEpisodes] = useState<AudioEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (l: Lang) => {
    setLoading(true);
    try {
      const eps = await fetchAllAudioEpisodes(l);
      setEpisodes(eps);
    } catch (error) {
      console.error('Error loading audio episodes:', error);
      toast({
        title: 'Failed to load episodes',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(lang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleToggleStatus = async (ep: AudioEpisode) => {
    const next = ep.status === 'published' ? 'draft' : 'published';
    try {
      await updateAudioEpisodeStatus(lang, ep.id, next);
      setEpisodes(prev =>
        prev.map(e => (e.id === ep.id ? { ...e, status: next } : e)),
      );
      toast({
        title:
          next === 'published' ? 'Episode published' : 'Episode set to draft',
      });
    } catch (error) {
      toast({
        title: 'Status update failed',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (ep: AudioEpisode) => {
    if (
      !window.confirm(
        `Delete "${ep.title}"?\n\nThis will remove the audio file from Storage and cannot be undone.`,
      )
    )
      return;
    try {
      await deleteAudioEpisode(ep);
      setEpisodes(prev => prev.filter(e => e.id !== ep.id));
      toast({ title: 'Episode deleted' });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: String(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Audio Episodes</h1>
            <p className="text-sm text-muted-foreground">
              Files stored in <code>audio/{lang}/</code> · metadata in{' '}
              <code>audio_{lang}</code>
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/audio/new?lang=${lang}`)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Episode
        </Button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 mb-6">
        {(['en', 'fr'] as Lang[]).map(l => (
          <Button
            key={l}
            variant={lang === l ? 'default' : 'outline'}
            onClick={() => setLang(l)}
          >
            {l === 'en' ? 'English (EN)' : 'Français (FR)'}
          </Button>
        ))}
      </div>

      {/* Episode list */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading episodes…
        </div>
      ) : episodes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Music className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No {lang.toUpperCase()} episodes yet.
            </p>
            <Button
              onClick={() => navigate(`/admin/audio/new?lang=${lang}`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload First Episode
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {episodes.map(ep => (
            <Card key={ep.id}>
              <CardContent className="flex items-center justify-between py-4 px-5">
                {/* Left: number + info */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">
                    EP {String(ep.episode_number).padStart(3, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{ep.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ep.duration}
                      {ep.category ? ` · ${ep.category}` : ''}
                    </p>
                    {ep.audio_url && (
                      <a
                        href={ep.audio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        Preview audio
                      </a>
                    )}
                  </div>
                </div>

                {/* Right: status badge + actions */}
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge
                    variant={
                      ep.status === 'published' ? 'default' : 'secondary'
                    }
                  >
                    {ep.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    title={
                      ep.status === 'published'
                        ? 'Set to draft'
                        : 'Publish episode'
                    }
                    onClick={() => handleToggleStatus(ep)}
                  >
                    {ep.status === 'published' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete episode"
                    onClick={() => handleDelete(ep)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
