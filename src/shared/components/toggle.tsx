import { Pressable, View } from 'react-native';

type ToggleProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

/** Toggle visual do VYRA, reutilizável sem depender do estilo nativo de cada plataforma. */
export function Toggle({ accessibilityLabel, disabled = false, onValueChange, value }: ToggleProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      className={[
        'h-5 w-9 justify-center rounded-full p-[2px]',
        value ? 'bg-auth-primary' : 'bg-auth-pressed',
        disabled ? 'opacity-50' : 'active:opacity-80',
      ].join(' ')}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}>
      <View
        className={[
          'h-4 w-4 rounded-full',
          value ? 'self-end bg-auth-bg' : 'self-start bg-auth-border',
        ].join(' ')}
      />
    </Pressable>
  );
}
