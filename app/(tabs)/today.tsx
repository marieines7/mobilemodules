import React, { useMemo } from 'react'
import { View, Text, FlatList } from 'react-native';
import { getDummyData, useWeather} from '@/components/WeatherContext'; // Import du contexte météo
import { styles } from '../styles/style'; // Import des styles
import { LineChart } from 'react-native-gifted-charts';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function Today() {
  const { data } = useWeather();
  //const data = getDummyData();
  if (data.loading) return <Text style={styles.center}>Loading...</Text>;
  if (data.error) return <Text style={styles.center}>{data.error}</Text>;



   // const chartData = data.hourly.map(item => ({
   // value: item.temp,
  // label: item.time.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
//  }));


  const useChartData = (hourlyData) => {
  return useMemo(() => 
    hourlyData.map(item => ({
      value: item.temp,
      label: item.time.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
    })), 
    [hourlyData]
  );
};
const getDisplayLocation = () => {
    if (data.searchType === 'geolocation') {
      return "📍 Ma position actuelle";
    }
    if (data.query) {
      return `Recherche : ${data.query}`;
    }
    return `${data.location.city}, ${data.location.country}`;
  };

  const locationTitle = getDisplayLocation();


  return (
     <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Header />
    <View style={styles.container}>
      <Text style={styles.title}>Today {locationTitle}</Text>
      <Text style={styles.location}>{data.location.city}, {data.location.region}, {data.location.country}</Text>
      <LineChart data={useChartData(data.hourly)} />
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
         <FlatList
          data={data.hourly}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.column}>
              <Text style={styles.time}>{item.time.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.rowDesc}>{item.desc}</Text>
              <Text style={styles.rowTemp}>{item.temp}°C</Text>
              <Text style={styles.rowWind}>{item.wind} km/h</Text>
            </View>
          )}
        />
      {/* </ScrollView> */}
    </View>
     </SafeAreaView>
          </SafeAreaProvider>
  );
};
