import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FilterProvider } from './context/FilterContext';
import { App } from './App';
import { initKeycloak } from './auth/keycloak';
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

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <FilterProvider>
            <App />
          </FilterProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';
const hasKeycloakConfig = !!import.meta.env.VITE_KEYCLOAK_URL;

if (authEnabled && hasKeycloakConfig) {
  initKeycloak().then(render);
} else {
  render();
}
