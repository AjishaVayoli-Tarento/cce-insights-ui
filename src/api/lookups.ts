import { apiGet } from './client';
import type { ProtocolLookup } from './types';

export function getProtocols() {
  return apiGet<ProtocolLookup[]>('/lookups/protocols');
}

export function getFacilities() {
  return apiGet<string[]>('/lookups/facilities');
}

export function getPractitioners() {
  return apiGet<string[]>('/lookups/practitioners');
}

export function getSources() {
  return apiGet<string[]>('/lookups/sources');
}

export function getPatients() {
  return apiGet<string[]>('/lookups/patients');
}
