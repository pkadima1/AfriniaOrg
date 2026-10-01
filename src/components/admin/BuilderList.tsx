import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { fetchBuilders, deleteBuilder } from "@/integrations/firebase/builderService";
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import type { Lang } from "@/utils/languageUtils";
import type { Builder } from '@/integrations/firebase/types';

export const BuilderList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAuth();

  // Language selection — reads from ?lang= query param, defaults to 'en'.
  // builders_en and builders_fr are independent collections — same pattern as BlogPostList.
  const langParam = searchParams.get('lang');
  const lang: Lang = langParam === 'fr' ? 'fr' : 'en';

  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setLang = (l: Lang) => {
    const next = new URLSearchParams(searchParams);
    next.set('lang', l);
    setSearchParams(next, { replace: true });
  };

  const loadBuilders = async () => {
    setIsLoading(true);
    try {
      setBuilders(await fetchBuilders(lang));
    } catch (error) {
      console.error('Error loading builders:', error);
      toast({ title: "Error", description: "Failed to load builder profiles", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBuilders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin()) {
      toast({ title: "Access Denied", description: "Only administrators can delete builder profiles", variant: "destructive" });
      return;
    }
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      const success = await deleteBuilder(id, lang);
      if (!success) throw new Error('Delete failed');
      toast({ title: "Success", description: "Builder profile deleted successfully" });
      void loadBuilders();
    } catch (error) {
      console.error('Error deleting builder:', error);
      toast({ title: "Error", description: "Failed to delete builder profile", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading builder profiles…</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Builder Profiles</h1>
          <p className="text-sm text-gray-400 mt-1">
            One entity per builder, per language. EN and FR profiles are independent — articles link to a profile, they don't replace it.
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/builders/new?lang=${lang}`)}>
          <Plus className="w-4 h-4 mr-2" />
          New Builder Profile
        </Button>
      </div>

      {/* Language tabs — same pattern as BlogPostList */}
      <div className="flex gap-2 mb-6">
        {(['en', 'fr'] as Lang[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-5 py-2 text-sm font-medium tracking-widest uppercase transition-colors border ${
              lang === l
                ? 'border-[#B8912A] text-[#B8912A] bg-[#B8912A]/10'
                : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
            }`}
          >
            {l === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
          </button>
        ))}
        <span className="ml-3 self-center text-xs text-gray-500">
          Collection: <code className="text-gray-300">builders_{lang}</code>
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Decision Mind</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {builders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No {lang.toUpperCase()} builder profiles yet. Create the first one.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                builders.map(b => {
                  const insightCount = b.decisionFrameworks.length + b.keyFailures.length + b.mentalModels.length;
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-sm text-muted-foreground">/{b.slug}</div>
                      </TableCell>
                      <TableCell>{b.role || '—'}</TableCell>
                      <TableCell>{b.countries.join(', ') || '—'}</TableCell>
                      <TableCell>{insightCount} item{insightCount !== 1 ? 's' : ''}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'published' ? 'default' : 'secondary'}>{b.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/builders/edit/${b.id}?lang=${lang}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {b.status === 'published' && (
                            <Button size="sm" variant="ghost" onClick={() => window.open(`/builders/${b.slug}`, '_blank')}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {isAdmin() ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(b.id, b.name)}
                              className="text-destructive hover:text-destructive"
                              title="Delete builder profile (Admin only)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled className="text-gray-500 cursor-not-allowed" title="Only administrators can delete">
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
