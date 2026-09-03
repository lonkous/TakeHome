import * as React from "react";
import type { View } from "react-native";
import type {
  Insets,
  TourDefinition,
  TourController,
  UseTourTargetOptions,
} from "guideway";

export function TourProvider({
  children,
}: {
  children: React.ReactNode;
  tours?: TourDefinition[];
  insets?: Insets;
}) {
  return React.createElement(React.Fragment, null, children);
}

export function useTour(): TourController {
  return {
    start: () => {},
    stop: () => {},
    next: () => {},
    back: () => {},
    skip: () => {},
    reset: () => {},
    isActive: false,
    activeTourId: null,
    currentStep: null,
    stepIndex: 0,
    totalSteps: 0,
    progress: 0,
  };
}

export function useTourTarget(
  _id?: string,
  _options?: UseTourTargetOptions,
): React.RefObject<View | null> {
  return React.useRef<View>(null);
}
