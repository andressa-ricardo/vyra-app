import { zodResolver } from '@hookform/resolvers/zod';
import Info from 'lucide-react-native/icons/info';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { OnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import {
  createPersonalDataSchema,
  type PersonalDataFormValues,
} from '@/features/onboarding/schemas/personal-data.schema';
import { fitnessLevels } from '@/features/onboarding/types/onboarding.types';
import { maskBirthDate } from '@/features/onboarding/utils/personal-data';
import { TextField } from '@/shared/components/text-field';
import { authColors } from '@/theme';

import { OnboardingLayout } from './onboarding-layout';

export function PersonalDataStep({ flow }: { flow: OnboardingFlow }) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDataFormValues>({
    resolver: zodResolver(createPersonalDataSchema((key) => t(key))),
    defaultValues: flow.personalData,
  });
  const values = useWatch({ control });
  const isEmpty =
    !values.displayName?.trim() &&
    !values.birthDate &&
    !values.heightCm &&
    !values.currentWeightKg &&
    !values.fitnessLevel;

  const submit = handleSubmit((data) => flow.savePersonalData(data));

  return (
    <OnboardingLayout
      description={t('onboarding.personal.description')}
      messageKey={flow.messageKey}
      onBack={flow.back}
      onSkip={flow.skip}
      primary={{
        label: isEmpty ? t('onboarding.personal.fillLater') : t('onboarding.continue'),
        onPress: () => void submit(),
      }}
      saving={flow.busy}
      step={4}
      title={t('onboarding.personal.title')}>
      <View className="gap-4">
        <Controller
          control={control}
          name="displayName"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              autoCapitalize="words"
              autoComplete="nickname"
              error={errors.displayName?.message}
              label={t('onboarding.personal.displayName')}
              maxLength={120}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('onboarding.personal.displayNamePlaceholder')}
              returnKeyType="next"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="birthDate"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              autoComplete="birthdate-full"
              error={errors.birthDate?.message}
              inputMode="numeric"
              keyboardType="number-pad"
              label={t('onboarding.personal.birthDate')}
              maxLength={10}
              onBlur={onBlur}
              onChangeText={(text) => onChange(maskBirthDate(text))}
              placeholder={t('onboarding.personal.birthDatePlaceholder')}
              value={value}
            />
          )}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="heightCm"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextField
                  error={errors.heightCm?.message}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  label={t('onboarding.personal.height')}
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="170"
                  value={value}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="currentWeightKg"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextField
                  error={errors.currentWeightKg?.message}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  label={t('onboarding.personal.weight')}
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="68,5"
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="fitnessLevel"
          render={({ field: { onChange, value } }) => (
            <View className="gap-1.5">
              <Text className="text-xs font-medium text-auth-muted" maxFontSizeMultiplier={1.05}>
                {t('onboarding.personal.fitnessLevel')}
              </Text>
              <View accessibilityRole="radiogroup" className="flex-row gap-2">
                {fitnessLevels.map((level) => {
                  const selected = value === level;
                  return (
                    <Pressable
                      key={level}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      className={[
                        'h-11 flex-1 items-center justify-center rounded-[16px] border px-1 active:opacity-80',
                        selected ? 'border-auth-primary bg-auth-primary/10' : 'border-auth-border bg-auth-surface',
                      ].join(' ')}
                      // Tocar de novo desmarca: o campo é opcional.
                      onPress={() => onChange(selected ? null : level)}>
                      <Text
                        className={[
                          'text-[13px]',
                          selected ? 'font-bold text-auth-text' : 'text-auth-muted',
                        ].join(' ')}
                        maxFontSizeMultiplier={1.05}
                        numberOfLines={1}>
                        {t(`onboarding.personal.levels.${level}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />

        <View className="flex-row gap-2.5 rounded-2xl bg-auth-surface p-3.5">
          <Info color={authColors.muted} size={16} />
          <Text className="flex-1 text-xs leading-[18px] text-auth-muted" maxFontSizeMultiplier={1.05}>
            {t('onboarding.personal.privacy')}
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
