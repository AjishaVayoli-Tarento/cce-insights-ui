import { ApiError } from '../api/client';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400: return `Invalid request: ${error.body.message}`;
      case 404: return 'Resource not found';
      case 503: return 'Service unavailable — database may be down';
      default: return error.body.message || `Unexpected error (${error.status})`;
    }
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Cannot reach Insights Service. Check that it is running on the configured port.';
  }
  return 'An unexpected error occurred';
}
