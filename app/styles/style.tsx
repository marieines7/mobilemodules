import {  StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  center: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  location: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 20 },
  temp: { fontSize: 48, textAlign: 'center', color: '#007AFF', fontWeight: '300' },
  desc: { fontSize: 18, textAlign: 'center', color: '#333', marginTop: 10 },
  wind: { fontSize: 16, textAlign: 'center', color: '#666', marginTop: 10 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  column: { flexDirection: 'column', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  time: { flex: 1, fontSize: 14, color: '#333' },
  date: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  rowTemp: { flex: 1, fontSize: 16, color: '#007AFF', textAlign: 'center' },
  minMax: { flex: 1, fontSize: 16, color: '#007AFF', textAlign: 'center' },
  rowDesc: { flex: 2, fontSize: 14, color: '#666', textAlign: 'center' },
  rowWind: { flex: 1, fontSize: 14, color: '#666', textAlign: 'center' },
});