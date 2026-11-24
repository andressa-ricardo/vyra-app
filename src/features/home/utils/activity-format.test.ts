import {
  daysAgo,
  durationParts,
  formatClock,
  formatKilometers,
  formatPace,
  formatVolumeKg,
} from './activity-format';
import { mondayIndex, nameInitials, sumSecondsByWeekday } from './week-activity';

describe('activity-format', () => {
  it('splits durations into hours and minutes', () => {
    expect(durationParts(15_120)).toEqual([
      { value: '4', unit: 'h' },
      { value: '12', unit: 'min' },
    ]);
    expect(durationParts(2_280)).toEqual([{ value: '38', unit: 'min' }]);
  });

  it('formats clocks, pace, distance and volume', () => {
    expect(formatClock(2_652)).toBe('44:12');
    expect(formatClock(3_723)).toBe('1:02:03');
    expect(formatPace(330)).toBe('5:30');
    expect(formatKilometers(8_040, 'pt-BR')).toBe('8,04');
    expect(formatKilometers(17_400, 'pt-BR', 1)).toBe('17,4');
    expect(formatVolumeKg(6_240_000, 'pt-BR')).toBe('6.240');
  });

  it('counts calendar days between dates', () => {
    const now = new Date(2026, 10, 24, 0, 30);
    expect(daysAgo(new Date(2026, 10, 24, 0, 5).toISOString(), now)).toBe(0);
    expect(daysAgo(new Date(2026, 10, 23, 23, 50).toISOString(), now)).toBe(1);
    expect(daysAgo(new Date(2026, 10, 21, 8).toISOString(), now)).toBe(3);
  });
});

describe('week-activity', () => {
  it('maps weekdays with Monday first', () => {
    expect(mondayIndex(new Date(2026, 10, 23, 12).toISOString())).toBe(0); // segunda
    expect(mondayIndex(new Date(2026, 10, 29, 12).toISOString())).toBe(6); // domingo
  });

  it('sums active seconds per weekday', () => {
    const days = sumSecondsByWeekday([
      { startedAt: new Date(2026, 10, 23, 7).toISOString(), activeDurationSeconds: 600 },
      { startedAt: new Date(2026, 10, 23, 19).toISOString(), activeDurationSeconds: 300 },
      { startedAt: new Date(2026, 10, 26, 7).toISOString(), activeDurationSeconds: 1_200 },
    ]);
    expect(days).toEqual([900, 0, 0, 1_200, 0, 0, 0]);
  });

  it('builds avatar initials', () => {
    expect(nameInitials('Julia Andrade')).toBe('JA');
    expect(nameInitials('  ana  ')).toBe('A');
    expect(nameInitials('Maria da Silva Souza')).toBe('MS');
    expect(nameInitials('')).toBe('');
  });
});
