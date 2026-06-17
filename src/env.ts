declare global {
  interface Window {
    _env_: Record<string, string>;
  }
}

// Priority: Docker runtime (window._env_, non-empty) → Vite build/dev env → fallback.
// Empty string in window._env_ is treated as unset so .env.local overrides work in dev.
export function getEnv(key: string, fallback = ''): string {
  const runtime = window._env_?.[key];
  if (runtime !== undefined && runtime !== '') return runtime;
  return (import.meta.env[key] as string | undefined) ?? fallback;
}
