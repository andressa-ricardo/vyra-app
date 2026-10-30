# Arquitetura mobile do VYRA

## Objetivo

O VYRA adota Feature-First com Clean Architecture pragmática. A estrutura separa navegação, apresentação, regras de negócio e infraestrutura sem criar interfaces ou camadas antes de existir uma necessidade real.

## Estrutura

```text
src/
├── app/                  # Expo Router: rotas e layouts somente
├── core/                 # Infraestrutura transversal e providers da aplicação
├── features/             # Funcionalidades organizadas por domínio
├── shared/               # Código reutilizado por mais de uma feature
└── theme/                # Tokens visuais e temas light/dark
```

### `src/app`

É a camada de navegação. Cada arquivo é uma rota do Expo Router, portanto deve ser pequeno: compõe layouts, lê parâmetros de rota quando necessário e delega a renderização para uma feature. Não contém regras de negócio, acesso à API ou estado de domínio.

### `src/features`

Cada domínio nasce somente quando for implementado. Uma feature pode evoluir para:

```text
feature-name/
├── domain/               # Entidades, contratos e regras puras, quando existirem
├── application/          # Casos de uso e orquestração, quando necessários
├── infrastructure/       # Implementações específicas do domínio
└── presentation/
    ├── components/
    ├── hooks/
    └── screens/
```

Essa árvore não é obrigatória por antecipação. Pastas e camadas são criadas conforme a complexidade real. Nesta etapa, `starter` preserva a interface do template original enquanto as features de produto ainda não existem.

### `src/shared`

Contém elementos realmente compartilhados e sem regra de um domínio específico. Componentes devem receber dados e callbacks por propriedades. Hooks compartilhados encapsulam comportamento transversal de UI. Uma feature não deve usar `shared` como depósito genérico.

### `src/core`

É o ponto de composição e da infraestrutura transversal. Providers globais ficam em `core/providers`. Clientes HTTP, autenticação, armazenamento e configuração serão adicionados apenas quando forem implementados, evitando contratos especulativos.

### `src/theme`

Centraliza cores semânticas, espaçamento e tipografia. Os componentes consomem nomes semânticos como `primary`, `background` e `text`, nunca uma variante de modo diretamente. O modo segue o sistema pelo `useColorScheme`, com `userInterfaceStyle: automatic` no app config.

## Dependências permitidas

```text
app → core / features / shared / theme
features → core / shared / theme
core → shared / theme
shared → theme
theme → React Native
```

Features não importam internals umas das outras. Quando uma integração entre domínios surgir, deve existir um contrato pequeno e explícito no domínio proprietário ou uma composição no nível da aplicação.

## Convenções

- Imports internos usam o alias `@/`, apontando para `src/`.
- Nomes de arquivos usam kebab-case; componentes e tipos usam PascalCase; hooks começam com `use`.
- Tipos ficam próximos de quem os possui. Um tipo só vai para `shared` quando for verdadeiramente transversal.
- Estado local permanece no componente quando não precisa ser compartilhado.
- Chamadas de API não são feitas por arquivos de rota ou componentes visuais.
- SOLID é aplicado onde reduz acoplamento; não justifica wrappers, interfaces ou factories sem uso concreto.
- Código deve funcionar em Android, iOS e web, salvo arquivo específico de plataforma (`.android`, `.ios` ou `.web`).

## Decisões desta etapa

1. O Expo Router existente e suas native tabs foram preservados para não remover comportamento do template.
2. A interface do template foi isolada em `features/starter`; ela não representa uma feature de produto e será substituída gradualmente.
3. `AppProviders` é o composition root de providers globais e atualmente configura apenas o tema de navegação.
4. Não foram criados clientes HTTP, repositórios, stores, autenticação ou armazenamento porque ainda não há caso de uso que determine seus contratos.
5. Foram adicionadas somente as dependências de desenvolvimento que o comando oficial de lint do Expo exige; nenhuma dependência de runtime ou diretório nativo foi adicionado. O projeto continua no fluxo CNG e compatível com Expo Go.

## Referências oficiais

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript e aliases](https://docs.expo.dev/guides/typescript/)
- [Temas de cor](https://docs.expo.dev/develop/user-interface/color-themes/)
