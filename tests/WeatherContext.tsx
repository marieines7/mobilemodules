// __tests__/WeatherContext.test.js
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { WeatherProvider, useWeather } from '../WeatherContext';

// Mock des dépendances
jest.mock('openmeteo', () => ({
  fetchWeatherApi: jest.fn(),
}));

// Mock de fetch pour l'API de géolocalisation
global.fetch = jest.fn();

// Composant de test pour utiliser le hook
const TestComponent = ({ onDataUpdate }) => {
  const { data, fetchWeather } = useWeather();
  
  React.useEffect(() => {
    if (onDataUpdate) {
      onDataUpdate(data, fetchWeather);
    }
  }, [data, fetchWeather, onDataUpdate]);

  return null;
};

describe('WeatherContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('WeatherProvider', () => {
    it('devrait fournir les données initiales', () => {
      let capturedData;
      
      const handleDataUpdate = (data) => {
        capturedData = data;
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      expect(capturedData).toEqual({
        location: { city: '', region: '', country: '' },
        current: { temp: 0, desc: '', wind: 0 },
        hourly: [],
        daily: [],
        loading: false,
        error: null,
      });
    });

    it('devrait lever une erreur si useWeather est utilisé en dehors du provider', () => {
      // Suppression des logs d'erreur pour ce test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useWeather must be used within WeatherProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('fetchWeather', () => {
    const mockWeatherResponse = {
      utcOffsetSeconds: () => 7200, // +2 heures
      current: () => ({
        variables: (index) => {
          const values = [15.5, 2, 12.3]; // temp, weather_code, wind
          return { value: () => values[index] };
        }
      }),
      hourly: () => ({
        time: () => BigInt(1640995200), // timestamp de base
        interval: () => 3600, // 1 heure
        variables: (index) => ({
          valuesArray: () => {
            if (index === 0) return Array(24).fill(0).map((_, i) => 15 + i * 0.5); // températures
            if (index === 1) return Array(24).fill(2); // weather codes
            return Array(24).fill(10); // wind speeds
          }
        })
      }),
      daily: () => ({
        time: () => BigInt(1640995200),
        timeEnd: () => BigInt(1640995200 + 7 * 24 * 3600), // 7 jours
        interval: () => 24 * 3600, // 1 jour
        variables: (index) => ({
          valuesArray: () => {
            if (index === 0) return [20, 18, 22, 19, 21, 17, 23]; // max temps
            if (index === 1) return [10, 8, 12, 9, 11, 7, 13]; // min temps
            return [1, 2, 0, 3, 1, 2, 0]; // weather codes
          }
        })
      })
    };

    const mockLocationResponse = {
      city: 'Paris',
      principalSubdivision: 'Île-de-France',
      countryName: 'France'
    };

    it('devrait fetcher les données météo avec succès', async () => {
      const { fetchWeatherApi } = require('openmeteo');
      fetchWeatherApi.mockResolvedValue([mockWeatherResponse]);
      
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve(mockLocationResponse)
      });

      let capturedData, capturedFetchWeather;

      const handleDataUpdate = (data, fetchWeather) => {
        capturedData = data;
        capturedFetchWeather = fetchWeather;
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      // Déclencher fetchWeather
      await act(async () => {
        await capturedFetchWeather(48.8566, 2.3522); // Coordonnées de Paris
      });

      await waitFor(() => {
        expect(capturedData.loading).toBe(false);
      });

      // Vérifier que l'API a été appelée correctement
      expect(fetchWeatherApi).toHaveBeenCalledWith(
        "https://api.open-meteo.com/v1/forecast",
        {
          latitude: 48.8566,
          longitude: 2.3522,
          current: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
          hourly: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
          daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'],
          timezone: 'auto',
          forecast_days: 7
        }
      );

      // Vérifier les données de localisation
      expect(capturedData.location).toEqual({
        city: 'Paris',
        region: 'Île-de-France',
        country: 'France'
      });

      // Vérifier les données actuelles
      expect(capturedData.current).toEqual({
        temp: 16, // Math.round(15.5)
        desc: 'Partly Cloudy', // weather code 2
        wind: 12 // Math.round(12.3)
      });

      // Vérifier les données horaires
      expect(capturedData.hourly).toHaveLength(24);
      expect(capturedData.hourly[0]).toMatchObject({
        temp: 15,
        desc: 'Partly Cloudy',
        wind: 10
      });
      expect(capturedData.hourly[0].time).toBeInstanceOf(Date);

      // Vérifier les données quotidiennes
      expect(capturedData.daily).toHaveLength(7);
      expect(capturedData.daily[0]).toMatchObject({
        max: 20,
        min: 10,
        desc: 'Mostly Clear'
      });
      expect(capturedData.daily[0].date).toBeInstanceOf(Date);

      expect(capturedData.error).toBeNull();
    });

    it('devrait gérer les erreurs de l\'API météo', async () => {
      const { fetchWeatherApi } = require('openmeteo');
      fetchWeatherApi.mockRejectedValue(new Error('API Error'));

      let capturedData, capturedFetchWeather;

      const handleDataUpdate = (data, fetchWeather) => {
        capturedData = data;
        capturedFetchWeather = fetchWeather;
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      await act(async () => {
        await capturedFetchWeather(48.8566, 2.3522);
      });

      await waitFor(() => {
        expect(capturedData.loading).toBe(false);
        expect(capturedData.error).toBe('Failed to fetch weather');
      });
    });

    it('devrait gérer les erreurs de géolocalisation', async () => {
      const { fetchWeatherApi } = require('openmeteo');
      fetchWeatherApi.mockResolvedValue([mockWeatherResponse]);
      
      global.fetch.mockRejectedValue(new Error('Network Error'));

      let capturedData, capturedFetchWeather;

      const handleDataUpdate = (data, fetchWeather) => {
        capturedData = data;
        capturedFetchWeather = fetchWeather;
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      await act(async () => {
        await capturedFetchWeather(48.8566, 2.3522);
      });

      await waitFor(() => {
        expect(capturedData.location).toEqual({
          city: 'Unknown',
          region: 'Unknown',
          country: 'Unknown'
        });
      });
    });

    it('devrait définir loading à true pendant le fetch', async () => {
      const { fetchWeatherApi } = require('openmeteo');
      
      // Créer une promesse que nous pouvons résoudre manuellement
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      fetchWeatherApi.mockReturnValue(promise);
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve(mockLocationResponse)
      });

      let capturedData, capturedFetchWeather;
      const dataUpdates = [];

      const handleDataUpdate = (data, fetchWeather) => {
        capturedData = data;
        capturedFetchWeather = fetchWeather;
        dataUpdates.push({ loading: data.loading, error: data.error });
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      // Démarrer le fetch
      act(() => {
        capturedFetchWeather(48.8566, 2.3522);
      });

      // Vérifier que loading est à true
      await waitFor(() => {
        expect(dataUpdates.some(update => update.loading === true)).toBe(true);
      });

      // Résoudre la promesse
      await act(async () => {
        resolvePromise([mockWeatherResponse]);
      });

      // Vérifier que loading est revenu à false
      await waitFor(() => {
        expect(capturedData.loading).toBe(false);
      });
    });
  });

  describe('getDesc function', () => {
    it('devrait retourner les bonnes descriptions pour les codes météo', () => {
      // Cette fonction n'est pas exportée, nous la testons indirectement
      // via les résultats de fetchWeather dans les autres tests
      // Mais nous pouvons créer un test séparé si nécessaire
      
      const { fetchWeatherApi } = require('openmeteo');
      
      const testCodes = [0, 1, 2, 3, 45, 61, 73, 95];
      const expectedDescs = ['Clear', 'Mostly Clear', 'Partly Cloudy', 'Overcast', 'Fog', 'Light Rain', 'Snow', 'Thunderstorm'];
      
      testCodes.forEach(async (code, index) => {
        const mockResponse = {
          ...mockWeatherResponse,
          current: () => ({
            variables: (varIndex) => {
              const values = [15, code, 10]; // temp, weather_code, wind
              return { value: () => values[varIndex] };
            }
          })
        };
        
        fetchWeatherApi.mockResolvedValue([mockResponse]);
        global.fetch.mockResolvedValue({
          json: () => Promise.resolve({ city: 'Test', principalSubdivision: 'Test', countryName: 'Test' })
        });

        let capturedData, capturedFetchWeather;

        const handleDataUpdate = (data, fetchWeather) => {
          capturedData = data;
          capturedFetchWeather = fetchWeather;
        };

        const { unmount } = render(
          <WeatherProvider>
            <TestComponent onDataUpdate={handleDataUpdate} />
          </WeatherProvider>
        );

        await act(async () => {
          await capturedFetchWeather(0, 0);
        });

        await waitFor(() => {
          expect(capturedData.current.desc).toBe(expectedDescs[index]);
        });

        unmount();
      });
    });

    it('devrait retourner "Unknown" pour un code météo inconnu', async () => {
      const { fetchWeatherApi } = require('openmeteo');
      
      const mockResponse = {
        ...mockWeatherResponse,
        current: () => ({
          variables: (varIndex) => {
            const values = [15, 999, 10]; // temp, unknown weather_code, wind
            return { value: () => values[varIndex] };
          }
        })
      };
      
      fetchWeatherApi.mockResolvedValue([mockResponse]);
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve({ city: 'Test', principalSubdivision: 'Test', countryName: 'Test' })
      });

      let capturedData, capturedFetchWeather;

      const handleDataUpdate = (data, fetchWeather) => {
        capturedData = data;
        capturedFetchWeather = fetchWeather;
      };

      render(
        <WeatherProvider>
          <TestComponent onDataUpdate={handleDataUpdate} />
        </WeatherProvider>
      );

      await act(async () => {
        await capturedFetchWeather(0, 0);
      });

      await waitFor(() => {
        expect(capturedData.current.desc).toBe('Unknown');
      });
    });
  });
});

