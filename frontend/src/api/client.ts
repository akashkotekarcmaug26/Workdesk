import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api<T = any>(
  path: string,
  { method = 'GET', body }: { method?: string; body?: any } = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  try {
    const res = await axios({
      url: BASE + path,
      method,
      data: body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data as T;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Request failed');
  }
}

export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [error, setError] = useState<string>('');

  const reload = async () => {
    if (!path) return;
    setLoading(true);
    setError('');
    try {
      const result = await api<T>(path);
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [path]);

  return { data, loading, error, reload };
}