import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { AuthProvider } from './auth/AuthContext';
import keycloak from './auth/keycloak';
import { getEnv } from './env';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

async function bootstrap() {
  if (getEnv('VITE_AUTH_ENABLED') === 'true') {
    // login-required: redirects to Keycloak if not authenticated.
    // App only renders once the user is authenticated.
    await keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <FilterProvider>
              <App />
            </FilterProvider>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap();
