const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

export const env = {
  apiUrl: apiUrl || null,
  googleWebClientId: googleWebClientId || null,
  googleIosClientId: googleIosClientId || null,
} as const;
