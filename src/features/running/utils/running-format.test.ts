import type { RunningPoint } from '@/features/running/types/running.types';

import { acceptsPoint, advanceLiveDistance, distanceBetween } from './running-format';

function point(seconds: number, latitude: number, accuracyM: number | null = 5): RunningPoint {
  return {
    clientPointId: `p-${seconds}-${latitude}`,
    recordedAt: new Date(Date.UTC(2026, 9, 31, 7, 0, seconds)).toISOString(),
    latitude,
    longitude: 0,
    accuracyM,
    altitudeM: null,
  };
}

describe('acceptsPoint', () => {
  it('rejects imprecise fixes and impossible jumps', () => {
    expect(acceptsPoint(undefined, point(0, 0))).toBe(true);
    expect(acceptsPoint(undefined, point(0, 0, 150))).toBe(false);
    // ~11 m em 3 s é corrida; ~1,1 km em 3 s é salto do GPS.
    expect(acceptsPoint(point(0, 0), point(3, 0.0001))).toBe(true);
    expect(acceptsPoint(point(0, 0), point(3, 0.01))).toBe(false);
  });
});

describe('advanceLiveDistance', () => {
  it('starts at zero and adds only accepted points newer than the last one', () => {
    const first = advanceLiveDistance(undefined, [point(0, 0)]);
    expect(first?.distanceMeters).toBe(0);

    const step = distanceBetween(point(0, 0), point(3, 0.0001));
    const next = advanceLiveDistance(first, [
      point(0, 0), // já contado
      point(3, 0.0001),
      point(6, 0.05), // salto do GPS
    ]);
    expect(next?.distanceMeters).toBeCloseTo(step);
    expect(next?.lastPoint.recordedAt).toBe(point(3, 0.0001).recordedAt);
  });
});
