import * as React from "react";

export function TourProvider({
  children,
}: {
  children: React.ReactNode;
  tours?: any;
  insets?: any;
}) {
  return React.createElement(React.Fragment, null, children);
}

export function useTour() {
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
  } as any;
}

export function useTourTarget(_id?: string, _options?: any) {
  return React.useRef(null) as any;
}
