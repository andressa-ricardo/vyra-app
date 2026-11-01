/**
 * Conteúdo do aviso de atividade em andamento (notificação fixa no Android, Live Activity no iOS).
 * Os layouts nativos não acessam i18n nem utilitários do app: tudo chega pronto e formatado.
 */
export interface ActivityStatus {
  /** Ex.: "Corrida em andamento" / "Corrida pausada". */
  title: string;
  /** Símbolo SF exibido no iOS, ex.: `figure.run`. */
  iosSymbol: string;
  /** Métrica principal, ex.: distância "5,12" + "km". */
  primaryValue: string;
  primaryUnit: string;
  /** Métrica secundária, ex.: "Pace médio" + "5:31 /km". */
  secondaryLabel: string;
  secondaryValue: string;
  elapsedLabel: string;
  /** Tempo já formatado; o Android não tem cronômetro próprio no layout. */
  elapsedText: string;
  /** Início equivalente do cronômetro (agora − tempo ativo), em ms; o iOS conta sozinho a partir dele. */
  timerStartMs: number;
  paused: boolean;
  pausedLabel: string;
  /** Deep link aberto ao tocar no aviso. */
  url: string;
}
