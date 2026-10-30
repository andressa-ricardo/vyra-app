# Status mobile

Atualizado em 30 de outubro de 2026.

## Base técnica

- Expo SDK 58 (`expo ~58.0.21`)
- React Native 0.88.1
- React 19.3.0
- TypeScript em modo estrito
- Expo Router com typed routes
- New Architecture/Hermes pelos padrões do Expo SDK 58
- Package manager atual: npm (`package-lock.json`)
- Fluxo nativo: Continuous Native Generation; não há `ios/` ou `android/` versionados

## Concluído na TASK 01

- Estrutura Feature-First inicial criada.
- Rotas isoladas da apresentação do template.
- Provider raiz preparado em `src/core`.
- Componentes e hooks transversais movidos para `src/shared`.
- Tokens VYRA e temas light/dark criados em `src/theme`.
- Primary light `#2563EB` e primary dark `#60A5FA` aplicados ao tema de navegação e disponíveis para componentes.
- Alias `@/*` configurado para `src/*`, com alias de assets preservado.
- Interface e navegação existentes do template preservadas em `features/starter`.
- ESLint configurado com o preset oficial do Expo.
- Documentação arquitetural e convenções permanentes adicionadas.

## Ainda não implementado

- Autenticação e autorização.
- Onboarding.
- Perfis e papéis de usuário.
- API, serialização, tratamento de erros e configuração de ambientes.
- Persistência local ou armazenamento seguro.
- Estado global ou cache de servidor.
- Design system completo e telas de produto.
- Activities, sport-modalities, exercises, workouts, workout-sessions, running, nutrition e progress.
- Professionals, organizations e appointments.
- Testes automatizados, telemetria, analytics e CI/CD.

## Compatibilidade

Nenhuma versão do Expo, React ou React Native foi alterada. Foram adicionados apenas `eslint` e `eslint-config-expo` como dependências de desenvolvimento para executar a validação exigida; não houve nova dependência de runtime. A validação local desta revisão está registrada na entrega da TASK 01.
