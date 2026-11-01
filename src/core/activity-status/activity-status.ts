import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import type { ActivityStatus } from './activity-status.types';

type LiveActivityModule = typeof import('./activity-live-activity');
type NotificationModule = typeof import('./activity-notification');
type LiveActivity = ReturnType<LiveActivityModule['ActivityLiveActivity']['start']>;

const NOTIFICATION_COLOR = '#3B82F6';

let liveActivity: LiveActivity | null = null;
let pending: Promise<unknown> = Promise.resolve();

/** `expo-widgets` não existe no Expo Go nem na web; lá o aviso simplesmente não aparece. */
function isSupported() {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && !isRunningInExpoGo();
}

/* eslint-disable @typescript-eslint/no-require-imports -- carregados sob demanda: importar no topo quebraria o Expo Go. */
function loadLiveActivity(): LiveActivityModule {
  return require('./activity-live-activity') as LiveActivityModule;
}

function loadNotification(): NotificationModule {
  return require('./activity-notification') as NotificationModule;
}
/* eslint-enable @typescript-eslint/no-require-imports */

/** Tela, rastreamento em segundo plano e tarefa podem publicar ao mesmo tempo; executa em ordem. */
function enqueue(operation: () => Promise<unknown>) {
  pending = pending.then(operation).catch(() => undefined);
  return pending;
}

/** Android 13+ exige permissão para notificações; no iOS a Live Activity não depende dela. */
export async function requestActivityStatusPermission() {
  if (Platform.OS !== 'android' || !isSupported()) return;
  try {
    const Notifications = await import('expo-notifications');
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted && current.canAskAgain) await Notifications.requestPermissionsAsync();
  } catch {
    // Sem permissão a atividade continua normalmente, apenas sem o aviso.
  }
}

/**
 * Mostra ou atualiza o aviso da atividade em andamento. Só existe uma atividade por vez;
 * `id` identifica a notificação no Android (ex.: o id local da corrida).
 */
export function showActivityStatus(id: string, status: ActivityStatus) {
  if (!isSupported()) return Promise.resolve();
  return enqueue(async () => {
    if (Platform.OS === 'ios') {
      const { ActivityLiveActivity } = loadLiveActivity();
      // Depois de o app ser reaberto, a Live Activity já existe no sistema.
      liveActivity ??= ActivityLiveActivity.getInstances()[0] ?? null;
      if (liveActivity) await liveActivity.update(status);
      else liveActivity = ActivityLiveActivity.start(status, status.url);
      return;
    }

    const { ActivityNotification } = loadNotification();
    // Postar com o mesmo id substitui a notificação no lugar, sem alertar de novo.
    await ActivityNotification.post(status, {
      id,
      ongoing: true,
      title: status.title,
      text: `${status.primaryValue} ${status.primaryUnit} · ${status.elapsedText}`,
      url: status.url,
      color: NOTIFICATION_COLOR,
    });
  });
}

export function endActivityStatus(id: string) {
  if (!isSupported()) return Promise.resolve();
  return enqueue(async () => {
    if (Platform.OS === 'ios') {
      const { ActivityLiveActivity } = loadLiveActivity();
      const instances = liveActivity ? [liveActivity] : ActivityLiveActivity.getInstances();
      liveActivity = null;
      await Promise.all(instances.map((instance) => instance.end('immediate')));
      return;
    }

    const { ActivityNotification } = loadNotification();
    await (await ActivityNotification.get(id))?.cancel();
  });
}
