import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Trash2, Search, Loader2, RefreshCw, Mail, MailOpen, Archive, ChevronDown, ChevronUp } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: string;
  status?: 'new' | 'read' | 'archived';
  submittedAt: { toDate: () => Date } | null;
}

type StatusFilter = 'inbox' | 'archived' | 'all';

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filtered, setFiltered] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('inbox');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'contact_messages'), orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage));
      setMessages(data);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const newCount = messages.filter(m => (m.status ?? 'new') === 'new').length;

  useEffect(() => {
    let result = messages;
    if (statusFilter === 'inbox') result = result.filter(m => (m.status ?? 'new') !== 'archived');
    if (statusFilter === 'archived') result = result.filter(m => m.status === 'archived');
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.subject.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, messages]);

  const setStatus = async (id: string, status: ContactMessage['status']) => {
    try {
      await updateDoc(doc(db, 'contact_messages', id), { status });
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, status } : m)));
    } catch {
      toast({ title: 'Error', description: 'Failed to update message', variant: 'destructive' });
    }
  };

  const handleExpand = (m: ContactMessage) => {
    const opening = expanded !== m.id;
    setExpanded(opening ? m.id : null);
    // Reading a message marks it read — matches how any inbox behaves.
    if (opening && (m.status ?? 'new') === 'new') void setStatus(m.id, 'read');
  };

  const handleDelete = async (id: string, subject: string) => {
    if (!confirm(`Permanently delete "${subject}"?`)) return;
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
      toast({ title: 'Deleted', description: 'Message removed.' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-gray-400">{newCount} new · {messages.length} total · {filtered.length} shown</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name, email, or subject..." value={search}
            onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {([
          ['inbox', 'Inbox'],
          ['archived', 'Archived'],
          ['all', 'All'],
        ] as const).map(([key, label]) => (
          <Button key={key} variant={statusFilter === key ? 'default' : 'outline'} size="sm"
            onClick={() => setStatusFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No messages found</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(m => {
                const isNew = (m.status ?? 'new') === 'new';
                const isOpen = expanded === m.id;
                return (
                  <div key={m.id}>
                    <button
                      type="button"
                      onClick={() => handleExpand(m)}
                      className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-muted/40 transition-colors"
                    >
                      {isNew ? <Mail className="w-4 h-4 text-primary shrink-0" /> : <MailOpen className="w-4 h-4 text-gray-400 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={isNew ? 'font-semibold' : 'font-medium'}>{m.name}</span>
                          <span className="text-sm text-gray-400 truncate">{m.email}</span>
                          {m.lang && (
                            <Badge variant="outline" className={m.lang === 'fr' ? 'border-blue-400 text-blue-400' : 'border-green-400 text-green-400'}>
                              {m.lang === 'fr' ? '🇫🇷 FR' : '🇺🇸 EN'}
                            </Badge>
                          )}
                          {m.status === 'archived' && <Badge variant="secondary">Archived</Badge>}
                        </div>
                        <div className="text-sm text-gray-400 truncate">{m.subject}</div>
                      </div>
                      <div className="text-xs text-gray-500 shrink-0">
                        {m.submittedAt ? m.submittedAt.toDate().toLocaleString() : '—'}
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pl-12">
                        <p className="text-sm whitespace-pre-wrap text-foreground/90 mb-4">{m.message}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}>
                              Reply
                            </a>
                          </Button>
                          {m.status !== 'archived' ? (
                            <Button size="sm" variant="outline" onClick={() => void setStatus(m.id, 'archived')}>
                              <Archive className="w-4 h-4 mr-2" /> Archive
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => void setStatus(m.id, 'read')}>
                              <MailOpen className="w-4 h-4 mr-2" /> Move to Inbox
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300"
                            onClick={() => void handleDelete(m.id, m.subject)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
