import { ZodError } from 'zod';
import { configuredOrigins } from './surfaces';
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function body(request: Request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 64000) throw new ApiError(413, 'Request is too large.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'A JSON body is required.');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 64000) { await reader.cancel(); throw new ApiError(413, 'Request is too large.'); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new ApiError(400, 'Use a valid JSON request.'); }
}
export function checkOrigin(request: Request) {
  const allowed = configuredOrigins();
  if (allowed.length) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') || new URL(request.url).host;
    if (!origin || !allowed.includes(origin) || new URL(origin).host !== host.toLowerCase()) throw new ApiError(403, 'This request must come from this application.');
    if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'Use application/json.');
    return;
  }
  // Next's proxy normalizes the internal URL to localhost in development. Compare the browser
  // origin to the original request authority instead. Browser JavaScript cannot forge Host.
  const target = new URL(process.env.APP_ORIGIN || request.url);
  if (!process.env.APP_ORIGIN && request.headers.get('host')) target.host = request.headers.get('host')!;
  if (request.headers.get('origin') !== target.origin) throw new ApiError(403, 'This request must come from this application.');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'Use application/json.');
}
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } }); }
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError) return json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).slice(0,3).join(' ') }, 400);
  // Provider errors, database connection strings and request bodies must never reach clients or logs.
  return json({ error: 'The service could not complete this request. Your saved work is unchanged. Try again or check service configuration.' }, 503);
}
