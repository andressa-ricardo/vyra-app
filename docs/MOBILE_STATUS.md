# Status mobile

Atualizado em 30 de outubro de 2026.

## Base técnica

- Expo SDK 58 (`expo ~58.0.21`)
- React Native 0.88.1
- React 19.3.0
- TypeScript 6 em modo estrito
- Expo Router com typed routes
- npm e `package-lock.json`
- Continuous Native Generation, sem `ios/` ou `android/` versionados
- Compatibilidade preservada com Expo Go
- NativeWind 4 + Tailwind 3 para estilização

## TASK 01 — concluída

- Arquitetura Feature-First inicial.
- Separação de `app`, `core`, `features`, `shared` e `theme`.
- Tokens VYRA e suporte light/dark.
- Provider raiz e convenções permanentes.

## TASK 02 — concluída

- Conteúdo, rotas, componentes, animações e assets demonstrativos removidos.
- Tela inicial substituída pelo cadastro funcional minimalista.
- Português brasileiro e inglês com detecção do dispositivo e troca manual.
- Cliente Axios centralizado com ambiente, timeout e normalização de erros.
- Contrato real de `POST /api/v1/auth/register` implementado.
- Validação alinhada ao backend: nome 2–120, e-mail até 254 e senha 8–128 com maiúscula, minúscula e número.
- Confirmação de senha validada apenas no frontend.
- Loading, sucesso e erros traduzidos.
- Testes de schema, serviço HTTP mockado e normalização de erros.
- ESLint, TypeScript e Jest configurados.
- Landing visual do VYRA com imagem full-screen e ações de entrada.
- Rotas `/register` e `/login` com layout responsivo alinhado às referências visuais.
- Cadastro continua integrado ao backend; login, recuperação de senha e provedores sociais permanecem explicitamente indisponíveis até sua implementação real.

## TASK 03 — concluída

- Sessão segura com Expo SecureStore, restauração no startup e rotas protegidas.
- Login por e-mail e senha com "Lembrar de mim".
- Cadastro autentica automaticamente.
- Refresh com rotação em voo único e encerramento da sessão quando recusado.
- Login com Google (development build) e Apple (iOS), seguindo o contrato de nonce do backend.
- Home autenticada com data, saudação pelo horário e primeiro nome do usuário.
- Testes de refresh concorrente, rotas públicas e saudação.

## TASK 04 — concluída

- Onboarding após o primeiro acesso: boas-vindas, experiências, modalidades, objetivo, dados pessoais e resumo.
- Progresso salvo a cada etapa, retomada no ponto salvo, pular e concluir integrados ao backend.
- Ícones SVG com `lucide-react-native`.

## TASK 05 — concluída

- Barra de abas: Início, Treinos, Corrida, Nutrição e Mais (Treinos, Corrida e Nutrição ainda são estados "em breve").
- Tela Mais com perfil, menu de seções e logout com confirmação.

## Pendente

- Criar um `.env` local com o IPv4 correto antes do teste real.
- Executar backend e banco localmente para validar o cadastro ponta a ponta.
- Persistir preferência manual de idioma.
- Configurar client IDs Google, package/Bundle ID e gerar development build para validar Google/Apple.
- Backend: incluir `code` no corpo do `HttpExceptionFilter`.
- Recuperação de senha e vinculação de contas federadas.
- Tema claro (ícone de sol do design).
- Design system completo e identidade visual final.
- Features esportivas.
- CI/CD, analytics e observabilidade.

## Segurança

O app não registra senhas ou tokens. Tokens ficam somente no Expo SecureStore (ou em memória, na web e sem "Lembrar de mim"). `EXPO_PUBLIC_API_URL` contém apenas a origem pública da API e fica visível no bundle, conforme esperado.

O `npm audit --omit=dev` reporta vulnerabilidades transitivas dentro do toolchain do Expo (`@expo/config`/CLI, incluindo uma cópia interna antiga de Zod). A correção automática sugerida faria downgrade para Expo 51, portanto não foi aplicada. O Zod usado diretamente pelo formulário está em `4.6.7`, fora da faixa vulnerável indicada, e o Expo Doctor do SDK 58 passa integralmente.
