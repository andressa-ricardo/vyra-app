import { useId, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { authColors } from '@/theme';

type Point = { x: number; y: number };

/** Curva suave (Catmull-Rom convertida em Bézier cúbica) passando por todos os pontos. */
function smoothPath(points: Point[]) {
  if (points.length < 2) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    path += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function SmoothLineChart({
  values,
  height,
  dots = false,
  grid = false,
  padding = 8,
}: {
  values: number[];
  height: number;
  /** Marca os pontos com valor maior que zero. */
  dots?: boolean;
  grid?: boolean;
  padding?: number;
}) {
  const [width, setWidth] = useState(0);
  const gradientId = `area-${useId().replace(/:/g, '')}`;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  const points = values.map((value, index) => ({
    x: padding + index * step,
    // Série constante fica no meio; caso contrário, o menor valor encosta embaixo.
    y: max === min ? height / 2 : padding + (1 - (value - min) / range) * (height - padding * 2),
  }));
  const line = smoothPath(points);
  const area = line ? `${line} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z` : '';

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && line ? (
        <Svg height={height} width={width}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={authColors.primary} stopOpacity={0.22} />
              <Stop offset="1" stopColor={authColors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {grid
            ? [
                ...Array.from({ length: 4 }, (_, index) => {
                  const y = ((index + 1) * height) / 5;
                  return <Line key={`h${index}`} stroke={authColors.border} strokeOpacity={0.5} strokeWidth={1} x1={0} x2={width} y1={y} y2={y} />;
                }),
                ...Array.from({ length: 9 }, (_, index) => {
                  const x = ((index + 1) * width) / 10;
                  return <Line key={`v${index}`} stroke={authColors.border} strokeOpacity={0.5} strokeWidth={1} x1={x} x2={x} y1={0} y2={height} />;
                }),
              ]
            : null}
          <Path d={area} fill={`url(#${gradientId})`} />
          <Path d={line} fill="none" stroke={authColors.primary} strokeLinecap="round" strokeWidth={3} />
          {dots
            ? points.map((point, index) =>
                values[index] > 0 ? (
                  <Circle cx={point.x} cy={point.y} fill={authColors.primary} key={index} r={4} />
                ) : null,
              )
            : null}
        </Svg>
      ) : null}
    </View>
  );
}
