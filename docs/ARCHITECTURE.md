# Arquitetura mobile do VYRA

## Running

`src/features/running` concentra contratos HTTP, fila local temporária, captura GPS e telas. A aba compõe o dashboard; `/run` registra a sessão e `/running-summary/[id]` apresenta o resultado persistido. Pontos possuem identificadores idempotentes e são enviados em lotes de até 200. O backend é a autoridade para distância, duração, pace, splits e recordes.

A corrida é *offline-first*: o estado local (`LocalRunningState` no AsyncStorage, chaveado pelo `clientRequestId`) é a fonte da verdade durante a corrida. Iniciar, pausar, retomar e finalizar alteram primeiro o estado local com o horário do aparelho; `running-sync.ts` envia depois, em ordem, criação idempotente, pontos, pausas/retomadas e finalização (com `at`/`endedAt`), descartando apenas falhas permanentes (400/403/404/409/422). Descartes feitos offline ficam numa lista pendente. O cronômetro é derivado de `startedAt` e das pausas, e não de um contador.

`watchPositionAsync` atualiza a interface em primeiro plano. A task global do Expo TaskManager é registrada no layout raiz para Development Builds com permissão de segundo plano. A fila usa AsyncStorage e é apagada ao finalizar/descartar; como esse armazenamento não tem criptografia própria, a estratégia cifrada e a política de retenção de GPS ainda são requisitos de produção.

## Objetivo

O VYRA adota Feature-First com Clean Architecture pragmática. Navegação, apresentação, regras de negócio e infraestrutura permanecem separadas sem criar camadas antes de existir uma necessidade concreta.

## Estrutura atual

```text
src/
├── app/                  # Rotas e layouts do Expo Router
├── core/
│   ├── api/              # Cliente HTTP, configuração e erros transversais
│   ├── config/           # Leitura tipada do ambiente público
│   ├── session/          # Tokens no SecureStore, SessionProvider e /users/me
│   └── providers/        # Composition root da aplicação
├── features/
│   ├── auth/             # Cadastro, login por senha, Google e Apple
│   ├── account/          # Tela "Mais": perfil, menu e logout
│   ├── home/             # Tela inicial autenticada
│   └── onboarding/       # Boas-vindas, 4 etapas e resumo após o primeiro acesso
├── i18n/                 # Inicialização, idiomas e catálogos
├── shared/
│   └── hooks/            # Hooks transversais em uso
└── theme/                # Cores semânticas, espaçamento e tipografia
```

### `src/app`

É exclusivamente a camada de navegação. Cada arquivo é uma rota do Expo Router e deve delegar apresentação para uma feature. A rota `/` exporta a landing, `/register` e `/login` abrem o cadastro e o login integrados, e o grupo `(tabs)` reúne as abas autenticadas (`/home`, `/workouts`, `/running`, `/nutrition`, `/more`). O layout raiz compõe providers e o `Stack`, usando `Stack.Protected` para liberar `/`, `/login` e `/register` somente sem sessão e o grupo `(tabs)` somente com sessão e onboarding resolvido. A troca de estado da sessão redireciona sozinha, sem `router.replace` após login ou logout.

### `src/features`

Cada domínio contém apenas as camadas exigidas por seus casos de uso. A feature `auth` possui:

- `presentation`: tela e formulário;
- `hooks`: estado assíncrono do cadastro;
- `schemas`: validação frontend com Zod;
- `infrastructure`: chamada ao endpoint de autenticação;
- `types`: contrato HTTP verificado no backend.

Os componentes visuais comuns ao fluxo de entrada ficam em `auth/presentation/components`, pois ainda são específicos de autenticação. A landing usa `assets/images/welcome-athlete.jpg`; cadastro e login reutilizam campos, botões, divisores, checkbox e botões sociais sem promover esses elementos prematuramente para `shared`.

A confirmação de senha pertence ao formulário e nunca é enviada à API.

### `src/core`

