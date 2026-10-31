import Search from 'lucide-react-native/icons/search';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { OnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import type { SportModality } from '@/features/onboarding/types/onboarding.types';
import { authColors } from '@/theme';

import { getModalityIcon } from './onboarding-icons';
import { OnboardingLayout } from './onboarding-layout';

const COLUMNS = 3;

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function ModalitiesStep({
  flow,
  modalities,
}: {
  flow: OnboardingFlow;
  modalities: SportModality[];
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  // O nome vem do catálogo do backend; o i18n traduz os slugs conhecidos.
  const labelOf = (modality: SportModality) =>
    t(`onboarding.modalities.items.${modality.slug}`, { defaultValue: modality.name });
  const visible = modalities.filter((modality) =>
    normalize(labelOf(modality)).includes(normalize(query.trim())),
  );
  const rows = Array.from({ length: Math.ceil(visible.length / COLUMNS) }, (_, index) =>
    visible.slice(index * COLUMNS, index * COLUMNS + COLUMNS),
  );

  const toggle = (id: string) =>
    flow.setModalityIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <OnboardingLayout
      description={t('onboarding.modalities.description')}
      messageKey={flow.messageKey}
      onBack={flow.back}
      onSkip={flow.skip}
      primary={{
        label: t('onboarding.continue'),
        onPress: () => void flow.saveModalities(),
        disabled: flow.modalityIds.length === 0,
      }}
      saving={flow.busy}
      step={2}
      title={t('onboarding.modalities.title')}>
      <View className="gap-2">
        <View className="h-12 flex-row items-center gap-2.5 rounded-[18px] border border-auth-border bg-auth-surface px-4">
          <Search color={authColors.placeholder} size={18} />
          <TextInput
            accessibilityLabel={t('onboarding.modalities.search')}
            autoCorrect={false}
            className="h-full flex-1 p-0 text-[14px] text-auth-text"
            maxFontSizeMultiplier={1.05}
            onChangeText={setQuery}
            placeholder={t('onboarding.modalities.search')}
            placeholderTextColor={authColors.placeholder}
            returnKeyType="search"
            selectionColor={authColors.primary}
            value={query}
          />
        </View>
        <Text className="text-xs font-semibold text-auth-primary" maxFontSizeMultiplier={1.05}>
          {t('onboarding.modalities.selected', { count: flow.modalityIds.length })}
        </Text>
      </View>

      {rows.length === 0 ? (
        <Text className="py-6 text-center text-sm text-auth-muted" maxFontSizeMultiplier={1.05}>
          {t('onboarding.modalities.empty')}
        </Text>
      ) : (
        <View className="gap-2.5">
          {rows.map((row) => (
            <View key={row[0].id} className="flex-row gap-2.5">
              {row.map((modality) => {
                const selected = flow.modalityIds.includes(modality.id);
                const Icon = getModalityIcon(modality.slug);

                return (
                  <Pressable
                    key={modality.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    className={[
                      'h-[84px] flex-1 items-center justify-center gap-2 rounded-2xl border px-1.5 active:opacity-80',
                      selected ? 'border-auth-primary bg-auth-primary/10' : 'border-auth-border bg-auth-surface',
                    ].join(' ')}
                    onPress={() => toggle(modality.id)}>
                    <Icon
                      color={selected ? authColors.primary : authColors.muted}
                      size={22}
                      strokeWidth={1.75}
                    />
                    <Text
                      className={[
                        'text-center text-xs leading-4',
                        selected ? 'font-bold text-auth-text' : 'text-auth-muted',
                      ].join(' ')}
                      maxFontSizeMultiplier={1.05}
                      numberOfLines={2}>
                      {labelOf(modality)}
                    </Text>
                    {selected ? (
                      <View className="absolute right-1.5 top-1.5 h-4 w-4 items-center justify-center rounded-full bg-auth-primary">
                        <View className="mb-px h-[4px] w-[7px] rotate-[-45deg] border-b-[1.5px] border-l-[1.5px] border-auth-text" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
              {/* Preenche a última linha para os cards manterem a mesma largura. */}
              {Array.from({ length: COLUMNS - row.length }, (_, index) => (
                <View key={`spacer-${index}`} className="flex-1" />
              ))}
            </View>
          ))}
        </View>
      )}
    </OnboardingLayout>
  );
}
