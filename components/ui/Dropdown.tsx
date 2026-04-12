// components/ui/Dropdown.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';

const Dropdown = ({
  data = [],
  onSelect,
  onClose,
  visible = false,
  labelExtractor = item => item?.name || item?.label || item?.toString(),
  keyExtractor = (item, index) => {
    if (item?.id) return item.id.toString();
    if (item?.name) return `${item.name}-${index}`;
    if (typeof item === 'string') return item;
    return `item-${index}`;
  },
  containerStyle = {},
  placeholder = "Aucun résultat",
  searchBarRef = null,
  maxHeight = 200
}) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (visible && searchBarRef?.current) {
      searchBarRef.current.measureInWindow((x, y, width, height) => {
        setPosition({
          top: y + height,
          left: x,
          width: width
        });
      });
    }
  }, [visible, searchBarRef]);

  if (!visible) return null;

  const handleBackdropPress = () => {
    onClose?.();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelect?.(item);
        onClose?.();
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{labelExtractor(item)}</Text>
    </TouchableOpacity>
  );

  if (!data || data.length === 0) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleBackdropPress}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View 
                style={[
                  styles.container, 
                  containerStyle,
                  {
                    position: 'absolute',
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    maxHeight: 60
                  }
                ]}
              >
                <Text style={styles.placeholder}>{placeholder}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View 
              style={[
                styles.container, 
                containerStyle,
                {
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  maxHeight: maxHeight
                }
              ]}
            >
              <FlatList
                data={data}
                keyExtractor={(item, index) => keyExtractor(item, index)}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 9999,
  },
  item: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    padding: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default Dropdown;