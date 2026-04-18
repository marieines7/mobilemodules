import * as Location from 'expo-location';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { usePermissions } from './usePermissions';
import Ionicons from '@expo/vector-icons/Ionicons';

export const useLocation = () => {
  const { request, check } = usePermissions();

  const getFullLocation = async () => {
    const hasPermission = await check('location');
    if (!hasPermission && !(await request('location'))) {
      throw new Error('Permission refusée');
    }

    const { coords } = await Location.getCurrentPositionAsync({ 
      accuracy: Location.Accuracy.Balanced 
    });

    const [address] = await Location.reverseGeocodeAsync(coords);
    
    return {
      coordinates: { latitude: coords.latitude, longitude: coords.longitude },
      city: address?.city || address?.district || null
    };
  };

  return { getFullLocation };
};

export const LocationButton = ({ onLocationObtained }: { onLocationObtained: (data: any) => void }) => {
  const { getFullLocation } = useLocation();

  const handlePress = async () => {
    try {
      const data = await getFullLocation();
      onLocationObtained(data);
    } catch (error) {
      console.error('Erreur loc:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="location" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 45, height: 45, borderRadius: 25,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
});