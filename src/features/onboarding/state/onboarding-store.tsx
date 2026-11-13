"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Lo que la persona va eligiendo en el onboarding, compartido entre pasos.
 * Se guarda en sessionStorage para sobrevivir a una recarga; cuando exista el
 * backend, cada paso lo enviará a la API y esto quedará como caché local.
 */
export interface OnboardingData {
  organization: { name: string; sector: string; size: string };
  vacancy: { title: string; requirements: number } | null;
}

const KEY = "criba.onboarding";
const DONE_KEY = "criba.onboarded";

const initial: OnboardingData = {
  organization: { name: "", sector: "", size: "" },
  vacancy: null,
};

interface Ctx {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
  finish: () => void;
}

const OnboardingContext = createContext<Ctx | null>(null);

function read(): OnboardingData {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...initial, ...(JSON.parse(raw) as Partial<OnboardingData>) } : initial;
  } catch {
    return initial;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Leer lo guardado tras montar (sessionStorage no existe en el servidor).
  useEffect(() => {
    const stored = read();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con un almacén externo una sola vez
    setData(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Sin almacenamiento (modo privado): el onboarding sigue funcionando en memoria.
    }
  }, [data, hydrated]);

  const update = useCallback((patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch })), []);
  const finish = useCallback(() => {
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {
      // Ver arriba.
    }
  }, []);

  const value = useMemo(() => ({ data, update, finish }), [data, update, finish]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): Ctx {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding debe usarse dentro de <OnboardingProvider>");
  return ctx;
}

