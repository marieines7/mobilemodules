import * as Location from 'expo-location';
import { Alert, Platform, Linking } from 'react-native';

const PERMISSIONS = {
  location: {
    name: 'Localisation',
    request: () => Location.requestForegroundPermissionsAsync(),
    check: () => Location.getForegroundPermissionsAsync(),
  },
};

export const usePermissions = () => {
  const request = async (type: keyof typeof PERMISSIONS, showAlert = true) => {
    if (!PERMISSIONS[type]) throw new Error(`Permission ${type} non supportée`);
    
    try {
      const { status } = await PERMISSIONS[type].request();

      if (status === 'denied' && showAlert) {
        Alert.alert(
          `${PERMISSIONS[type].name} refusée`,
          'Allez dans Réglages pour l\'activer',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Réglages', 
              onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings()
            }
          ]
        );
      }

      return status === 'granted';
    } catch (error) {
      console.error(`Erreur permission ${type}:`, error);
      return false;
    }
  };

  const check = async (type: keyof typeof PERMISSIONS) => {
    if (!PERMISSIONS[type]) return false;
    
    try {
      const { status } = await PERMISSIONS[type].check();
      return status === 'granted';
    } catch (error) {
      console.error(`Erreur check ${type}:`, error);
      return false;
    }
  };

  return {
    request,
    check,
  };
};