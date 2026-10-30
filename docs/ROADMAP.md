# Roadmap mobile

O roadmap é incremental. Cada task deve entregar um recorte utilizável e validado, sem antecipar estruturas das etapas seguintes.

## TASK 01 — Arquitetura inicial

Status: concluída.

- Separação entre rotas, features, shared, core e theme.
- Tokens light/dark e provider raiz.
- Convenções, status e decisões documentados.

## TASK 02 — Fundação de produto e design system mínimo

Sugestão, aguardando autorização:

- Definir requisitos do primeiro fluxo real e o mapa de rotas.
- Criar somente os primitives usados por esse fluxo (por exemplo, botão, campo, container de tela e feedback de carregamento/erro).
- Definir acessibilidade, estados interativos e escala tipográfica mínima.
- Substituir gradualmente a UI `starter` sem implementar integrações de backend antes dos contratos estarem definidos.
- Adicionar testes para os primitives e para o primeiro fluxo escolhido.

## Etapas futuras

1. Auth e onboarding, com contratos de sessão e armazenamento seguro definidos a partir da API real.
2. Profiles e seleção de modalidades.
3. Activities, exercises, workouts e workout-sessions.
4. Running, nutrition e progress.
5. Professionals, organizations e appointments.
6. Observabilidade, offline/cache, acessibilidade ampliada e automação de releases.

A ordem pode mudar conforme validação de produto e disponibilidade do backend. Cada domínio deve nascer como feature independente apenas quando entrar no escopo.
