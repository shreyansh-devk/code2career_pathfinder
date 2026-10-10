export type Surface = { key: 'user' | 'admin' | 'organization'; url: URL; path: string };

export function surfaces(): Surface[] {
  const definitions = [
    { key: 'user' as const, value: process.env.USER_APP_URL, path: '/app' },
    { key: 'admin' as const, value: process.env.ADMIN_APP_URL, path: '/admin' },
    { key: 'organization' as const, value: process.env.ORG_APP_URL, path: '/org' },
  ];
  return definitions.filter(item => item.value).map(item => {
    const url = new URL(item.value!);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('INVALID_SURFACE_URL');
    return { key: item.key, url, path: item.path };
  });
}

export function surfaceForHost(host: string | null) {
  return surfaces().find(surface => surface.url.host === host?.toLowerCase());
}

export function workspaceUrl(role: 'learner' | 'teacher' | 'owner' | 'admin') {
  const key = role === 'admin' ? 'admin' : role === 'learner' ? 'user' : 'organization';
  const path = key === 'admin' ? '/admin' : key === 'user' ? '/app' : '/org';
  const surface = surfaces().find(item => item.key === key);
  return surface ? new URL(path,surface.url).toString() : path;
}

export function surfaceRedirect(request: Request): URL | null {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const incoming = new URL(request.url);
  const current = surfaceForHost(request.headers.get('host') || incoming.host);
  if (!current) return null;
  const target = surfaces().find(surface => incoming.pathname === surface.path || incoming.pathname.startsWith(surface.path + '/'));
  if (!target || target.key === current.key) return null;
  const destination = new URL(target.url);
  destination.pathname = incoming.pathname;
  destination.search = incoming.search;
  return destination;
}

export function configuredOrigins() {
  return (process.env.APP_ORIGINS || process.env.APP_ORIGIN || '').split(',').map(value => value.trim()).filter(Boolean);
}
