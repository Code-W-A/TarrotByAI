import React from 'react';
import { Modal, View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

interface DayPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (day: string) => void;
  selectedDay: string;
}

const DayPickerModal: React.FC<DayPickerModalProps> = ({ visible, onClose, onSelect, selectedDay }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.scrollWrapper}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 31 }, (_, i) => `${i + 1}`).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.item,
                    selectedDay === day && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(day);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.itemText,
                    selectedDay === day && styles.selectedItemText,
                  ]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Închide</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '45%',
    backgroundColor: colors.white || '#fff',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold || '#FFD700',
    marginBottom: 12,
  },
  scrollWrapper: {
    height: 230, // puțin mai înalt
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 12,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginVertical: 3,
    backgroundColor: '#fffbe6',
  },
  selectedItem: {
    backgroundColor: colors.gold || '#FFD700',
  },
  itemText: {
    fontSize: 18,
    color: colors.gold || '#FFD700',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.gold || '#FFD700',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DayPickerModal; 