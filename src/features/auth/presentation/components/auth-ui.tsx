import { useState, type ReactNode } from 'react';
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

import { authColors, fonts, spacing } from '@/theme';

export function BrandLogo() {
  return (
    <View accessibilityLabel="VYRA" style={styles.logo}>
      <View style={styles.logoMark}>
        <View style={[styles.logoLine, styles.logoLineLeft]} />
        <View style={[styles.logoLine, styles.logoLineRight]} />
      </View>
      <Text style={styles.logoText}>VYRA</Text>
    </View>
  );
}

export function AuthBackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={t('common.back')}
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
      <View style={styles.backChevron} />
    </Pressable>
  );
}

type AuthTextFieldProps = TextInputProps & {
  error?: string;
  label: string;
  password?: boolean;
};

export function AuthTextField({ error, label, password = false, ...props }: AuthTextFieldProps) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputShellError]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={authColors.placeholder}
          secureTextEntry={password && !passwordVisible}
          style={styles.input}
        />
        {password ? (
          <Pressable
            accessibilityLabel={
              passwordVisible ? t('common.hidePassword') : t('common.showPassword')
            }
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => setPasswordVisible((current) => !current)}>
            <EyeIcon crossed={passwordVisible} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  loading = false,
  onPress,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, (pressed || loading) && styles.pressed]}>
      {loading ? (
        <ActivityIndicator color={authColors.text} />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

export function SocialButtons({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.socialRow}>
      <SocialButton icon={<Text style={styles.googleIcon}>G</Text>} label="Google" onPress={onPress} />
      <SocialButton icon={<AppleIcon />} label="Apple" onPress={onPress} />
    </View>
  );
}

function SocialButton({ icon, label, onPress }: { icon: ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}>
      {icon}
      <Text style={styles.socialButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Checkbox({ checked, label, onPress }: { checked: boolean; label: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.checkboxRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <View style={styles.checkmark} /> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <View style={styles.eye}>
      <View style={styles.eyePupil} />
      {crossed ? <View style={styles.eyeSlash} /> : null}
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.appleIcon}>
      <View style={styles.appleLeaf} />
      <View style={styles.appleBody} />
      <View style={styles.appleBite} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { width: 28, height: 28 },
  logoLine: { position: 'absolute', top: 1, width: 3, height: 25, backgroundColor: authColors.primary, borderRadius: 2 },
  logoLineLeft: { left: 7, transform: [{ rotate: '-31deg' }] },
  logoLineRight: { right: 7, transform: [{ rotate: '31deg' }] },
  logoText: { color: authColors.text, fontFamily: fonts.sans, fontSize: 24, fontWeight: '800', letterSpacing: 5 },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  backChevron: { width: 11, height: 11, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: authColors.text, transform: [{ rotate: '45deg' }], marginLeft: 5 },
  pressed: { opacity: 0.72 },
  field: { gap: 8 },
  fieldLabel: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 14, fontWeight: '500' },
  inputShell: { minHeight: 54, borderWidth: 1, borderColor: authColors.border, borderRadius: 24, backgroundColor: authColors.surface, paddingHorizontal: spacing.three, flexDirection: 'row', alignItems: 'center' },
  inputShellError: { borderColor: authColors.danger },
  input: { flex: 1, color: authColors.text, fontFamily: fonts.sans, fontSize: 16, paddingVertical: 0 },
  fieldError: { color: authColors.danger, fontFamily: fonts.sans, fontSize: 12, lineHeight: 17 },
  eye: { width: 18, height: 12, borderWidth: 2, borderColor: authColors.placeholder, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eyePupil: { width: 4, height: 4, borderRadius: 2, backgroundColor: authColors.placeholder },
  eyeSlash: { position: 'absolute', width: 22, height: 1.5, backgroundColor: authColors.placeholder, transform: [{ rotate: '-40deg' }] },
  primaryButton: { minHeight: 54, borderRadius: 24, backgroundColor: authColors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: authColors.text, fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dividerLine: { height: 1, backgroundColor: authColors.border, flex: 1 },
  dividerText: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: { flex: 1, minHeight: 54, borderWidth: 1, borderColor: authColors.border, borderRadius: 22, backgroundColor: authColors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  socialButtonPressed: { backgroundColor: authColors.surfacePressed },
  socialButtonText: { color: authColors.text, fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  googleIcon: { color: authColors.text, fontFamily: fonts.sans, fontSize: 20, fontWeight: '900' },
  appleIcon: { width: 19, height: 22 },
  appleLeaf: { position: 'absolute', top: 0, right: 3, width: 5, height: 8, borderRadius: 5, backgroundColor: authColors.text, transform: [{ rotate: '40deg' }] },
  appleBody: { position: 'absolute', bottom: 0, left: 1, width: 17, height: 16, borderRadius: 8, backgroundColor: authColors.text },
  appleBite: { position: 'absolute', top: 7, right: -1, width: 6, height: 6, borderRadius: 3, backgroundColor: authColors.surface },
  checkboxRow: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { width: 19, height: 19, borderWidth: 1, borderColor: authColors.border, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: authColors.primary, borderColor: authColors.primary },
  checkmark: { width: 8, height: 4, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: authColors.text, transform: [{ rotate: '-45deg' }, { translateY: -1 }] },
  checkboxLabel: { flex: 1, color: authColors.muted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
});
