import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Mail, Trash2, Download, Search, Loader2, RefreshCw } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: { toDate: () => Date } | null;
  source?: string;
  language?: string;
  country?: string;
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filtered, setFiltered] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'en' | 'fr'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'newsletter_subscribers'), orderBy('subscribedAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
      setSubscribers(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load subscribers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    let result = subscribers;
    if (search) result = result.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
    if (langFilter !== 'all') result = result.filter(s => s.language === langFilter);
    setFiltered(result);
  }, [search, langFilter, subscribers]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the newsletter list?`)) return;
    try {
      await deleteDoc(doc(db, 'newsletter_subscribers', id));
      toast({ title: 'Removed', description: `${email} unsubscribed.` });
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to remove subscriber', variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    const rows = [['Email', 'Subscribed At', 'Source', 'Language', 'Country'],
      ...filtered.map(s => [
        s.email,
        s.subscribedAt ? s.subscribedAt.toDate().toLocaleDateString() : '',
        s.source || '',
        s.language || '',
        s.country || '',
      ])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'afrinia_subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-gray-400">{subscribers.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button size="sm" asChild>
            <a href="mailto:afrinia@afrinia.org">
              <Mail className="w-4 h-4 mr-2" /> Email All
            </a>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9" />
        </div>
        {(['all', 'en', 'fr'] as const).map(l => (
          <Button key={l} variant={langFilter === l ? 'default' : 'outline'} size="sm"
            onClick={() => setLangFilter(l)}>
            {l === 'all' ? 'All languages' : l === 'en' ? '🇺🇸 English' : '🇫🇷 Français'}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Subscribers</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {s.subscribedAt ? s.subscribedAt.toDate().toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      {s.language ? (
                        <Badge variant="outline" className={s.language === 'fr' ? 'border-blue-400 text-blue-400' : 'border-green-400 text-green-400'}>
                          {s.language === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
                        </Badge>
                      ) : <span className="text-gray-500">—</span>}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">{s.country || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.source || 'homepage'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"
                        onClick={() => void handleDelete(s.id, s.email)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
