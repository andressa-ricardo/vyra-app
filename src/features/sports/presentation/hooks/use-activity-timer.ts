import { useEffect, useState } from 'react';

type TimerState =
  | { status: 'idle' }
  | { status: 'active'; startedAt: number; pausedMs: number }
  | { status: 'paused'; startedAt: number; pausedMs: number; pausedAt: number };

/**
 * Cronômetro local da prévia de atividade. O tempo é derivado dos horários de início e pausa,
 * e não de um contador, para não acumular atraso quando a thread JS fica ocupada.
 */
export function useActivityTimer() {
  const [state, setState] = useState<TimerState>({ status: 'idle' });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== 'active') return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [state.status]);

  const elapsedMs =
    state.status === 'idle'
      ? 0
      : (state.status === 'paused' ? state.pausedAt : now) - state.startedAt - state.pausedMs;

  return {
    status: state.status,
    elapsedSeconds: Math.max(0, Math.floor(elapsedMs / 1_000)),
    start: () => {
      const at = Date.now();
      setNow(at);
      setState({ status: 'active', startedAt: at, pausedMs: 0 });
    },
    pause: () =>
      setState((current) =>
        current.status === 'active' ? { ...current, status: 'paused', pausedAt: Date.now() } : current,
      ),
    resume: () => {
      const at = Date.now();
      setNow(at);
      setState((current) =>
        current.status === 'paused'
          ? { status: 'active', startedAt: current.startedAt, pausedMs: current.pausedMs + at - current.pausedAt }
          : current,
      );
    },
    reset: () => setState({ status: 'idle' }),
  };
}
