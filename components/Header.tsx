import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
//import SearchBar from './SearchBar';
import WeatherSearchBar from './WeatherSearchBar';
import { WeatherProvider, useWeather } from './WeatherContext';
import SearchBar from './SearchBar';

export default function Header() {


  return (
      <View style={styles.container}>
        <WeatherSearchBar />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    paddingTop: 60, // Espace pour la status bar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});