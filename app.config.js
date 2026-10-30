// O config plugin do Google Sign-In exige o iOS URL scheme do client OAuth iOS e
// falha sem ele. Só o adicionamos quando a variável estiver definida no ambiente do build.
module.exports = ({ config }) => {
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME?.trim();
  if (!iosUrlScheme) return config;

  return {
    ...config,
    plugins: [...config.plugins, ['@react-native-google-signin/google-signin', { iosUrlScheme }]],
  };
};
