import React, { createContext, useContext, useState, ReactNode } from 'react';

export const WeatherContext = createContext<any>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState({
    query: '',
    searchType: null as 'text' | 'geolocation' | null,
    loading: false,
  });

  const fetchWeather = (lat: number, lon: number, cityName?: string) => {
    setData({
      query: cityName || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
      searchType: cityName ? 'text' : 'geolocation',
      loading: false
    });
  };

  const setQuery = (query: string) => {
    setData(prev => ({ ...prev, query, searchType: 'text' }));
  };

  return (
    <WeatherContext.Provider value={{ data, fetchWeather, setQuery }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather must be used within WeatherProvider');
  return context;
};