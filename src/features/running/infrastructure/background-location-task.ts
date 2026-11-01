import type { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { publishRunningStatus } from '@/features/running/infrastructure/running-activity-status';
import {
  appendRunningPoints,
  readLocalRun,
  updateLocalRun,
} from '@/features/running/infrastructure/running-storage';
import { advanceLiveDistance, toRunningPoint } from '@/features/running/utils/running-format';

export const RUNNING_LOCATION_TASK = 'vyra-running-location';

if (!TaskManager.isTaskDefined(RUNNING_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: LocationObject[] }>(
    RUNNING_LOCATION_TASK,
    async ({ data, error }) => {
      if (error || !data?.locations.length) return;
      const run = await readLocalRun();
      // Locations received while paused or after finishing are not part of the run.
      if (!run || run.status !== 'ACTIVE' || run.finish) return;
      const points = data.locations.map(toRunningPoint);
      await appendRunningPoints(run.clientRequestId, points);

      // Mantém o aviso da tela de bloqueio atualizado enquanto o app não está visível.
      const updated = await updateLocalRun(run.clientRequestId, (stored) => ({
        ...stored,
        live: advanceLiveDistance(stored.live, points),
      }));
      if (updated && updated.status === 'ACTIVE' && !updated.finish) {
        await publishRunningStatus(updated, updated.live?.distanceMeters ?? 0);
      }
    },
  );
}
