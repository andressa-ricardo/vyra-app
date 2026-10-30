import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { useSession } from '@/core/session/session-provider';
import { fetchOnboarding } from '@/features/onboarding/infrastructure/onboarding-api';
import type { OnboardingView } from '@/features/onboarding/types/onboarding.types';

type OnboardingGate =
  | { status: 'idle' | 'loading' | 'done'; onboarding: OnboardingView | null }
  | { status: 'pending'; onboarding: OnboardingView };

type OnboardingStatusContextValue = OnboardingGate & {
  /** Chamado após concluir ou pular: libera a home sem nova requisição. */
  finish: () => void;
};

const OnboardingStatusContext = createContext<OnboardingStatusContextValue | null>(null);

export function OnboardingStatusProvider({ children }: PropsWithChildren) {
  const session = useSession();
  const userId = session.user?.id ?? null;
  const [gate, setGate] = useState<OnboardingGate & { userId: string | null }>({
    status: 'idle',
    onboarding: null,
    userId: null,
  });

  // Estado derivado da sessão: ajustado durante o render, sem efeito extra.
  if (gate.userId !== userId) {
    setGate({ status: userId ? 'loading' : 'idle', onboarding: null, userId });
  }

  useEffect(() => {
    if (!userId) return;
    let active = true;

    fetchOnboarding()
      .then((onboarding) => {
        if (!active) return;
        const pending = onboarding.status === 'NOT_STARTED' || onboarding.status === 'IN_PROGRESS';
        setGate(
          pending
            ? { status: 'pending', onboarding, userId }
            : { status: 'done', onboarding, userId },
        );
      })
      // Sem conseguir consultar, o usuário não fica bloqueado: segue para a home e o
      // onboarding volta a ser oferecido na próxima abertura.
      .catch(() => {
        if (active) setGate({ status: 'done', onboarding: null, userId });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const finish = () => setGate((current) => ({ ...current, status: 'done' }));

  return (
    <OnboardingStatusContext value={{ ...gate, finish } as OnboardingStatusContextValue}>
      {children}
    </OnboardingStatusContext>
  );
}

export function useOnboardingStatus() {
  const context = use(OnboardingStatusContext);
  if (!context) throw new Error('useOnboardingStatus must be used within OnboardingStatusProvider');
  return context;
}
