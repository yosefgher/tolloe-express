import { useEffect, useState } from 'react';

let _cache: Record<string, string> | null = null;
let _cacheTime = 0;
const TTL = 60_000;

async function fetchCms(): Promise<Record<string, string>> {
  if (_cache && Date.now() - _cacheTime < TTL) return _cache;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms`);
    const json = await res.json();
    _cache = json.data ?? {};
    _cacheTime = Date.now();
    return _cache!;
  } catch {
    return _cache ?? {};
  }
}

export function useCms() {
  const [cms, setCms] = useState<Record<string, string>>(_cache ?? {});
  useEffect(() => { fetchCms().then(setCms); }, []);
  return cms;
}

export function invalidateCmsCache() {
  _cache = null;
  _cacheTime = 0;
}