O cliente Axios é compartilhado e aplica timeout, URL base e headers. A URL é resolvida no interceptor de request, permitindo que o app abra mesmo quando o ambiente ainda não foi configurado e apresente uma mensagem adequada somente ao tentar enviar.

Erros técnicos são normalizados em códigos estáveis (`validation`, `conflict`, `network`, `timeout`, `server` etc.). A UI traduz esses códigos; mensagens e stack traces do backend não são exibidos diretamente.

### `src/i18n`

O i18next é inicializado uma vez com `react-i18next`. `expo-localization` escolhe inglês quando o idioma principal do dispositivo é inglês; os demais casos usam português brasileiro. O fallback é `pt-BR`. A troca manual acontece em memória e atualiza a UI sem reiniciar.

A preferência manual ainda não é persistida. Isso evita introduzir armazenamento antes da definição da estratégia de preferências do usuário.

### `src/shared`

Contém somente código transversal em uso. Os componentes visuais do template foram removidos; os hooks de tema permanecem compartilhados.

### `src/theme`

Centraliza tokens semânticos light/dark. Componentes consomem `primary`, `onPrimary`, `background`, `text`, `error` e `success`, sem cores de marca locais.

### Estilização

As telas usam NativeWind 4 (Tailwind 3) via `className`. A configuração fica em `tailwind.config.js`, `global.css` (importado em `src/app/_layout.tsx`), `babel.config.js` e `metro.config.js`. As cores de autenticação são tokens `auth-*` no Tailwind e espelham `authColors` em `src/theme`; altere os dois juntos. Textos usam `maxFontSizeMultiplier` para evitar que a escala de fonte do Android quebre o layout.

Formulários usam `KeyboardAvoidingView` com `behavior="padding"` em todas as plataformas, porque o Android é edge-to-edge e não redimensiona a janela ao abrir o teclado.

## Fluxo do cadastro

```text
src/app/register
  → RegisterScreen
    → RegisterForm + Zod
      → useRegister
        → auth-api
          → httpClient
            → POST /api/v1/auth/register
```

O cadastro devolve uma sessão e autentica o usuário imediatamente.

## Sessão

`src/core/session` é transversal porque o cliente HTTP e todas as features dependem dela:

- `token-storage`: access e refresh tokens no Expo SecureStore (Keychain/Keystore). Na web, apenas em memória. Sem "Lembrar de mim", a sessão também fica só em memória.
- `httpClient`: envia `Authorization: Bearer`, e ao receber 401 faz um único `POST /auth/refresh` compartilhado entre requisições simultâneas (o backend revoga a família inteira se um refresh token for reutilizado), salva os tokens rotacionados e repete a requisição. Rotas públicas de autenticação usam `skipAuth`.
- `SessionProvider`/`useSession`: restaura a sessão no startup com `GET /users/me`, expõe `signIn` e `signOut` (que chama `POST /auth/logout` e apaga os tokens). Se o backend recusar o refresh, a sessão é encerrada e as rotas protegidas voltam para a landing. Falhas de rede no startup mantêm os tokens para a próxima abertura.

## Atividade em andamento (tela de bloqueio)

`src/core/activity-status` mostra o aviso de qualquer esporte em andamento, com `expo-widgets`:

- Android: notificação fixa (`createCustomNotification`, layout em `@expo/ui/jetpack-compose`), substituída no lugar a cada atualização.
- iOS: Live Activity na tela de bloqueio e na Dynamic Island (`createLiveActivity`, layout em `@expo/ui/swift-ui`). O tempo é contado pelo próprio iOS a partir de `timerStartMs`.
- Os layouts usam a diretiva `'widget'` e rodam num runtime isolado: sem hooks, i18n ou imports em tempo de execução. A feature envia `ActivityStatus` já traduzido e formatado.
- Os módulos são carregados sob demanda; no Expo Go e na web o aviso simplesmente não aparece.
- A corrida publica pela tela (no máximo a cada 5 s, imediatamente ao pausar/retomar) e pela tarefa de localização em segundo plano, que continua a distância a partir de `LocalRunningState.live`.


