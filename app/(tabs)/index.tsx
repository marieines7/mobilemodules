import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { useWeather } from '@/components/WeatherContext'; // Import du contexte météo
import { LineChart } from "react-native-gifted-charts";

export function CurrentTab() {
  const { data } = useWeather(); // Pas besoin de fetchWeather ici
  
  // LOG POUR DEBUG
  console.log('=== CURRENTTAB RENDER ===');
  console.log('data.loading:', data.loading);
  console.log('data.error:', data.error);
  console.log('data.current existe?', !!data.current);
  console.log('data.current:', data.current);
  console.log('data.location:', data.location);

  if (data.loading) return <Text style={styles.center}>Chargement...</Text>;
  
  if (data.error) return (
    <View style={styles.container}>
      <Text style={styles.error}>{data.error}</Text>
    </View>
  );

  // Changez temporairement cette condition pour plus de détails
  if (!data.current || !data.current.temp || data.current.temp === 0) {
    console.log('=== CONDITION: PAS DE DONNÉES ===');
    console.log('!data.current:', !data.current);
    console.log('!data.current.temp:', !data.current?.temp);
    console.log('data.current.temp === 0:', data.current?.temp === 0);
    
    return (
      <View style={styles.container}>
        <Text style={styles.center}>Recherchez une ville pour voir la météo</Text>
      </View>
    );
  }

  // Si on arrive ici, on a des données météo !
  console.log('=== AFFICHAGE MÉTÉO ===');
  return (
    <View style={styles.container}>
         {data.displayQuery && (
        <Text style={styles.tabInfo}>
          Currently - {data.displayQuery}
        </Text>
      )}
      <Text style={styles.location}>
        {data.location.city}, {data.location.region}, {data.location.country}
      </Text>
      <Text style={styles.temp}>{data.current.temp}°C</Text>
      <Text style={styles.desc}>{data.current.desc}</Text>
      <Text style={styles.wind}>Vent: {data.current.wind} km/h</Text>
      
      {/* Affichage debug des données */}
      <Text style={styles.debug}>
        Debug: {data.hourly.length} prévisions horaires, {data.daily.length} prévisions quotidiennes
      </Text>
    </View>
  );
}

// Composant principal
export default function Currently() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Header />
        <CurrentTab />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  location: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',
  },
  desc: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  wind: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  center: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#999',
  },
  error: {
    textAlign: 'center',
    fontSize: 18,
    color: '#ff0000',
    marginBottom: 20,
  },
  debug: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  }
};