import * as Location from 'expo-location';
import { usePermissions } from './usePermissions';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const useLocation = () => {
  const { request, check } = usePermissions();

  const getCoordinates = async () => {
    const hasPermission = await check('location');
    console.log('Location permission status:', hasPermission);
    if (!hasPermission && !(await request('location'))) {
      throw new Error('Permission localisation refusée');
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });
    console.log('Current position:', position);

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  };

  const getCurrentCity = async () => {
    const coords = await getCoordinates();
    const [address] = await Location.reverseGeocodeAsync(coords);
    console.log('Reverse geocode result (current city through coordinates):', address);
    return address?.city || address?.district || address?.region || null;
  };

  return { getCoordinates, getCurrentCity };
};

export const LocationButton = ({ 
  style, 
  onLocationObtained 
}: { 
  style?: any;
  onLocationObtained?: (data: { coordinates: { latitude: number; longitude: number }; city?: string }) => void;
}) => {
  const { getCoordinates, getCurrentCity } = useLocation();
  
  const handlePress = async () => {
    try {
      const coordinates = await getCoordinates();
      const city = await getCurrentCity().catch(() => null);
      onLocationObtained?.({ coordinates, city });
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
  };
  
  return (
    <TouchableOpacity style={[styles.locationButton, style]} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="location" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});