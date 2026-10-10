import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/lib/client';

test('API client handles JSON, proxy HTML, empty responses and network failures', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ value:42 });
    assert.deepEqual(await api('example'), { value:42 });
    globalThis.fetch = async () => Response.json({ error:'This roadmap changed.' }, { status:409 });
    await assert.rejects(api('example'), /This roadmap changed/);
    globalThis.fetch = async () => new Response('<html>Private proxy details</html>', { status:502 });
    await assert.rejects(api('example'), error => error instanceof Error && /HTTP 502/.test(error.message) && !/Private proxy/.test(error.message));
    globalThis.fetch = async () => new Response('', { status:503 });
    await assert.rejects(api('example'), /HTTP 503/);
    globalThis.fetch = async () => new Response(null, { status:204 });
    assert.equal(await api('example'), undefined);
    globalThis.fetch = async () => new Response('', { status:200 });
    await assert.rejects(api('example'), /unreadable response/);
    globalThis.fetch = async () => { throw new TypeError('Private network internals'); };
    await assert.rejects(api('example'), /Could not reach the server/);
    const cancelled = new DOMException('Cancelled', 'AbortError');
    globalThis.fetch = async () => { throw cancelled; };
    await assert.rejects(api('example'), error => error===cancelled);
    globalThis.fetch = async () => {
      const response=Response.json({ value:42 });
      response.json=async () => { throw cancelled; };
      return response;
    };
    await assert.rejects(api('example'), error => error===cancelled);
  } finally {
    globalThis.fetch = original;
  }
});
