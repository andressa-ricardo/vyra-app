module.exports = ({ config }) => {
  let result = config;

  // O config plugin do Google Sign-In exige o iOS URL scheme do client OAuth iOS e
  // falha sem ele. Só o adicionamos quando a variável estiver definida no ambiente do build.
  const iosUrlScheme = process.env.GOOGLE_IOS_URL_SCHEME?.trim();
  if (iosUrlScheme) {
    result = {
      ...result,
      plugins: [...result.plugins, ['@react-native-google-signin/google-signin', { iosUrlScheme }]],
    };
  }

  // react-native-maps usa Google Maps no Android: sem a chave, o mapa fica em branco em
  // Development/Production Builds (no Expo Go a chave do próprio Expo Go é usada).
  const googleMapsAndroidApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim();
  if (googleMapsAndroidApiKey) {
    result = {
      ...result,
      android: {
        ...result.android,
        config: {
          ...result.android?.config,
          googleMaps: { apiKey: googleMapsAndroidApiKey },
        },
      },
    };
  }

  return result;
};
