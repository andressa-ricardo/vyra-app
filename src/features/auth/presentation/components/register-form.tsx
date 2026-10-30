import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {
  createRegisterSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { useTheme } from '@/shared/hooks/use-theme';
import { fonts, spacing } from '@/theme';

type RegisterFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: RegisterFormValues) => Promise<boolean>;
};

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

function FormField({ label, error, ...inputProps }: FormFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.error : theme.border,
            color: theme.text,
          },
        ]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function RegisterForm({ isSubmitting, onSubmit }: RegisterFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const schema = createRegisterSchema((key) => t(key));
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const submitForm = handleSubmit(async (values) => {
    const succeeded = await onSubmit(values);
    if (succeeded) reset();
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <FormField
            autoCapitalize="words"
            autoComplete="name"
            error={errors.name?.message}
            label={t('auth.register.name')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.register.namePlaceholder')}
            returnKeyType="next"
            textContentType="name"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <FormField
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            inputMode="email"
            keyboardType="email-address"
            label={t('auth.register.email')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.register.emailPlaceholder')}
            returnKeyType="next"
            textContentType="emailAddress"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <FormField
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.password?.message}
            label={t('auth.register.password')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.register.passwordPlaceholder')}
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onBlur, onChange, value } }) => (
          <FormField
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label={t('auth.register.confirmPassword')}
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => void submitForm()}
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            returnKeyType="done"
            secureTextEntry
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
        disabled={isSubmitting}
        onPress={() => void submitForm()}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary },
          (pressed || isSubmitting) && styles.buttonDimmed,
        ]}>
        {isSubmitting ? (
          <ActivityIndicator color={theme.onPrimary} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            {t('auth.register.submit')}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.three,
  },
  fieldContainer: {
    gap: spacing.one,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.three,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.one,
  },
  buttonDimmed: {
    opacity: 0.72,
  },
  buttonText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
});
