import X from 'lucide-react-native/icons/x';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/shared/components/primary-button';
import { TextField } from '@/shared/components/text-field';
import { authColors } from '@/theme';

export type EditProfileValues = {
  bio: string;
  displayName: string;
  username: string;
};

type EditProfileModalProps = {
  initialValues: EditProfileValues;
  onClose: () => void;
  onSave: (values: EditProfileValues) => Promise<boolean>;
  saving: boolean;
  visible: boolean;
};

export function EditProfileModal({
  initialValues,
  onClose,
  onSave,
  saving,
  visible,
}: EditProfileModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState(initialValues);
  const [nameError, setNameError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setValues(initialValues);
      setNameError(undefined);
    }
  }, [initialValues, visible]);

  const submit = async () => {
    const displayName = values.displayName.trim();
    if (displayName.length < 2 || displayName.length > 120) {
      setNameError(t('profile.edit.nameError'));
      return;
    }
    const saved = await onSave({
      bio: values.bio.trim(),
      displayName,
      username: values.username.replace(/^@+/, '').trim(),
    });
    if (saved) onClose();
  };

  return (
    <Modal
      animationType="slide"
      navigationBarTranslucent
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <Pressable className="flex-1 justify-end bg-black/75" onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            accessibilityRole="none"
            className="max-h-[86%] rounded-t-[28px] border-t border-auth-border bg-auth-surface px-5 pt-3"
            onPress={(event) => event.stopPropagation()}>
            <SafeAreaView edges={['bottom']}>
              <View className="mb-3 items-center">
                <View className="h-1.5 w-14 rounded-full bg-auth-border" />
              </View>
              <View className="mb-5 flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-[20px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
                    {t('profile.edit.title')}
                  </Text>
                  <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.05}>
                    {t('profile.edit.description')}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={t('common.close')}
                  accessibilityRole="button"
                  className="h-10 w-10 items-center justify-center rounded-full active:bg-auth-pressed"
                  hitSlop={8}
                  onPress={onClose}>
                  <X color={authColors.muted} size={20} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerClassName="gap-4 pb-3"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <TextField
                  autoCapitalize="words"
                  error={nameError}
                  label={t('profile.edit.fullName')}
                  maxLength={120}
                  onChangeText={(displayName) => {
                    setNameError(undefined);
                    setValues((current) => ({ ...current, displayName }));
                  }}
                  value={values.displayName}
                />
                <TextField
                  autoCapitalize="none"
                  label={t('profile.edit.username')}
                  maxLength={30}
                  onChangeText={(username) =>
                    setValues((current) => ({ ...current, username: username.replace(/^@+/, '') }))
                  }
                  value={`@${values.username}`}
                />
                <TextField
                  label={t('profile.edit.bio')}
                  maxLength={160}
                  onChangeText={(bio) => setValues((current) => ({ ...current, bio }))}
                  value={values.bio}
                />
                <Text className="text-[10px] leading-4 text-auth-placeholder" maxFontSizeMultiplier={1.05}>
                  {t('profile.edit.localFieldsNote')}
                </Text>
                <PrimaryButton
                  label={t('profile.edit.save')}
                  loading={saving}
                  onPress={() => void submit()}
                />
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
