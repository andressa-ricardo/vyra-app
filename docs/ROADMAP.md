# Roadmap mobile

## Marco Running

O primeiro fluxo vertical foi implementado: backend Activities/Running, GPS real, sincronização offline, dashboard e resumo. Antes de produção: migration controlada, teste físico, política de retenção/criptografia de coordenadas e validação de background tracking.

O roadmap é incremental. Cada task entrega um recorte validável sem antecipar abstrações das etapas seguintes.

## TASK 01 — Arquitetura inicial

Status: concluída.

- Feature-First e Clean Architecture pragmática.
- Tema light/dark, aliases e providers.
- Convenções e documentação.

## TASK 02 — Limpeza, i18n e cadastro integrado

Status: concluída.

- Remoção integral do template demonstrativo.
- i18n `pt-BR` e `en`.
- Cliente HTTP e ambiente.
- Cadastro alinhado ao backend real.
- Tratamento de erros e testes unitários.

## TASK 03 — Sessão segura e login

Status: concluída (inclui Google e Apple; validação deles depende de development build).

- Adicionar Expo SecureStore após validar a API de SDK 58.
- Implementar armazenamento seguro de access/refresh tokens.
- Implementar login por e-mail e senha.
- Conectar a interface de login já criada ao backend.
- Restaurar sessão no startup.
- Implementar rotação de refresh token e logout idempotente.
- Separar estado autenticado, não autenticado e carregamento.
- Adicionar testes de sessão, refresh concorrente e limpeza segura.
- Definir o comportamento de navegação sem iniciar onboarding social.

## Etapas futuras

1. Onboarding adaptativo, perfil e modalidades.
2. Recuperação de senha.
3. Auth Google/Apple em development builds apropriados.
4. Activities, exercises, workouts e workout-sessions.
5. Running, nutrition e progress.
6. Professionals, organizations e appointments.
7. Observabilidade, offline/cache e automação de releases.
