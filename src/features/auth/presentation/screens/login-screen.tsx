import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFederatedSignIn } from "@/features/auth/hooks/use-federated-sign-in";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  AuthDivider,
  Checkbox,
  SocialButtons,
} from "@/features/auth/presentation/components/auth-ui";
import {
  createLoginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { BackButton } from "@/shared/components/back-button";
import { FormMessage } from "@/shared/components/form-message";
import { PrimaryButton } from "@/shared/components/primary-button";
import { TextField } from "@/shared/components/text-field";

export function LoginScreen() {
  const { t } = useTranslation();
  const login = useLogin();
  const federated = useFederatedSignIn();
  const messageKey = federated.messageKey ?? login.messageKey;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema((key) => t(key))),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const submitForm = handleSubmit(({ email, password, rememberMe }) => {
    federated.clearMessage();
    return login.submit({ email, password }, { rememberMe });
  });

  const showForgotPassword = () =>
    Alert.alert(
      t("common.comingSoon"),
      t("auth.login.forgotPasswordUnavailable"),
    );

  return (
    <SafeAreaView className="flex-1 bg-auth-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerClassName="w-full max-w-[520px] grow self-center gap-5 px-[22px] pb-6 pt-1"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton onPress={() => router.replace("/")} />

          <View className="gap-1.5">
            <Text
              className="text-2xl font-extrabold leading-[30px] tracking-[-0.4px] text-auth-text"
              maxFontSizeMultiplier={1.05}
            >
              {t("auth.login.title")}
            </Text>
            <Text
              className="text-sm leading-5 text-auth-muted"
              maxFontSizeMultiplier={1.05}
            >
              {t("auth.login.description")}
            </Text>
          </View>

          {messageKey ? <FormMessage message={t(messageKey)} /> : null}

          <View className="gap-4">
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
                  label={t("auth.register.email")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t("auth.register.emailPlaceholder")}
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
                  autoComplete="current-password"
                  error={errors.password?.message}
                  label={t("auth.register.password")}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  onSubmitEditing={() => void submitForm()}
                  password
                  placeholder="••••••••"
                  returnKeyType="done"
                  textContentType="password"
                  value={value}
                />
              )}
            />

            <View className="flex-row items-center justify-between gap-3">
              <Controller
                control={control}
                name="rememberMe"
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    label={t("auth.login.rememberMe")}
                    onPress={() => onChange(!value)}
                  />
                )}
              />
              <Pressable
                accessibilityRole="button"
                className="active:opacity-70"
                hitSlop={8}
                onPress={showForgotPassword}
              >
                <Text
                  className="text-xs text-auth-primary"
                  maxFontSizeMultiplier={1.05}
                >
                  {t("auth.login.forgotPassword")}
                </Text>
              </Pressable>
            </View>

            <View className="mt-1">
              <PrimaryButton
                label={t("auth.login.submit")}
                loading={login.status === "loading"}
                onPress={() => void submitForm()}
              />
            </View>
          </View>

          <AuthDivider label={t("auth.login.continueWith")} />
          <SocialButtons
            appleAvailable={federated.appleAvailable}
            onPress={(provider) => {
              login.clearMessage();
              void federated.start(provider);
            }}
            pending={federated.pending}
          />

          <View className="mt-auto flex-row items-center justify-center pt-2">
            <Text
              className="text-sm text-auth-muted"
              maxFontSizeMultiplier={1.05}
            >
              {t("auth.login.noAccount")}{" "}
            </Text>
            <Pressable
              accessibilityRole="link"
              className="active:opacity-70"
              hitSlop={8}
              onPress={() => router.replace("/register")}
            >
              <Text
                className="text-sm font-semibold text-auth-primary"
                maxFontSizeMultiplier={1.05}
              >
                {t("auth.welcome.createAccount")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