// __tests__/setup.js - Configuration pour les tests
import 'react-native-testing-library/extend-expect';

// Mock console.error pour éviter les logs pendant les tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// __tests__/integration.test.js - Tests d'intégration
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import { WeatherProvider, useWeather } from '../WeatherContext';

// Mock des dépendances pour les tests d'intégration
jest.mock('openmeteo');
global.fetch = jest.fn();

const WeatherApp = () => {
  const { data, fetchWeather } = useWeather();

  const handleFetchWeather = () => {
    fetchWeather(48.8566, 2.3522);
  };

  return (
    <>
      <Text testID="city">{data.location.city}</Text>
      <Text testID="temp">{data.current.temp}°C</Text>
      <Text testID="loading">{data.loading ? 'Loading...' : 'Ready'}</Text>
      <Text testID="error">{data.error || 'No error'}</Text>
      <TouchableOpacity testID="fetch-button" onPress={handleFetchWeather}>
        <Text>Fetch Weather</Text>
      </TouchableOpacity>
    </>
  );
};

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait afficher un workflow complet de l\'application météo', async () => {
    const { fetchWeatherApi } = require('openmeteo');
    
    const mockResponse = {
      utcOffsetSeconds: () => 0,
      current: () => ({
        variables: (index) => {
          const values = [22, 1, 15];
          return { value: () => values[index] };
        }
      }),
      hourly: () => ({
        time: () => BigInt(Date.now() / 1000),
        interval: () => 3600,
        variables: () => ({
          valuesArray: () => Array(24).fill(20)
        })
      }),
      daily: () => ({
        time: () => BigInt(Date.now() / 1000),
        timeEnd: () => BigInt(Date.now() / 1000 + 7 * 24 * 3600),
        interval: () => 24 * 3600,
        variables: () => ({
          valuesArray: () => [25, 15, 1]
        })
      })
    };

    fetchWeatherApi.mockResolvedValue([mockResponse]);
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        city: 'Paris',
        principalSubdivision: 'Île-de-France',
        countryName: 'France'
      })
    });

    const { getByTestId } = render(
      <WeatherProvider>
        <WeatherApp />
      </WeatherProvider>
    );

    // État initial
    expect(getByTestId('city').children[0]).toBe('');
    expect(getByTestId('temp').children[0]).toBe('0°C');
    expect(getByTestId('loading').children[0]).toBe('Ready');
    expect(getByTestId('error').children[0]).toBe('No error');

    // Déclencher le fetch
    fireEvent.press(getByTestId('fetch-button'));

    // Vérifier l'état de loading
    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('Loading...');
    });

    // Attendre la fin du loading et vérifier les données
    await waitFor(() => {
      expect(getByTestId('loading').children[0]).toBe('Ready');
      expect(getByTestId('city').children[0]).toBe('Paris');
      expect(getByTestId('temp').children[0]).toBe('22°C');
      expect(getByTestId('error').children[0]).toBe('No error');
    });
  });
});