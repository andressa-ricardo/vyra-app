import { router, type Href } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Search from 'lucide-react-native/icons/search';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchSportModalities } from '@/features/sports/infrastructure/sports-api';
import type { SportModality } from '@/features/sports/types/sports.types';
import { BackButton } from '@/shared/components/back-button';
import { getModalityIcon } from '@/shared/utils/modality-icons';
import { authColors } from '@/theme';

/** Modalidades que já têm uma tela própria no app. */
const modalityRoutes: Record<string, Href> = {
  running: '/sports/running',
  'strength-training': '/workouts',
};

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; modalities: SportModality[] };

export function ModalitiesScreen() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(
    () =>
      fetchSportModalities().then(
        (modalities) => setState({ status: 'ready', modalities }),
        () => setState({ status: 'error' }),
      ),
    [],
  );

  useEffect(() => {
    let active = true;
    fetchSportModalities().then(
      (modalities) => active && setState({ status: 'ready', modalities }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // O nome vem do catálogo do backend; o i18n traduz os slugs conhecidos.
  const labelOf = useCallback(
    (modality: SportModality) => t(`modalities.items.${modality.slug}`, { defaultValue: modality.name }),
    [t],
  );

  const sections = useMemo(() => {
    if (state.status !== 'ready') return [];
    const term = normalize(query.trim());
    const groups = new Map<string, SportModality[]>();
    for (const modality of state.modalities) {
      if (!normalize(labelOf(modality)).includes(term)) continue;
      groups.set(modality.category, [...(groups.get(modality.category) ?? []), modality]);
    }
    return [...groups.entries()];
  }, [labelOf, query, state]);

  const open = (modality: SportModality) => {
    const route = modalityRoutes[modality.slug];
    if (route) return router.push(route);
    Alert.alert(labelOf(modality), t('sports.unavailable'));
  };

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={authColors.primary} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-2">
          <BackButton onPress={() => router.back()} />
          <View className="flex-1">
            <Text className="text-[22px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
              {t('sports.more.title')}
            </Text>
            <Text className="text-[13px] text-auth-muted">{t('sports.more.subtitle')}</Text>
          </View>
        </View>

        <View className="mt-5 h-11 flex-row items-center gap-2.5 rounded-[16px] border border-auth-border bg-auth-surface px-3.5">
          <Search color={authColors.placeholder} size={17} />
          <TextInput
            accessibilityLabel={t('sports.more.search')}
            autoCorrect={false}
            className="h-full flex-1 p-0 text-[14px] text-auth-text"
            maxFontSizeMultiplier={1.05}
            onChangeText={setQuery}
            placeholder={t('sports.more.search')}
            placeholderTextColor={authColors.placeholder}
            returnKeyType="search"
            selectionColor={authColors.primary}
            value={query}
          />
        </View>

        {state.status === 'loading' ? (
          <ActivityIndicator className="mt-10" color={authColors.primary} />
        ) : null}

        {state.status === 'error' ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-[18px] border border-auth-danger bg-auth-surface p-4 active:bg-auth-pressed"
            onPress={() => {
              setState({ status: 'loading' });
              void load();
            }}>
            <Text className="text-[13px] text-auth-text">{t('sports.more.loadError')}</Text>
          </Pressable>
        ) : null}

        {state.status === 'ready' && sections.length === 0 ? (
          <Text className="mt-10 text-center text-[13px] text-auth-muted">{t('sports.more.empty')}</Text>
        ) : null}

        {sections.map(([category, modalities]) => (
          <View key={category}>
            <Text className="mb-3 mt-6 text-[16px] font-bold text-auth-text">
              {t(`modalities.categories.${category}`, { defaultValue: category })}
            </Text>
            <View className="gap-2.5">
              {modalities.map((modality) => {
                const Icon = getModalityIcon(modality.slug);
                const available = modality.slug in modalityRoutes;

                return (
                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[60px] flex-row items-center rounded-[18px] border border-auth-border bg-auth-surface px-3.5 py-2.5 active:bg-auth-pressed"
                    key={modality.id}
                    onPress={() => open(modality)}>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#183A70]">
                      <Icon color={authColors.primary} size={17} strokeWidth={1.8} />
                    </View>
                    <Text
                      className="ml-3 flex-1 text-[14px] font-bold text-auth-text"
                      maxFontSizeMultiplier={1.1}
                      numberOfLines={1}>
                      {labelOf(modality)}
                    </Text>
                    <View
                      className={`mr-2 rounded-full px-2 py-0.5 ${available ? 'bg-[#183A70]' : 'bg-auth-pressed'}`}>
                      <Text
                        className={`text-[11px] font-semibold ${available ? 'text-auth-primary' : 'text-auth-muted'}`}>
                        {available ? t('sports.more.available') : t('sports.more.soon')}
                      </Text>
                    </View>
                    <ChevronRight color={authColors.muted} size={17} strokeWidth={1.8} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
