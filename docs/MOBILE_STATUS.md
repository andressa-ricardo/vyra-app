# Status mobile

## Running — implementação funcional

- Dashboard integrado a estatísticas semanais, meta, histórico e recordes reais.
- GPS real, mapa, cronômetro e percurso incremental.
- Pausa, retomada, finalização e descarte funcionam offline e são sincronizados depois, com o horário do aparelho.
- Cronômetro derivado de timestamps (correto após segundo plano) e pontos capturados em segundo plano exibidos ao voltar ao app.
- Fila local idempotente, sincronização em lotes e recuperação da sessão ativa.
- Resumo real com nome editável, mapa, métricas, splits e recordes.
- Telas de corrida e resumo no visual escuro do app: mapa escuro com início/posição, sinal de GPS, bloqueio de controles e gráficos de ritmo por km e elevação.
- Aviso de corrida em andamento na tela de bloqueio: notificação fixa no Android e Live Activity/Dynamic Island no iOS, com distância, tempo e pace médio. Exige development build; o iOS exige conta Apple Developer (App Group `group.com.vyra.app`) e ainda não foi compilado.
- Calorias são estimadas (peso do perfil × km) e o ganho de elevação vem da altitude do GPS. Cadência e frequência cardíaca não são exibidas: o app ainda não tem pedômetro nem sensor cardíaco.

O segundo plano está configurado, mas exige Development Build e validação física. Permanecem pendentes testes com tela bloqueada/fabricantes Android, bateria, chave Google Maps Android (`GOOGLE_MAPS_ANDROID_API_KEY`, lida em `app.config.js`) e armazenamento local cifrado de GPS.

Atualizado em 31 de outubro de 2026.

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

- Barra de abas: Início, Treinos, Corrida, Nutrição e Mais (Treinos e Nutrição ainda são estados "em breve").
- Tela Mais com perfil, menu de seções e logout com confirmação.
- Tela de configurações acessível pela aba Mais, com conta, notificações, preferências, troca de idioma e exclusão de conta sinalizada como indisponível enquanto não houver contrato de backend.

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
