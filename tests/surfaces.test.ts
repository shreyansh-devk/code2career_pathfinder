import { test } from 'node:test';
import assert from 'node:assert/strict';
import { surfaces, surfaceForHost, surfaceRedirect, workspaceUrl } from '../src/lib/surfaces';
import { checkOrigin, ApiError } from '../src/lib/http';

test('separate surface domains route safely and reject cross-domain mutations', () => {
  const keys = ['USER_APP_URL','ADMIN_APP_URL','ORG_APP_URL','APP_ORIGINS'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    process.env.USER_APP_URL = 'https://learner.example';
    process.env.ADMIN_APP_URL = 'https://operator.example';
    process.env.ORG_APP_URL = 'https://organization.example';
    process.env.APP_ORIGINS = 'https://learner.example,https://operator.example,https://organization.example';
    assert.equal(surfaceForHost('operator.example')?.path, '/admin');
    assert.equal(surfaceForHost('hostile.example'), undefined);
    assert.equal(workspaceUrl('admin'), 'https://operator.example/admin');
    assert.equal(workspaceUrl('learner'), 'https://learner.example/app');
    assert.equal(workspaceUrl('teacher'), 'https://organization.example/org');
    assert.equal(workspaceUrl('owner'), 'https://organization.example/org');
    const request = new Request('https://learner.example/admin?view=a');
    assert.equal(surfaceRedirect(request)?.href, 'https://operator.example/admin?view=a');
    assert.equal(surfaceRedirect(new Request('https://learner.example/app')), null);
    assert.equal(surfaceRedirect(new Request('https://hostile.example/admin')), null);
    assert.equal(surfaceRedirect(new Request(request, { method: 'POST' })), null);
    for (const host of ['learner.example','operator.example','organization.example']) {
      assert.doesNotThrow(() => checkOrigin(new Request(`https://${host}/api/example`, { method:'POST', headers:{ Host:host, Origin:`https://${host}`, 'Content-Type':'application/json' }, body:'{}' })));
    }
    assert.throws(() => checkOrigin(new Request('https://operator.example/api/example', { method:'POST', headers:{ Host:'operator.example', Origin:'https://learner.example', 'Content-Type':'application/json' }, body:'{}' })), ApiError);
    process.env.ADMIN_APP_URL = 'https://operator.example/untrusted';
    assert.throws(surfaces, /INVALID_SURFACE_URL/);
  } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  }
});
