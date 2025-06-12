import React from 'react';
import { Modal, View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

interface YearPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (year: string) => void;
  selectedYear: string;
}

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => `${currentYear - i}`);
};

const YearPickerModal: React.FC<YearPickerModalProps> = ({ visible, onClose, onSelect, selectedYear }) => {
  const years = getYears();
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
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.item,
                    selectedYear === year && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(year);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.itemText,
                    selectedYear === year && styles.selectedItemText,
                  ]}>{year}</Text>
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
    height: 230,
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

export default YearPickerModal; 