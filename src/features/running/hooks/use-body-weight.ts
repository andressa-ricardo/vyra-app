import { useEffect, useState } from 'react';

import { getBodyWeightKg } from '@/features/running/infrastructure/running-api';

/** Sem peso (offline ou perfil incompleto), as calorias aparecem como indisponíveis. */
export function useBodyWeight() {
  const [weightKg, setWeightKg] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void getBodyWeightKg()
      .then((weight) => active && setWeightKg(weight))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return weightKg;
}