- `OnboardingStatusProvider` consulta `GET /onboarding/me` sempre que a sessão muda de usuário. `NOT_STARTED`/`IN_PROGRESS` liberam só `/onboarding`; `COMPLETED`/`SKIPPED` liberam só `/home`. Se a consulta falhar, o usuário segue para a home e o onboarding volta na próxima abertura.
- O fluxo vive numa única rota com estado local (`useOnboardingFlow`): 0 boas-vindas, 1–4 etapas do backend, 5 resumo. Cada "Continuar" faz `PATCH /onboarding/me` com `currentStep` e os dados da etapa antes de avançar; o status `IN_PROGRESS` retoma na etapa salva, com as seleções vindas de `GET /profiles/me`.
- "Pular" chama `POST /onboarding/me/skip`; "Entrar no VYRA" chama `POST /onboarding/me/complete`.
- Modalidades vêm de `GET /sport-modalities`; o i18n traduz pelo `slug` e usa o nome do backend como fallback.
- Ícones usam `lucide-react-native` (SVG, sem download de fonte em runtime). Importe cada ícone pelo caminho (`lucide-react-native/icons/<nome>`); o import pela raiz leva os ~2.000 ícones ao bundle e dobra o tempo de build. Só tipos (`LucideIcon`) vêm da raiz.
- Componentes usados por mais de uma feature (logo, botão primário, campo de texto, voltar, mensagem de erro) ficam em `src/shared/components`.

## Login federado

- Google usa `@react-native-google-signin/google-signin`, carregado sob demanda porque o módulo nativo não existe no Expo Go. No Expo Go o botão mostra que é preciso um development build.
- Apple usa `expo-apple-authentication` e aparece só onde `isAvailableAsync()` retorna verdadeiro (iOS). O app pede o nonce ao backend, envia SHA-256 hex à Apple e devolve o nonce bruto ao backend.
- HTTP 409 no login federado significa e-mail já cadastrado sem vínculo; o app orienta a entrar com senha. Hoje o `HttpExceptionFilter` do backend descarta o campo `code`, então o app não depende de `FEDERATED_LINK_REQUIRED`.
- O config plugin do Google só entra no build quando `GOOGLE_IOS_URL_SCHEME` existe (`app.config.js`), pois ele falha sem esse valor.

## Dependências permitidas

```text
app → core / features
features → core / shared / theme / i18n
core → theme / i18n (quando necessário)
shared → theme
i18n → expo-localization
theme → React Native
```

Features não importam internals umas das outras. Integrações futuras devem usar contratos explícitos ou composição em nível superior.

## Convenções

- Imports internos usam o alias `@/`, apontando para `src/`.
- Arquivos usam kebab-case; componentes e tipos usam PascalCase; hooks começam com `use`.
- Strings visíveis ao usuário pertencem aos catálogos de tradução.
- Variáveis `EXPO_PUBLIC_` nunca contêm secrets.
- Rotas e componentes visuais não fazem requisições HTTP diretamente.
- Respostas de erro externas são normalizadas antes de chegar à UI.
- Testes ficam próximos ao módulo testado.
- SOLID é aplicado quando reduz acoplamento, sem interfaces ou factories especulativas.

## Decisões da TASK 02

1. O conteúdo `starter`, rotas vazias e assets do Expo foram removidos integralmente.
2. A navegação foi reduzida a um `Stack` com a rota de cadastro.
3. O contrato de cadastro foi obtido diretamente do DTO e serviço do backend VYRA.
4. A origem da API vem de `EXPO_PUBLIC_API_URL`; o app acrescenta `/api/v1` sem duplicá-lo.
5. i18n não usa persistência nesta etapa.
6. Tokens retornados pelo cadastro não são logados nem armazenados.
7. Jest usa o preset `jest-expo`; testes de integração HTTP usam cliente mockado e não criam usuários reais.
