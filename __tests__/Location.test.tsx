// __tests__/Location.test.js
import * as Location from 'expo-location';

// Mocks
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 4 },
}));

jest.mock('../utils/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    check: jest.fn().mockResolvedValue(true),
    request: jest.fn().mockResolvedValue(true),
  })),
}));

// Import après les mocks
const { useLocation } = require('../utils/Location');

describe('useLocation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('getCoordinates returns valid coordinates', async () => {
    // Mock successful location
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    });

    // Test hook
    const locationHook = useLocation();
    const result = await locationHook.getCoordinates();

    expect(result).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: 4,
      timeout: 10000,
    });
  });

  test('getCurrentCity returns city name', async () => {
    // Mock location and geocoding
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 48.8566, longitude: 2.3522 },
    });
    Location.reverseGeocodeAsync.mockResolvedValue([
      { city: 'Paris', district: null, region: 'Île-de-France' },
    ]);

    const locationHook = useLocation();
    const city = await locationHook.getCurrentCity();

    expect(city).toBe('Paris');
    expect(Location.reverseGeocodeAsync).toHaveBeenCalledWith({
      latitude: 48.8566,
      longitude: 2.3522,
    });
  });

  test('getCurrentCity fallback to district when city is null', async () => {
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 48.8566, longitude: 2.3522 },
    });
    Location.reverseGeocodeAsync.mockResolvedValue([
      { city: null, district: '1er Arrondissement', region: 'Île-de-France' },
    ]);

    const locationHook = useLocation();
    const city = await locationHook.getCurrentCity();

    expect(city).toBe('1er Arrondissement');
  });

  test('getCoordinates throws error when permission denied', async () => {
    // Mock permission denied
    const mockUsePermissions = require('../utils/usePermissions').usePermissions;
    mockUsePermissions.mockReturnValue({
      check: jest.fn().mockResolvedValue(false),
      request: jest.fn().mockResolvedValue(false),
    });

    const locationHook = useLocation();
    
    await expect(locationHook.getCoordinates()).rejects.toThrow('Permission localisation refusée');
  });

  test('handles location service errors', async () => {
    Location.getCurrentPositionAsync.mockRejectedValue(new Error('Permission localisation refusée'));

    const locationHook = useLocation();
    
    await expect(locationHook.getCoordinates()).rejects.toThrow('Permission localisation refusée');
  });
});

// Test simple pour vérifier que le module s'exporte bien
describe('Location Module', () => {
  test('exports useLocation function', () => {
    expect(typeof useLocation).toBe('function');
  });

  test('exports LocationButton component', () => {
    const { LocationButton } = require('../utils/Location');
    expect(typeof LocationButton).toBe('function');
  });
});