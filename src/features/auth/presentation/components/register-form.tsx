import { zodResolver } from '@hookform/resolvers/zod';
import type { ComponentProps } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { AuthDivider, Checkbox, SocialButtons } from '@/features/auth/presentation/components/auth-ui';
import {
  createRegisterSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { PrimaryButton } from '@/shared/components/primary-button';
import { TextField } from '@/shared/components/text-field';

type RegisterFormProps = {
  isSubmitting: boolean;
  social: ComponentProps<typeof SocialButtons>;
  onSubmit: (values: RegisterFormValues) => Promise<boolean>;
};

export function RegisterForm({ isSubmitting, onSubmit, social }: RegisterFormProps) {
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
    <View className="gap-3.5">
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextField
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
          <TextField
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
          <TextField
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
          <TextField
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
          <View className="gap-1">
            <Checkbox
              checked={value}
              label={
                <Text>
                  {t('auth.register.termsPrefix')}{' '}
                  <Text className="text-auth-primary">{t('auth.register.termsOfUse')}</Text>{' '}
                  {t('auth.register.termsAnd')}{' '}
                  <Text className="text-auth-primary">{t('auth.register.privacyPolicy')}</Text>.
                </Text>
              }
              onPress={() => onChange(!value)}
            />
            {errors.acceptTerms?.message ? (
              <Text
                className="ml-[29px] text-[11px] text-auth-danger"
                maxFontSizeMultiplier={1.05}>
                {errors.acceptTerms.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <View className="mt-1.5">
        <PrimaryButton
          label={t('auth.register.submit')}
          loading={isSubmitting}
          onPress={() => void submitForm()}
        />
      </View>

      <AuthDivider label={t('auth.register.or')} />
      <SocialButtons {...social} />
    </View>
  );
}
