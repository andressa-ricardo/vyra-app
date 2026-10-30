# VYRA Mobile — convenções permanentes

Este é um aplicativo Expo/React Native. Priorize padrões mobile-first, performance, acessibilidade e compatibilidade entre Android, iOS e web.

## Expo muda a cada SDK

Antes de escrever código que toque uma API Expo, EAS ou React Native:

1. Leia a major do pacote `expo` em `package.json`.
2. Consulte a documentação versionada correspondente em `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Consulte `https://docs.expo.dev/llms.txt` e siga o link específico da API necessária.

Não responda nem implemente APIs Expo de memória.

## Comandos

Use `bunx` no lugar de `npx` somente quando existir `bun.lock`.

```bash
npx expo install <package>  # instalação compatível com o SDK
npx expo start
npm run lint
npx tsc --noEmit
npx expo-doctor
npx expo install --fix
```

Use `npx expo lint` para a configuração inicial oficial; depois, use `npm run lint`. Rode TypeScript e ESLint antes de concluir qualquer alteração de código. Rode Expo Doctor em mudanças de arquitetura, dependências ou configuração Expo.

## Arquitetura

- `src/app`: somente rotas, layouts e composição de navegação do Expo Router.
- `src/features`: código organizado por domínio. Crie somente features e camadas necessárias para a task atual.
- `src/shared`: componentes, hooks, tipos e utilitários realmente usados por múltiplas features.
- `src/core`: infraestrutura transversal, configuração e providers.
- `src/theme`: tokens semânticos, cores, espaçamento e tipografia.
- `assets`: recursos estáticos.

Arquivos de rota devem ser finos. Não coloque neles regra de negócio, acesso à API, persistência ou estado de domínio. Código não relacionado a rotas fica fora de `src/app`.

Use imports internos com `@/`. Prefira kebab-case em arquivos, PascalCase em componentes e tipos, e o prefixo `use` em hooks. Mantenha tipos próximos ao domínio proprietário.

Uma feature não deve importar internals de outra feature. Compartilhe apenas contratos explícitos ou código transversal comprovado. Estado local é preferível enquanto não houver necessidade de compartilhamento. Não crie repositórios, factories, interfaces, stores ou barrels especulativos.

## Navegação

Use Expo Router. Rotas vivem em `src/app`; `_layout.tsx` define navegadores. Importe `Link`, `router` e `useLocalSearchParams` de `expo-router`.

Documentação: https://docs.expo.dev/router/introduction.md

## Tema e UI

- Consuma tokens de `@/theme`; não espalhe cores de marca por componentes.
- Preserve suporte a light/dark seguindo o modo do sistema.
- Componentes compartilhados devem ser independentes de domínio e ter uso real.
- Considere safe areas, tamanhos de toque, leitores de tela, teclado e estados de loading/erro/vazio.
- Evite trabalho pesado na thread JS e renders desnecessários; meça antes de adicionar otimizações complexas.

## API, autenticação e armazenamento

Componentes e rotas não chamam a API diretamente. Integrações entram em infraestrutura e são expostas à apresentação por contratos/casos de uso proporcionais à complexidade. Tokens e segredos nunca usam armazenamento não seguro. Não implemente essas camadas antes de existir escopo e contrato concretos.

## Expo Go e código nativo

- Não altere versões do Expo ou React Native sem task explícita de upgrade.
- Instale pacotes com `npx expo install`, nunca diretamente com npm/yarn/pnpm/bun.
- Avalie se uma biblioteca funciona no Expo Go antes de adotá-la.
- Após adicionar código nativo não incluído no Expo Go, use development build.
- Se `ios/` e `android/` não existirem, use CNG. Nunca os crie ou edite manualmente; configure comportamento nativo em `app.json` e config plugins.

## EAS

Use EAS para build, assinatura, submissão e updates. Em projetos npm, execute `npx eas-cli@latest <command>`; em projetos Bun, `bunx eas-cli <command>`.

Documentação: https://docs.expo.dev/eas/index.md

## Qualidade e escopo

- Preserve mudanças locais do usuário e funcionalidades existentes.
- Não instale dependências quando a plataforma já resolver o problema.
- Não faça commit ou push sem solicitação explícita.
- Atualize `docs/ARCHITECTURE.md`, `docs/MOBILE_STATUS.md` ou `docs/ROADMAP.md` quando uma decisão permanente ou marco mudar.
