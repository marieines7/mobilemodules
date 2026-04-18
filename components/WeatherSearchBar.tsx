import React from 'react';
import { View } from 'react-native';
import { useWeather } from '@/components/WeatherContext';
import { LocationButton } from '@/utils/Location';
import SimpleSearchBar from './SimpleSearchBar';

export default function WeatherSearchBar() {
  const { fetchWeather, setQuery } = useWeather();

  return (
    <View style={s.container}>
      <View style={{ flex: 1 }}>
        <SimpleSearchBar
          placeholder="Rechercher une ville"
          onChangeText={setQuery}
        />
      </View>
      <LocationButton 
        onLocationObtained={({ coordinates, city }) => 
          fetchWeather(coordinates.latitude, coordinates.longitude, city)
        } 
      />
    </View>
  );
}

const s = {
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 10 
  },
};