import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSelectionModal } from '@/features/account/presentation/components/language-selection-modal';
import { changeLanguage } from '@/i18n';
import type { SupportedLanguage } from '@/i18n/config';
import { BackButton } from '@/shared/components/back-button';
import { Toggle } from '@/shared/components/toggle';
import { authColors } from '@/theme';

type NavigationRowProps = {
  isLast?: boolean;
  label: string;
  onPress: () => void;
  value?: string;
};

type ToggleRowProps = {
  isLast?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

function SettingsSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View className="gap-3">
      <Text className="px-0.5 text-[15px] font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
        {title}
      </Text>
      <View className="overflow-hidden rounded-[22px] bg-auth-surface">{children}</View>
    </View>
  );
}

function NavigationRow({ isLast = false, label, onPress, value }: NavigationRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={[
        'min-h-[53px] flex-row items-center gap-3 px-4 py-3 active:bg-auth-pressed',
        isLast ? '' : 'border-b border-auth-border',
      ].join(' ')}
      onPress={onPress}>
      <Text className="flex-1 text-[15px] font-medium text-auth-text" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
      {value ? (
        <Text className="text-[14px] text-auth-muted" maxFontSizeMultiplier={1.05}>
          {value}
        </Text>
      ) : null}
      <ChevronRight color={authColors.muted} size={18} strokeWidth={1.75} />
    </Pressable>
  );
}

function ToggleRow({ isLast = false, label, onValueChange, value }: ToggleRowProps) {
  return (
    <View
      className={[
        'min-h-[53px] flex-row items-center gap-3 px-4 py-2',
        isLast ? '' : 'border-b border-auth-border',
      ].join(' ')}>
      <Text className="flex-1 text-[15px] font-medium text-auth-text" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
      <Toggle
        accessibilityLabel={label}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}

export function SettingsScreen() {
  const { i18n, t } = useTranslation();
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [newsAndOffers, setNewsAndOffers] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const showComingSoon = () => Alert.alert(t('common.comingSoon'), t('common.comingSoonDescription'));

  const selectedLanguage: SupportedLanguage = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'pt-BR';

  const selectLanguage = (language: SupportedLanguage) => {
    void changeLanguage(language);
    setLanguageModalVisible(false);
  };

  const confirmDeleteAccount = () =>
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteUnavailable'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.understood'), style: 'destructive' },
    ]);

  const languageLabel = selectedLanguage === 'en'
    ? t('settings.values.english')
    : t('settings.values.portugueseBrazil');

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <View className="w-full max-w-[520px] self-center px-4 pt-1">
        <View className="h-12 flex-row items-center gap-2">
          <BackButton onPress={() => router.back()} />
          <Text className="text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {t('settings.title')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="w-full max-w-[520px] gap-7 self-center px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}>
        <SettingsSection title={t('settings.sections.account')}>
          <NavigationRow label={t('settings.editProfile')} onPress={showComingSoon} />
          <NavigationRow isLast label={t('settings.changePassword')} onPress={showComingSoon} />
        </SettingsSection>

        <SettingsSection title={t('settings.sections.notifications')}>
          <ToggleRow
            label={t('settings.workoutReminders')}
            onValueChange={setWorkoutReminders}
            value={workoutReminders}
          />
          <ToggleRow
            label={t('settings.waterReminders')}
            onValueChange={setWaterReminders}
            value={waterReminders}
          />
          <ToggleRow
            isLast
            label={t('settings.newsAndOffers')}
            onValueChange={setNewsAndOffers}
            value={newsAndOffers}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.sections.preferences')}>
          <NavigationRow
            label={t('settings.units')}
            onPress={showComingSoon}
            value={t('settings.values.metric')}
          />
          <NavigationRow
            label={t('settings.language')}
            onPress={() => setLanguageModalVisible(true)}
            value={languageLabel}
          />
          <NavigationRow
            label={t('settings.theme')}
            onPress={showComingSoon}
            value={t('settings.values.dark')}
          />
          <ToggleRow
            isLast
            label={t('settings.privateProfile')}
            onValueChange={setPrivateProfile}
            value={privateProfile}
          />
        </SettingsSection>

        <Pressable
          accessibilityRole="button"
          className="min-h-[53px] justify-center rounded-[22px] bg-auth-surface px-4 active:bg-auth-pressed"
          onPress={confirmDeleteAccount}>
          <Text className="text-[15px] font-medium text-auth-danger" maxFontSizeMultiplier={1.05}>
            {t('settings.deleteAccount')}
          </Text>
        </Pressable>
      </ScrollView>

      <LanguageSelectionModal
        onClose={() => setLanguageModalVisible(false)}
        onSelect={selectLanguage}
        selectedLanguage={selectedLanguage}
        visible={languageModalVisible}
      />
    </SafeAreaView>
  );
}
