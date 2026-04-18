import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WeatherData {
  query: string;
  searchType: 'text' | 'geolocation' | null;
}

const WeatherContext = createContext<{
  data: WeatherData;
  fetchWeather: (lat: number, lon: number) => void;
  setQuery: (query: string) => void;
} | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WeatherData>({
    query: '',
    searchType: null,
  });

  const fetchWeather = (lat: number, lon: number) => {
    setData({
      query: 'Geolocation', 
      searchType: 'geolocation',
    });
  };

  const setQuery = (query: string) => {
    setData({
      query: query,
      searchType: 'text',
    });
  };

  return (
    <WeatherContext.Provider value={{ data, fetchWeather, setQuery }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather doit être utilisé dans WeatherProvider');
  return context;
};