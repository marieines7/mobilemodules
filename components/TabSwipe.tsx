// components/TabSwipe.tsx
import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function TabSwipe({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const swipe = Gesture.Pan().onEnd((e) => {
    if (e.translationX > 100) router.push('/');
    if (e.translationX < -100) router.push('/explore');
  });

  return (
    <GestureDetector gesture={swipe}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </GestureDetector>
  );
}
