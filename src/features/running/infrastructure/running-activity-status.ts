import * as Linking from 'expo-linking';

import { endActivityStatus, showActivityStatus } from '@/core/activity-status/activity-status';
import type { LocalRunningState } from '@/features/running/types/running.types';
import {
  activeSeconds,
  formatDistanceKm,
  formatDuration,
  formatPace,
} from '@/features/running/utils/running-format';
import { i18n } from '@/i18n';

/** O iOS conta o tempo sozinho; no Android o tempo do aviso avança a cada atualização. */
const MIN_INTERVAL_MS = 5_000;

let last: { runId: string; paused: boolean; at: number } | null = null;

/**
 * Atualiza o aviso de corrida em andamento (tela de bloqueio / barra de notificações).
 * Chamado pela tela e pela tarefa de localização em segundo plano; respeita um intervalo mínimo,
 * exceto quando a corrida é pausada ou retomada.
 */
export function publishRunningStatus(run: LocalRunningState, distanceMeters: number) {
  if (run.finish) return Promise.resolve();
  const now = Date.now();
  const paused = run.status === 'PAUSED';
  const changed = last?.runId !== run.clientRequestId || last.paused !== paused;
  if (!changed && last && now - last.at < MIN_INTERVAL_MS) return Promise.resolve();
  last = { runId: run.clientRequestId, paused, at: now };

  const elapsed = activeSeconds(run.startedAt, run.pauses, now);
  const pace = distanceMeters >= 10 ? Math.round(elapsed / (distanceMeters / 1_000)) : null;
  const t = i18n.t.bind(i18n);

  return showActivityStatus(run.clientRequestId, {
    title: t('running.liveStatus.title'),
    iosSymbol: 'figure.run',
    primaryValue: formatDistanceKm(distanceMeters, i18n.resolvedLanguage),
    primaryUnit: t('running.units.kilometers'),
    secondaryLabel: t('running.averagePace'),
    secondaryValue: `${formatPace(pace)} ${t('running.units.pace')}`,
    elapsedLabel: t('running.time'),
    elapsedText: formatDuration(elapsed),
    timerStartMs: now - elapsed * 1_000,
    paused,
    pausedLabel: t('running.liveStatus.paused'),
    url: Linking.createURL('/run'),
  });
}

export function clearRunningStatus(runId: string) {
  last = null;
  return endActivityStatus(runId);
}
