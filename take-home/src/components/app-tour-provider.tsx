import * as React from 'react';
import { TourProvider } from '@/lib/tour';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TourTooltip } from '@/components/tour-tooltip';


const tours = [
  {
    id: 'main',
    steps: [
      { id: 'chart', title: 'Chart Data', body: 'Here you will see how much energy you have used' },
      { id: 'key', title: 'Months', body: 'Here you can see the months' },
      {
        id: 'profile',
        title: 'Your Profile',
        body: 'This is your profile — final step of the tour',
        cutout: { shape: 'rounded' as const, padding: 0, radius: 20 },
      },
    ],
  },
];

export function AppTourProvider({ children }: { children: React.ReactNode }) {
  const rawInsets = useSafeAreaInsets();

  const insets = {
    top: 0,
    right: rawInsets.right,
    bottom: rawInsets.bottom,
    left: rawInsets.left,
  };
  return (
    <TourProvider tours={tours} insets={insets} tooltipComponent={TourTooltip}>
      {children}
    </TourProvider>
  );
}
