import type { LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

export function MetricCard({
  color,
  icon: Icon,
  label,
  unit,
  value,
  variant = 'card',
}: {
  color: string;
  icon: LucideIcon;
  label: string;
  unit?: string;
  value: string;
  /** `card` é um bloco isolado; `cell` é uma célula da grade do resumo. */
  variant?: 'card' | 'cell';
}) {
  const cell = variant === 'cell';

  return (
    <View
      accessible
      accessibilityLabel={[label, value, unit].filter(Boolean).join(' ')}
      className={[
        'flex-1 bg-auth-surface',
        cell ? 'items-center gap-1 px-2 py-4' : 'gap-1 rounded-[20px] p-3.5',
      ].join(' ')}>
      <Icon color={color} size={cell ? 22 : 20} strokeWidth={2} />
      <Text
        className={['font-extrabold text-auth-text', cell ? 'mt-1 text-xl' : 'mt-1 text-lg'].join(' ')}
        maxFontSizeMultiplier={1.1}
        numberOfLines={1}>
        {value}
      </Text>
      <Text
        className={['text-[11px] leading-[14px] text-auth-muted', cell ? 'text-center' : ''].join(' ')}
        maxFontSizeMultiplier={1.05}
        numberOfLines={2}>
        {label}
        {unit ? `\n${unit}` : ''}
      </Text>
    </View>
  );
}
