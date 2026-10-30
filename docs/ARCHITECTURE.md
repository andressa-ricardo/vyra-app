# Arquitetura mobile do VYRA

## Objetivo

O VYRA adota Feature-First com Clean Architecture pragmática. Navegação, apresentação, regras de negócio e infraestrutura permanecem separadas sem criar camadas antes de existir uma necessidade concreta.

## Estrutura atual

```text
src/
├── app/                  # Rotas e layouts do Expo Router
├── core/
│   ├── api/              # Cliente HTTP, configuração e erros transversais
│   ├── config/           # Leitura tipada do ambiente público
│   └── providers/        # Composition root da aplicação
├── features/
│   └── auth/             # Primeiro domínio real: cadastro
├── i18n/                 # Inicialização, idiomas e catálogos
├── shared/
│   └── hooks/            # Hooks transversais em uso
└── theme/                # Cores semânticas, espaçamento e tipografia
```

### `src/app`

É exclusivamente a camada de navegação. Cada arquivo é uma rota do Expo Router e deve delegar apresentação para uma feature. A rota `/` exporta a landing, `/register` abre o cadastro integrado e `/login` abre a interface de login ainda sem integração. O layout raiz compõe providers e o `Stack`.

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

A resposta contém tokens, mas eles são descartados nesta task. Persistência exige Expo SecureStore e gerenciamento de sessão próprios, previstos para a próxima etapa.

## Dependências permitidas

```text
app → core / features
features → core / shared / theme / i18n
core → theme (quando necessário)
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
