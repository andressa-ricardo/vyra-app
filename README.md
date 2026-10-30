# VYRA Mobile

Aplicativo mobile da plataforma multiesportes VYRA, construído com Expo SDK 58, React Native 0.88, TypeScript e Expo Router.

## Requisitos

- Node.js compatível com Expo SDK 58
- npm
- Expo Go no dispositivo Android para desenvolvimento local

## Configuração

```powershell
npm install
Copy-Item .env.example .env
```

Edite o `.env` com o IPv4 do computador que executa o backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.25:3000
```

Não use `localhost` ao testar em um celular físico.

## Desenvolvimento

```powershell
npx expo start
```

## Qualidade

```powershell
npx tsc --noEmit
npm run lint
npm test -- --watch=false
npx expo-doctor
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Integração com backend](docs/BACKEND_INTEGRATION.md)
- [Status mobile](docs/MOBILE_STATUS.md)
- [Roadmap](docs/ROADMAP.md)
