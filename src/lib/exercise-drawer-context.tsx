"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ItemKind } from "@/lib/training/types";
import { ExerciseDetailDrawer } from "@/components/ExerciseDetailDrawer";

export interface DrawerTarget {
  slug: string;
  kind: ItemKind;
  name: string;
}

interface ExerciseDrawerContextValue {
  open: (target: DrawerTarget) => void;
}

const ExerciseDrawerContext = createContext<ExerciseDrawerContextValue | null>(null);

export function useExerciseDrawer(): ExerciseDrawerContextValue {
  const ctx = useContext(ExerciseDrawerContext);
  if (!ctx) throw new Error("useExerciseDrawer must be used within ExerciseDrawerProvider");
  return ctx;
}

export function ExerciseDrawerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<DrawerTarget | null>(null);

  return (
    <ExerciseDrawerContext.Provider value={{ open: setTarget }}>
      {children}
      <ExerciseDetailDrawer target={target} onClose={() => setTarget(null)} />
    </ExerciseDrawerContext.Provider>
  );
}
