'use client';
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Post { id: string; title: string; slug: string; publishedAt: string | null; tags: string[]; author: { profile: { firstName: string } } }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', tags: '', publishedAt: '' });

  useEffect(() => {
    api.get('/blog/posts').then(r => setPosts(r.data.data?.items || [])).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/blog/posts', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      });
      setPosts(p => [...p, res.data.data]);
      setShowForm(false);
      toast.success('Post created');
    } catch { toast.error('Failed to create post'); }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/blog/posts/${slug}`);
      setPosts(p => p.filter(x => x.slug !== slug));
      toast.success('Post deleted');
    } catch { toast.error('Failed'); }
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog CMS</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> New Post</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">New Blog Post</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-600 mb-1 block">Title</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input-field" required /></div>
            <div><label className="text-xs text-gray-600 mb-1 block">Slug (URL)</label><input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className="input-field" placeholder="my-post-title" required /></div>
          </div>
          <div><label className="text-xs text-gray-600 mb-1 block">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))} className="input-field h-16 resize-none" required /></div>
          <div><label className="text-xs text-gray-600 mb-1 block">Content (Markdown)</label><textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} className="input-field h-40 resize-none font-mono text-xs" required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-600 mb-1 block">Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} className="input-field" placeholder="news, updates" /></div>
            <div><label className="text-xs text-gray-600 mb-1 block">Publish Date (leave blank for draft)</label><input type="datetime-local" value={form.publishedAt} onChange={e => setForm(f => ({...f, publishedAt: e.target.value}))} className="input-field" /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Publish Post</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Title', 'Slug', 'Status', 'Published', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No posts yet</td></tr>
            : posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-sm text-gray-900 max-w-xs truncate">{post.title}</td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{post.slug}</td>
                <td className="px-4 py-3"><span className={`badge text-xs ${post.publishedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{post.publishedAt ? 'Published' : 'Draft'}</span></td>
                <td className="px-4 py-3 text-xs text-gray-400">{post.publishedAt ? formatDate(post.publishedAt) : '—'}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <a href={`/blog/${post.slug}`} target="_blank" className="text-gray-400 hover:text-brand-700"><Eye className="w-4 h-4" /></a>
                  <button onClick={() => handleDelete(post.slug)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
