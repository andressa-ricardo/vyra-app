import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { getHomeDashboard } from '@/features/home/infrastructure/home-api';
import type { HomeDashboard } from '@/features/home/types/home.types';

type State = {
  data: HomeDashboard | null;
  error: boolean;
  loading: boolean;
  refreshing: boolean;
};

/** Carrega a home ao focar a aba (ex.: depois de finalizar uma corrida) e no puxar para atualizar. */
export function useHomeDashboard() {
  const [state, setState] = useState<State>({ data: null, error: false, loading: true, refreshing: false });
  const request = useRef(0);

  const load = useCallback((refreshing: boolean) => {
    const id = ++request.current;
    setState((current) => ({ ...current, error: false, refreshing }));
    getHomeDashboard().then(
      (data) => {
        if (id === request.current) setState({ data, error: false, loading: false, refreshing: false });
      },
      () => {
        if (id === request.current) setState((current) => ({ ...current, error: true, loading: false, refreshing: false }));
      },
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  return { ...state, refresh: () => load(true), retry: () => load(false) };
}
