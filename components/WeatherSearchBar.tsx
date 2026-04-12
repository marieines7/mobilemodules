import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useWeather } from '@/components/WeatherContext';
import { LocationButton } from '@/utils/Location';
import SimpleSearchBar from './SimpleSearchBar';

export default function WeatherSearchBar() {
  const { fetchWeather } = useWeather();

  const searchCities = async (query) => {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
    return (await response.json()).results || [];
  };

  const renderCity = ({ item }) => (
    <TouchableOpacity style={s.cityItem} onPress={() => fetchWeather(item.latitude, item.longitude)}>
      <Text>{item.name}, {item.country}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <SimpleSearchBar
        placeholder="Rechercher une ville"
        onSearch={searchCities}
        renderItem={renderCity}
        inputStyle={s.input}
        dropdownStyle={s.dropdown}
        containerStyle={s.searchContainer}
      />
      <LocationButton onLocationObtained={({ coordinates }) => fetchWeather(coordinates.latitude, coordinates.longitude)} />
    </View>
  );
}

const s = {
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  searchContainer: { flex: 1 },
 // input: { borderRadius: 25, paddingHorizontal: 15, height: 45 },
  //dropdown: { borderRadius: 8, marginTop: 5 },
  cityItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
};