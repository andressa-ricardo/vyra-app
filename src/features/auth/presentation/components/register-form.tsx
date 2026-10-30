import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
  AuthDivider,
  AuthTextField,
  Checkbox,
  PrimaryButton,
  SocialButtons,
} from '@/features/auth/presentation/components/auth-ui';
import {
  createRegisterSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { authColors, fonts, spacing } from '@/theme';

type RegisterFormProps = {
  isSubmitting: boolean;
  onSocialPress: () => void;
  onSubmit: (values: RegisterFormValues) => Promise<boolean>;
};

export function RegisterForm({ isSubmitting, onSocialPress, onSubmit }: RegisterFormProps) {
  const { t } = useTranslation();
  const schema = createRegisterSchema((key) => t(key));
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
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
          <AuthTextField
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
          <AuthTextField
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
          <AuthTextField
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.password?.message}
            label={t('auth.register.password')}
            onBlur={onBlur}
            onChangeText={onChange}
            password
            placeholder={t('auth.register.passwordPlaceholder')}
            returnKeyType="next"
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onBlur, onChange, value } }) => (
          <AuthTextField
            autoCapitalize="none"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label={t('auth.register.confirmPassword')}
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => void submitForm()}
            password
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            returnKeyType="done"
            textContentType="newPassword"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="acceptTerms"
        render={({ field: { onChange, value } }) => (
          <View style={styles.termsBlock}>
            <Checkbox
              checked={value}
              label={
                <Text>
                  {t('auth.register.termsPrefix')}{' '}
                  <Text style={styles.link}>{t('auth.register.termsOfUse')}</Text>{' '}
                  {t('auth.register.termsAnd')}{' '}
                  <Text style={styles.link}>{t('auth.register.privacyPolicy')}</Text>.
                </Text>
              }
              onPress={() => onChange(!value)}
            />
            {errors.acceptTerms?.message ? (
              <Text style={styles.termsError}>{errors.acceptTerms.message}</Text>
            ) : null}
          </View>
        )}
      />

      <View style={styles.submitSpacing}>
        <PrimaryButton
          label={t('auth.register.submit')}
          loading={isSubmitting}
          onPress={() => void submitForm()}
        />
      </View>

      <AuthDivider label={t('auth.register.or')} />
      <SocialButtons onPress={onSocialPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 17 },
  termsBlock: { gap: spacing.one },
  termsError: {
    color: authColors.danger,
    fontFamily: fonts.sans,
    fontSize: 12,
    marginLeft: 31,
  },
  link: { color: authColors.primary },
  submitSpacing: { marginTop: spacing.two },
});
