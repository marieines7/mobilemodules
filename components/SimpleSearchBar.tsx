import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, TouchableWithoutFeedback, Dimensions } from 'react-native';

export default function SimpleSearchBar({ placeholder = "Rechercher...", onSearch, onSelect, renderItem, inputStyle, dropdownStyle, itemStyle, containerStyle }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { width, height } = Dimensions.get('window');

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2 && onSearch) {
      const data = await onSearch(text);
      setResults(data || []);
    } else setResults([]);
  };

  return (
    <View style={containerStyle}>
      {results.length > 0 && (
        <TouchableWithoutFeedback onPress={() => setResults([])}>
          <View style={{ position: 'absolute', top: -height, left: -width, width: width * 3, height: height * 3, zIndex: 1 }} />
        </TouchableWithoutFeedback>
      )}
      <View style={{ zIndex: 2 }}>
        <TextInput style={[s.input, inputStyle]} placeholder={placeholder} value={query} onChangeText={handleSearch} />
        {results.length > 0 && (
          <View style={[s.dropdown, dropdownStyle]}>
            <FlatList
              data={results}
              keyExtractor={(_, i) => i.toString()}
              renderItem={renderItem || (({ item }) => (
                <TouchableOpacity style={[s.item, itemStyle]} onPress={() => { onSelect?.(item); setResults([]); }}>
                  <Text>{item.name || item.title || item}</Text>
                </TouchableOpacity>
              ))}
            />
          </View>
        )}
      </View>
    </View>
  );
}


const s = {
  //container: { padding: 10 },
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, backgroundColor: 'white', height: 45 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 25, padding: 12, backgroundColor: 'white' },
  dropdown: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 5 },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }
};