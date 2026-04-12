import { Tabs, useRouter, usePathname } from 'expo-router';
import React from 'react';
import { Platform, View, PanResponder } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WeatherProvider } from '@/components/WeatherContext';

const TABS = [
  { name: 'index', icon: 'paperplane.fill', title: 'Currently', route: '/' },
  { name: 'today', icon: 'paperplane.fill', title: 'Today', route: '/today' },
  { name: 'weekly', icon: 'paperplane.fill', title: 'Weekly', route: '/weekly' },
];

function TabLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentIndex = TABS.findIndex(tab => tab.route === pathname);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20, // si mouvement vertical et fait plus de 20px c'est un swipe
    onPanResponderRelease: (_, { dx }) => {
      if (Math.abs(dx) < 80) return; // si trop court, on abandonne
      
      const newIndex = dx > 0 
        ? Math.max(0, currentIndex - 1)
        : Math.min(TABS.length - 1, currentIndex + 1);
      
      if (newIndex !== currentIndex) {
        router.replace(TABS[newIndex].route);
      }
    },
  });

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute', zIndex: 2 },
            default: { zIndex: 2 },
          }),
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => <IconSymbol size={28} name={tab.icon as any} color={color} />,
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <WeatherProvider>
      <TabLayoutContent />
    </WeatherProvider>
  );
}