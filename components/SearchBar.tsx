import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList,TouchableWithoutFeedback } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useWeather } from '@/components/WeatherContext';
import { LocationButton } from '@/utils/Location';

export default function SearchBar() {
  const { fetchWeather } = useWeather();
  const [query, setQuery] = useState('');
  const [suggestedCities, setSuggestedCities] = useState([]);

  const handleTextChange = (text) => {
    setQuery(text);
    if (text.length > 2) {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${text}&count=5&language=en&format=json`)
        .then(response => response.json())
        .then(data => {
          const cities = data.results ? data.results.map(city => ({
            city: city.name,
            region: city.admin1,
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude
          })) : [];
          setSuggestedCities(cities);
        })
        .catch(() => setSuggestedCities([]));
    } else {
      setSuggestedCities([]);
    }
  };

  const selectCity = (item) => {
    setQuery(`${item.city}, ${item.country}`);
    fetchWeather(item.latitude, item.longitude);
    setSuggestedCities([]);
  };

  const handleSubmit = () => {
    if (suggestedCities.length > 0) {
      selectCity(suggestedCities[0]);
    }
  };

  return (
      //  <TouchableWithoutFeedback onPress={() => setSuggestedCities([])}>
    <View style={styles.container}>
      <View style={styles.searchArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Rechercher une ville"
            value={query}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSubmit}
            onBlur={() => console.log('Input blurred')}
            returnKeyType="search"
          />
          <Ionicons name="search" size={20} color="gray" />
        </View>
        
        <LocationButton 
          onLocationObtained={({ coordinates }) => {
            fetchWeather(coordinates.latitude, coordinates.longitude);
          }}
        />
      </View>

      {suggestedCities.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestedCities}
            keyExtractor={(item, index) => `${item.city}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.item}
                onPress={() => selectCity(item)}
              >
                <Text>{item.city}, {item.region}, {item.country}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
   // </TouchableWithoutFeedback>
  );
}

const styles = {
  container: { padding: 10 },
  searchArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, backgroundColor: 'white', height: 45 },
  input: { flex: 1 },
  dropdown: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 5 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }
};