import { router } from 'expo-router';

/** Modalidades que já têm uma tela própria no app. */
export const sportsWithOwnScreen = new Set(['running', 'strength-training']);

/** Corrida e musculação abrem suas telas; as demais modalidades abrem a prévia genérica. */
export function openSport(slug: string, name?: string) {
  if (slug === 'running') return router.push('/sports/running');
  if (slug === 'strength-training') return router.push('/workouts');
  router.push({ pathname: '/sports/[slug]', params: name ? { slug, name } : { slug } });
}
