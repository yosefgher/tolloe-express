'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Save, RefreshCw, Globe, Building2, Search, Share2, Image as ImageIcon, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { invalidateCmsCache } from '@/hooks/useCms';

type CmsField = { key: string; value: string; label: string; type: string };
type CmsData = Record<string, CmsField[]>;

const GROUP_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  homepage: { label: 'Homepage',     icon: Globe,      color: 'text-blue-600' },
  company:  { label: 'Company Info', icon: Building2,  color: 'text-green-600' },
  media:    { label: 'Logo & Images',icon: ImageIcon,  color: 'text-yellow-600' },
  seo:      { label: 'SEO',          icon: Search,     color: 'text-purple-600' },
  social:   { label: 'Social Links', icon: Share2,     color: 'text-pink-600' },
};

export default function CmsPage() {
  const [data, setData] = useState<CmsData>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('homepage');
  const [loading, setLoading] = useState(true);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/cms');
      setData(res.data.data);
      const flat: Record<string, string> = {};
      Object.values(res.data.data as CmsData).flat().forEach(f => { flat[f.key] = f.value; });
      setEdits(flat);
    } catch { toast.error('Failed to load CMS content'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(key: string) {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await api.put(`/admin/cms/${encodeURIComponent(key)}`, { value: edits[key] });
      setData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(g => {
          next[g] = next[g].map(f => f.key === key ? { ...f, value: edits[key] } : f);
        });
        return next;
      });
      invalidateCmsCache();
      toast.success('Saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  }

  async function uploadImage(key: string, file: File) {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('key', key);
      const res = await api.post('/admin/cms/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url: string = res.data.data.url;
      setEdits(prev => ({ ...prev, [key]: url }));
      setData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(g => {
          next[g] = next[g].map(f => f.key === key ? { ...f, value: url } : f);
        });
        return next;
      });
      invalidateCmsCache();
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  }

  async function saveGroup(group: string) {
    const fields = (data[group] || []).filter(f => f.type !== 'image');
    const dirty = fields.filter(f => f.value !== edits[f.key]);
    if (!dirty.length) { toast('Nothing changed'); return; }
    await Promise.all(dirty.map(f => save(f.key)));
  }

  const groups = Object.keys(GROUP_META).filter(g => data[g]);
  const activeFields = data[activeTab] || [];

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Edit website text and images — changes go live immediately.</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Tab nav */}
          <div className="w-44 shrink-0 space-y-1">
            {groups.map(g => {
              const meta = GROUP_META[g];
              const Icon = meta?.icon || Globe;
              const dirty = (data[g] || []).filter(f => f.type !== 'image' && f.value !== edits[f.key]).length;
              return (
                <button key={g} onClick={() => setActiveTab(g)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === g ? 'bg-brand-700 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${activeTab === g ? 'text-white' : meta?.color}`} />
                  <span className="flex-1">{meta?.label || g}</span>
                  {dirty > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === g ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>{dirty}</span>}
                </button>
              );
            })}
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{GROUP_META[activeTab]?.label || activeTab}</h2>
              {activeTab !== 'media' && (
                <button onClick={() => saveGroup(activeTab)} className="btn-primary flex items-center gap-2 text-sm">
                  <Save className="w-4 h-4" /> Save All Changes
                </button>
              )}
            </div>

            {activeFields.map(field => {
              const isDirty = field.type !== 'image' && field.value !== edits[field.key];
              const isSaving = saving[field.key];
              const currentUrl = edits[field.key] || field.value;

              if (field.type === 'image') {
                return (
                  <div key={field.key} className="card p-5">
                    <p className="text-sm font-medium text-gray-900 mb-1">{field.label}</p>
                    <p className="text-xs font-mono text-gray-400 mb-3">{field.key}</p>

                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                        {currentUrl ? (
                          <img src={`http://localhost:4000${currentUrl}`} alt="logo" className="max-w-full max-h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1">
                        {currentUrl && (
                          <p className="text-xs text-gray-500 font-mono mb-2 truncate">{currentUrl}</p>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => { fileInputs.current[field.key] = el; }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(field.key, f); }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => fileInputs.current[field.key]?.click()}
                            disabled={isSaving}
                            className="btn-primary flex items-center gap-2 text-sm"
                          >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {currentUrl ? 'Replace Image' : 'Upload Image'}
                          </button>
                          {currentUrl && (
                            <button onClick={() => save(field.key)} className="btn-secondary text-sm flex items-center gap-1.5">
                              <X className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG — max 5 MB. Recommended: SVG or PNG with transparent background.</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.key} className={`card p-4 border-2 transition-colors ${isDirty ? 'border-orange-200 bg-orange-50/30' : 'border-transparent'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium text-gray-900">{field.label}</label>
                        <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{field.key}</span>
                        {isDirty && <span className="text-xs text-orange-600 font-medium">● unsaved</span>}
                      </div>
                      {field.type === 'json' ? (
                        <textarea value={edits[field.key] ?? field.value} onChange={e => setEdits(p => ({ ...p, [field.key]: e.target.value }))} className="input-field font-mono text-xs h-28 resize-y" spellCheck={false} />
                      ) : field.type === 'textarea' ? (
                        <textarea value={edits[field.key] ?? field.value} onChange={e => setEdits(p => ({ ...p, [field.key]: e.target.value }))} className="input-field h-20 resize-y" />
                      ) : (
                        <input value={edits[field.key] ?? field.value} onChange={e => setEdits(p => ({ ...p, [field.key]: e.target.value }))} className="input-field" />
                      )}
                    </div>
                    <button onClick={() => save(field.key)} disabled={!isDirty || isSaving}
                      className={`mt-7 shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDirty ? 'bg-brand-700 text-white hover:bg-brand-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
