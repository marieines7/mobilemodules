import React from 'react'
import { View, Text, FlatList } from 'react-native';
import { useWeather} from '@/components/WeatherContext';
import { styles } from '../styles/style'; 
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function CurrentTab() {
  const { data } = useWeather();
  if (data.loading) return <Text style={styles.center}>Loading...</Text>;
  if (data.error) return <Text style={styles.center}>{data.error}</Text>;


const getDisplayLocation = () => {
    if (data.searchType === 'geolocation') {
      return "\nGeolocation";
    }
    if (data.query) {
      return `\n${data.query}`;
    }
    return ``;
  };

  const locationTitle = getDisplayLocation();


  return (
     <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Header />
    <View style={styles.container}>
      <Text style={styles.title}>Weekly {locationTitle}</Text>
     
    </View>
     </SafeAreaView>
          </SafeAreaProvider>
  );
};
