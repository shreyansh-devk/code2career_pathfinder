'use client';
export async function api<T>(path: string, data?: unknown,signal?:AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`,{ method:data === undefined ? 'GET' : 'POST',headers:data === undefined ? {} : { 'Content-Type':'application/json' },body:data === undefined ? undefined : JSON.stringify(data),cache:'no-store',signal });
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name==='AbortError')) throw error;
    throw new Error('Could not reach the server. Check your connection and refresh to check whether your changes were saved.');
  }
  if (response.ok && (response.status===204 || response.status===205)) return undefined as T;
  let result: unknown;
  try { result = await response.json(); } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name==='AbortError')) throw error;
    // Hosting layers may return HTML or an empty body.
  }
  if (!response.ok) {
    const message = result && typeof result==='object' && 'error' in result && typeof result.error==='string' ? result.error.slice(0,500) : null;
    throw new Error(message || `The server could not complete this request (HTTP ${response.status}). Refresh to check your saved work before retrying.`);
  }
  if (result===undefined) throw new Error('The server returned an unreadable response. Refresh to check your saved work before retrying.');
  return result as T;
}
