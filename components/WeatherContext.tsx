import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface simplifiée
export interface WeatherData {
  query: string;
  searchType: 'text' | 'geolocation' | null;
  loading: boolean;
  error: string | null;
}

const WeatherContext = createContext<{
  data: WeatherData;
  fetchWeather: (lat: number, lon: number, cityName?: string) => void;
  setQuery: (query: string) => void;
} | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WeatherData>({
    query: '',
    searchType: null,
    loading: false,
    error: null,
  });

  // Cette fonction est appelée après avoir obtenu des coordonnées
  const fetchWeather = (lat: number, lon: number, cityName?: string) => {
    setData({
      loading: false,
      error: null,
      // Si on a un nom de ville (via geocoding ou recherche), on l'utilise
      // Sinon on met une valeur par défaut pour la géoloc
      query: cityName || 'Ma position', 
      searchType: cityName ? 'text' : 'geolocation',
    });
  };

  // Met à jour la query lors de la saisie manuelle
  const setQuery = (query: string) => {
    setData(prev => ({ 
      ...prev, 
      query: query, 
      searchType: 'text' 
    }));
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