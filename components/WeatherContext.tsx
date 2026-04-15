import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchWeatherApi } from 'openmeteo';

// Types
export interface WeatherData {
  location: { city: string; region: string; country: string };
  current: { temp: number; desc: string; wind: number };
  hourly: Array<{ time: Date; temp: number; desc: string; wind: number }>;
  daily: Array<{ date: Date; min: number; max: number; desc: string }>;
  loading: boolean;
  error: string | null;
  query: string;
  searchType: 'text' | 'geolocation' | null;
}

// API géolocalisation
const getLocation = async (lat: number, lon: number) => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`);
    const data = await res.json();
    return {
      city: data.city || data.locality || 'Unknown',
      region: data.principalSubdivision || 'Unknown', 
      country: data.countryName || 'Unknown'
    };
  } catch {
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
  }
};

// Descriptions météo
const getDesc = (code: number) => {
  const w: Record<number, string> = {
    0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain', 71: 'Light Snow', 
    73: 'Snow', 75: 'Heavy Snow', 80: 'Showers', 81: 'Moderate Showers', 
    82: 'Heavy Showers', 95: 'Thunderstorm'
  };
  return w[code] || 'Unknown';
};

// Fonction pour générer des données factices - EXPORTÉE
export const getDummyData = (): WeatherData => {
  const now = new Date();
  return {
    location: { city: 'Paris', region: 'Île-de-France', country: 'France' },
    current: { temp: 15, desc: 'Partly Cloudy', wind: 12 },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(now.getTime() + i * 60 * 60 * 1000),
      temp: Math.round(Math.random() * 30),
      desc: getDesc(Math.floor(Math.random() * 100)),
      wind: Math.round(Math.random() * 20)
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now.getTime() + i * 24 * 60 * 60 * 1000),
      max: Math.round(Math.random() * 30),
      min: Math.round(Math.random() * 30),
      desc: getDesc(Math.floor(Math.random() * 100))
    })),
    loading: false,
    error: null,
    query: '',
    searchType: null
  };
};

// Contexte
const WeatherContext = createContext<{
  data: WeatherData;
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  loadDummyData: () => void;
  setQuery: (query: string) => void;
} | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WeatherData>({
    location: { city: '', region: '', country: '' },
    current: { temp: 0, desc: '', wind: 0 },
    hourly: [],
    daily: [],
    loading: false,
    error: null,
    query: '',
    searchType: null,
  });

const setQuery = (query: string) => {
  setData(prev => ({ 
    ...prev,          // On garde la météo actuelle, le chargement, etc.
    query: query,     // On met à jour le texte saisi
    searchType: 'text' // On bascule le type en "text" car l'utilisateur tape
  }));
};

  // Fonction pour charger les données factices
  const loadDummyData = () => {
    setData(getDummyData());
  };
  

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      console.log('=== FETCHWEATHER CALLED ===');
      console.log('Coordinates:', lat, lon);
      setData(prev => ({ ...prev, loading: true, error: null }));
const today = new Date().toISOString().split("T")[0];
      const [responses, location] = await Promise.all([
        fetchWeatherApi("https://api.open-meteo.com/v1/forecast", {
          latitude: lat,
          longitude: lon,
          current: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
          hourly: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
          daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'],
          timezone: 'auto',
          forecast_days: 7
        }),
        getLocation(lat, lon)
      ]);

      const response = responses[0];
      const offset = response.utcOffsetSeconds();

      // Current
      const curr = response.current()!;
      const current = {
        temp: Math.round(curr.variables(0)!.value()),
        desc: getDesc(curr.variables(1)!.value()),
        wind: Math.round(curr.variables(2)!.value())
      };

      // Hourly (24h)
      const h = response.hourly()!;
     const hourly = Array.from({ length: 24 }, (_, i) => ({
  time: new Date((Number(h.time()) + i * h.interval()) * 1000), // ⚡ sans + offset
  temp: Math.round(h.variables(0)!.valuesArray()![i]),
  desc: getDesc(h.variables(1)!.valuesArray()![i]),
  wind: Math.round(h.variables(2)!.valuesArray()![i])
}));

      // Daily
      const d = response.daily()!;
      const dailyCount = (Number(d.timeEnd()) - Number(d.time())) / d.interval();
     const daily = Array.from({ length: dailyCount }, (_, i) => ({
  date: new Date((Number(d.time()) + i * d.interval()) * 1000), // ⚡ sans + offset
  max: Math.round(d.variables(0)!.valuesArray()![i]),
  min: Math.round(d.variables(1)!.valuesArray()![i]),
  desc: getDesc(d.variables(2)!.valuesArray()![i])
}));


      console.log('=== DONNÉES EXTRAITES ===');
      console.log('Location récupérée:', location);
      console.log('Current weather:', current);
      console.log('Hourly (premier):', hourly[0]);
      console.log('Daily (premier):', daily[0]);

      const newData = { 
        location, 
        current, 
        hourly, 
        daily, 
        loading: false, 
        error: null,
        query: '',
        searchType: 'geolocation' as const
      };
      console.log('=== DONNÉES FINALES ENVOYÉES À SETDATA ===');
      console.log('newData:', newData);

      setData(newData);
      console.log('=== SETDATA APPELÉ ===');

    } catch (error) {
      console.log('=== API ERROR ===');
      console.log('Error details:', error);
      setData(prev => ({ ...prev, loading: false, error: 'Failed to fetch weather' }));
    }
  };

  return (
    <WeatherContext.Provider value={{ data, fetchWeather, loadDummyData, setQuery }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used within WeatherProvider');
  return context;
};