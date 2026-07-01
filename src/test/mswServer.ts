import { setupServer } from 'msw/node';

/**
 * Shared MSW server for API-integration tests. Handlers are registered per-test with
 * {@code server.use(...)}; call {@link installMswLifecycle} from a test file to wire the
 * listen/reset/close lifecycle. jsdom (Vitest env) is the request origin, so relative
 * {@code /v1/insights/*} paths resolve against {@code window.location.origin}.
 */
export const server = setupServer();

export function installMswLifecycle() {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
