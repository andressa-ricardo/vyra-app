import Check from 'lucide-react-native/icons/check';
import X from 'lucide-react-native/icons/x';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupportedLanguage } from '@/i18n/config';
import { authColors } from '@/theme';

type LanguageSelectionModalProps = {
  onClose: () => void;
  onSelect: (language: SupportedLanguage) => void;
  selectedLanguage: SupportedLanguage;
  visible: boolean;
};

export function LanguageSelectionModal({
  onClose,
  onSelect,
  selectedLanguage,
  visible,
}: LanguageSelectionModalProps) {
  const { t } = useTranslation();
  const options: { language: SupportedLanguage; label: string }[] = [
    { language: 'pt-BR', label: t('settings.values.portugueseBrazil') },
    { language: 'en', label: t('settings.values.english') },
  ];

  return (
    <Modal
      animationType="fade"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <Pressable
        accessibilityLabel={t('common.close')}
        accessibilityRole="button"
        className="flex-1 justify-end bg-black/70"
        onPress={onClose}>
        <Pressable
          accessibilityRole="none"
          className="rounded-t-[28px] border-t border-auth-border bg-auth-bg px-5 pb-2 pt-4"
          onPress={(event) => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-1 gap-1 pr-4">
                <Text className="text-[20px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.1}>
                  {t('settings.languageModal.title')}
                </Text>
                <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.1}>
                  {t('settings.languageModal.description')}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-auth-surface active:bg-auth-pressed"
                hitSlop={8}
                onPress={onClose}>
                <X color={authColors.muted} size={20} />
              </Pressable>
            </View>

            <View className="overflow-hidden rounded-[22px] bg-auth-surface">
              {options.map((option, index) => {
                const selected = option.language === selectedLanguage;

                return (
                  <Pressable
                    key={option.language}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    className={[
                      'min-h-[58px] flex-row items-center gap-3 px-4 active:bg-auth-pressed',
                      index < options.length - 1 ? 'border-b border-auth-border' : '',
                    ].join(' ')}
                    onPress={() => onSelect(option.language)}>
                    <Text
                      className={[
                        'flex-1 text-[15px] text-auth-text',
                        selected ? 'font-bold' : 'font-medium',
                      ].join(' ')}
                      maxFontSizeMultiplier={1.1}>
                      {option.label}
                    </Text>
                    <View
                      className={[
                        'h-6 w-6 items-center justify-center rounded-full border',
                        selected ? 'border-auth-primary bg-auth-primary' : 'border-auth-border',
                      ].join(' ')}>
                      {selected ? <Check color={authColors.text} size={15} strokeWidth={3} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
