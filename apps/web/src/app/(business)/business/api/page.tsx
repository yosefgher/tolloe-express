'use client';
import { useEffect, useState } from 'react';
import { Key, Webhook, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ApiKey { id: string; name: string; key: string; isActive: boolean; createdAt: string; lastUsedAt: string | null }
interface WebhookEntry { id: string; url: string; events: string[]; isActive: boolean }

export default function ApiPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(['SHIPMENT_CREATED']);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get('/business/api-keys'), api.get('/business/webhooks')])
      .then(([keys, whs]) => { setApiKeys(keys.data.data || []); setWebhooks(whs.data.data || []); })
      .catch(() => {});
  }, []);

  async function createApiKey() {
    if (!newKeyName.trim()) { toast.error('Enter a key name'); return; }
    try {
      const res = await api.post('/business/api-keys', { name: newKeyName });
      setApiKeys(k => [...k, res.data.data]);
      setShowKey(res.data.data.id);
      setNewKeyName('');
      toast.success('API key created! Copy it now — it won\'t be shown again.');
    } catch { toast.error('Failed to create key'); }
  }

  async function deleteApiKey(id: string) {
    if (!confirm('Delete this API key?')) return;
    try { await api.delete(`/business/api-keys/${id}`); setApiKeys(k => k.filter(x => x.id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  }

  async function createWebhook() {
    if (!newWebhookUrl.trim()) { toast.error('Enter a webhook URL'); return; }
    try {
      const res = await api.post('/business/webhooks', { url: newWebhookUrl, events: newWebhookEvents });
      setWebhooks(w => [...w, res.data.data]);
      setNewWebhookUrl('');
      toast.success('Webhook registered');
    } catch { toast.error('Failed to register webhook'); }
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">API & Webhooks</h1>

      {/* API Keys */}
      <div className="card mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Key className="w-4 h-4 text-brand-700" />API Keys</h2>
          <p className="text-xs text-gray-500 mt-0.5">Use API keys to authenticate requests to the TOLLOE EXPRESS API</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="input-field flex-1" placeholder="Key name (e.g. Production)" />
            <button onClick={createApiKey} className="btn-primary flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> Create Key</button>
          </div>
          <div className="space-y-3">
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-sm text-gray-900">{key.name}</p>
                  <p className="font-mono text-xs text-gray-500">{showKey === key.id ? key.key : key.key}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(key.key); toast.success('Copied!'); }} className="text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => deleteApiKey(key.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {apiKeys.length === 0 && <p className="text-sm text-gray-400">No API keys yet</p>}
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Webhook className="w-4 h-4 text-brand-700" />Webhooks</h2>
          <p className="text-xs text-gray-500 mt-0.5">Receive real-time notifications when shipment events occur</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <input value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)} className="input-field" placeholder="https://your-server.com/webhook" />
            <div className="flex flex-wrap gap-2">
              {['SHIPMENT_CREATED', 'SHIPMENT_UPDATED', 'SHIPMENT_DELIVERED'].map(evt => (
                <label key={evt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={newWebhookEvents.includes(evt)} onChange={e => setNewWebhookEvents(prev => e.target.checked ? [...prev, evt] : prev.filter(x => x !== evt))} className="w-4 h-4 text-brand-700" />
                  {evt.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
            <button onClick={createWebhook} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Webhook</button>
          </div>
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{wh.url}</p>
                  <div className="flex gap-1 mt-1">{wh.events.map(e => <span key={e} className="badge bg-brand-50 text-brand-700 text-xs">{e}</span>)}</div>
                </div>
                <button onClick={async () => { await api.delete(`/business/webhooks/${wh.id}`); setWebhooks(w => w.filter(x => x.id !== wh.id)); }} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {webhooks.length === 0 && <p className="text-sm text-gray-400">No webhooks registered</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
