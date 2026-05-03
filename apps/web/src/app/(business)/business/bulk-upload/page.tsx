'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function BulkUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ uploadId: string; totalRows: number; successRows?: number; errorRows?: number; errors?: Array<{ row: number; error: string }> } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      toast.error('Only CSV or Excel files are supported');
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/shipments/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data);
      toast.success(`File uploaded! Processing ${res.data.data.totalRows} rows...`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
  });

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Upload Shipments</h1>
      <p className="text-gray-500 text-sm mb-6">Upload a CSV or Excel file to create multiple shipments at once</p>

      {/* Template download */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-brand-700" />
          <div>
            <p className="font-medium text-sm text-gray-900">Download CSV Template</p>
            <p className="text-xs text-gray-500">Use this template to format your bulk upload file</p>
          </div>
        </div>
        <a
          href="data:text/csv;charset=utf-8,recipientEmail,pickupStreet,pickupCity,pickupRegion,deliveryStreet,deliveryCity,deliveryRegion,weight,serviceType,notes%0Aexample@email.com,Bole Road 42,Addis Ababa,Addis Ababa,Main Street 1,Dire Dawa,Dire Dawa,2.5,STANDARD,Fragile"
          download="tolloe_bulk_template.csv"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Template
        </a>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-700">{isDragActive ? 'Drop the file here...' : 'Drag & drop your CSV or Excel file'}</p>
        <p className="text-sm text-gray-400 mt-1">or click to browse</p>
        <p className="text-xs text-gray-300 mt-2">Max file size: 10MB</p>
      </div>

      {uploading && (
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
          <div className="w-5 h-5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
          Uploading and processing...
        </div>
      )}

      {result && (
        <div className="card p-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-semibold text-gray-900">Upload Processing</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-900">{result.totalRows}</p>
              <p className="text-xs text-gray-500">Total Rows</p>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">{result.successRows ?? '—'}</p>
              <p className="text-xs text-gray-500">Successful</p>
            </div>
            <div className="text-center bg-red-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600">{result.errorRows ?? '—'}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Row Errors</p>
              <div className="bg-red-50 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map(e => (
                  <p key={e.row} className="text-xs text-red-600">Row {e.row}: {e.error}</p>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">Upload ID: {result.uploadId}</p>
        </div>
      )}

      {/* Format guide */}
      <div className="card p-5 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Required CSV Columns</h3>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead><tr className="bg-gray-50">{['Column', 'Example', 'Required'].map(h => <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ['recipientEmail', 'customer@email.com', 'Yes'],
                ['pickupStreet', 'Bole Road 42', 'Yes'],
                ['pickupCity', 'Addis Ababa', 'Yes'],
                ['pickupRegion', 'Addis Ababa', 'Yes'],
                ['deliveryStreet', 'Main Street 1', 'Yes'],
                ['deliveryCity', 'Dire Dawa', 'Yes'],
                ['deliveryRegion', 'Dire Dawa', 'Yes'],
                ['weight', '2.5', 'Yes'],
                ['serviceType', 'STANDARD', 'Yes'],
                ['notes', 'Fragile', 'No'],
              ].map(([col, ex, req]) => (
                <tr key={col}><td className="px-3 py-1.5 font-mono text-gray-700">{col}</td><td className="px-3 py-1.5 text-gray-500">{ex}</td><td className="px-3 py-1.5"><span className={req === 'Yes' ? 'text-red-600' : 'text-gray-400'}>{req}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
