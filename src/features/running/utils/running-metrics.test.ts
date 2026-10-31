import type { RunningPoint } from '@/features/running/types/running.types';

import {
  averageSpeedKmh,
  elevationGain,
  elevationProfile,
  estimateCalories,
  fastestSplit,
  gpsSignal,
} from './running-metrics';

function point(altitudeM: number | null, accuracyM: number | null = 5): RunningPoint {
  return {
    clientPointId: String(Math.random()),
    recordedAt: new Date().toISOString(),
    latitude: 0,
    longitude: 0,
    accuracyM,
    altitudeM,
  };
}

describe('running metrics', () => {
  it('classifies GPS accuracy', () => {
    expect(gpsSignal(undefined)).toBe('searching');
    expect(gpsSignal(point(0, 8))).toBe('strong');
    expect(gpsSignal(point(0, 20))).toBe('medium');
    expect(gpsSignal(point(0, 60))).toBe('weak');
    expect(gpsSignal(point(0, null))).toBe('weak');
  });

  it('counts climbs and ignores altitude noise', () => {
    const altitudes = [100, 101, 99, 100, 106, 110, 104, 103, 109];
    expect(elevationGain(altitudes.map((value) => point(value)))).toBe(15);
    expect(elevationGain([point(null), point(100)])).toBeNull();
  });

  it('averages altitude into buckets', () => {
    const profile = elevationProfile([10, 20, 30, 40].map((value) => point(value)), 2);
    expect(profile).toEqual([15, 35]);
    expect(elevationProfile([point(null)])).toEqual([]);
  });

  it('estimates calories only with body weight', () => {
    expect(estimateCalories(10_000, 70)).toBe(725);
    expect(estimateCalories(10_000, null)).toBeNull();
  });

  it('computes average speed and the fastest split', () => {
    expect(averageSpeedKmh(5_000, 1_800)).toBe(10);
    expect(averageSpeedKmh(0, 60)).toBeNull();
    expect(
      fastestSplit([
        { kilometer: 1, durationSeconds: 330, paceSecondsKm: 330 },
        { kilometer: 2, durationSeconds: 320, paceSecondsKm: 320 },
      ])?.kilometer,
    ).toBe(2);
    expect(fastestSplit([])).toBeNull();
  });
});
