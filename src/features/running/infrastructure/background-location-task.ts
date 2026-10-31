import type { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import {
  appendRunningPoints,
  readLocalRun,
} from '@/features/running/infrastructure/running-storage';
import { toRunningPoint } from '@/features/running/utils/running-format';

export const RUNNING_LOCATION_TASK = 'vyra-running-location';

if (!TaskManager.isTaskDefined(RUNNING_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: LocationObject[] }>(
    RUNNING_LOCATION_TASK,
    async ({ data, error }) => {
      if (error || !data?.locations.length) return;
      const run = await readLocalRun();
      // Locations received while paused or after finishing are not part of the run.
      if (!run || run.status !== 'ACTIVE' || run.finish) return;
      await appendRunningPoints(run.clientRequestId, data.locations.map(toRunningPoint));
    },
  );
}
