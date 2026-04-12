import React from 'react'
import { View, Text, FlatList } from 'react-native';
import { useWeather, getDummyData } from '@/components/WeatherContext';
import { styles } from '../styles/style';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function Weekly() {
//  const { data } = useWeather();
    const data = getDummyData();
  if (data.loading) return <Text style={styles.center}>Loading...</Text>;
  if (data.error) return <Text style={styles.center}>{data.error}</Text>;

  // Préparation unique des données pour le graphique
  const chartData = React.useMemo(() => {
    const minData = data.daily.map((item) => ({
      value: Number(item.min),
      label: item.date.toLocaleDateString('fr', { month: 'short', day: 'numeric' }),
      dataPointText: `${item.min}°`
    }));

    const maxData = data.daily.map((item) => ({
      value: Number(item.max),
      dataPointText: `${item.max}°`
    }));

    // Calcul automatique des limites
    const allTemps = [...minData.map(d => d.value), ...maxData.map(d => d.value)];
    const minValue = Math.min(...allTemps) - 2;
    const maxValue = Math.max(...allTemps) + 2;

    return { minData, maxData, minValue, maxValue };
  }, [data.daily]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Header />
        
        <View style={styles.container}>
          <Text style={styles.title}>Weekly</Text>
          <Text style={styles.location}>
            {data.location.city}, {data.location.region}, {data.location.country}
          </Text>
          
          <LineChart
            data={chartData.minData}
            data2={chartData.maxData}
            maxValue={chartData.maxValue}
            minValue={chartData.minValue}
            
            color1="blue"
            color2="red"
            dataPointsColor1="blue" 
            dataPointsColor2="red"
            textFontSize={11}
            textColor1="blue"
            textColor2="red"
            
            yAxisOffset={10}
            xAxisOffset={5}
          />
          
          <FlatList 
            horizontal
            style={{ flex: 1, flexDirection: 'row' }}
            data={data.daily}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.column}>
                <Text style={{}}>
                  {item.date.toLocaleDateString('en', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
                <Text style={{}}>{item.min}° / {item.max}°</Text>
                <Text style={{}}>{item.desc}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}