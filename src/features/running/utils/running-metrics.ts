import type {
  RunningPoint,
  RunningSplit,
} from "@/features/running/types/running.types";

/** Variações menores que isso são ruído da altitude do GPS. */
const ELEVATION_NOISE_M = 3;

export type GpsSignal = "searching" | "strong" | "medium" | "weak";

export function gpsSignal(point: RunningPoint | undefined): GpsSignal {
  if (!point) return "searching";
  if (point.accuracyM === null || point.accuracyM > 25) return "weak";
  return point.accuracyM <= 10 ? "strong" : "medium";
}

/** Soma só as subidas que superam o ruído; null quando o percurso não tem altitude. */
export function elevationGain(points: RunningPoint[]) {
  const altitudes = points.flatMap(({ altitudeM }) =>
    altitudeM === null ? [] : [altitudeM],
  );
  if (altitudes.length < 2) return null;
  let gain = 0;
  let reference = altitudes[0];
  for (const altitude of altitudes.slice(1)) {
    const delta = altitude - reference;
    if (delta >= ELEVATION_NOISE_M) gain += delta;
    if (Math.abs(delta) >= ELEVATION_NOISE_M) reference = altitude;
  }
  return Math.round(gain);
}

/** Altitude média em `buckets` trechos consecutivos do percurso, para o gráfico de elevação. */
export function elevationProfile(points: RunningPoint[], buckets = 24) {
  const altitudes = points.flatMap(({ altitudeM }) =>
    altitudeM === null ? [] : [altitudeM],
  );
  if (altitudes.length < 2) return [];
  const size = Math.max(1, altitudes.length / buckets);
  const profile: number[] = [];
  for (let start = 0; start < altitudes.length; start += size) {
    const slice = altitudes.slice(Math.floor(start), Math.floor(start + size));
    if (slice.length)
      profile.push(slice.reduce((sum, value) => sum + value, 0) / slice.length);
  }
  return profile;
}

/** Estimativa usual para corrida: ~1 kcal por kg de peso por km. */
export function estimateCalories(
  distanceMeters: number,
  weightKg: number | null,
) {
  if (!weightKg || weightKg <= 0) return null;
  return Math.round(weightKg * (distanceMeters / 1_000) * 1.036);
}

export function averageSpeedKmh(distanceMeters: number, seconds: number) {
  if (seconds <= 0 || distanceMeters < 10) return null;
  return distanceMeters / 1_000 / (seconds / 3_600);
}

export function fastestSplit(splits: RunningSplit[]) {
  return splits.reduce<RunningSplit | null>(
    (best, split) =>
      !best || split.paceSecondsKm < best.paceSecondsKm ? split : best,
    null,
  );
}
