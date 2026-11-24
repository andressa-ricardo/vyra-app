import { httpClient } from '@/core/api/http-client';
import type { SportModality } from '@/features/sports/types/sports.types';

export async function fetchSportModalities(): Promise<SportModality[]> {
  const { data } = await httpClient.get<SportModality[]>('/sport-modalities');
  return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
}
