'use client';
export async function api<T>(path: string, data?: unknown,signal?:AbortSignal): Promise<T> {
  const response = await fetch(`/api/${path}`,{ method:data === undefined ? 'GET' : 'POST',headers:data === undefined ? {} : { 'Content-Type':'application/json' },body:data === undefined ? undefined : JSON.stringify(data),cache:'no-store',signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result as T;
}
