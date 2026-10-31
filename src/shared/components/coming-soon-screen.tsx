import Hourglass from 'lucide-react-native/icons/hourglass';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors } from '@/theme';

/** Estado vazio para seções que ainda não foram implementadas. */
export function ComingSoonScreen({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center gap-3 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-auth-surface">
          <Hourglass color={authColors.muted} size={26} strokeWidth={1.75} />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center text-[20px] font-extrabold text-auth-text"
          maxFontSizeMultiplier={1.05}>
          {t(titleKey)}
        </Text>
        <Text className="text-center text-sm leading-5 text-auth-muted" maxFontSizeMultiplier={1.05}>
          {t('common.comingSoonDescription')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
