import React, { memo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../utils/colors";
import { getLanguageLabel } from "../utils/videoLanguageLabels";
import i18n from "../../../../i18n";

interface Props {
  availableLocales: string[];
  selectedLocale: string;
  onSelect: (locale: string) => void;
}

const VideoLanguagePickerComponent: React.FC<Props> = ({
  availableLocales,
  selectedLocale,
  onSelect,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (availableLocales.length <= 1) {
    return null;
  }

  const handleSelect = (locale: string) => {
    onSelect(locale);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="globe-outline" size={18} color="#5d4e37" />
        <Text style={styles.pickerLabel}>
          {i18n.translate("videoPlaybackLanguage", "Limba redării")}:
        </Text>
        <Text style={styles.pickerValue}>
          {getLanguageLabel(selectedLocale)}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#8b7355" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {i18n.translate("videoPlaybackLanguage", "Limba redării")}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#5d4e37" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {availableLocales.map((locale) => {
                const isSelected = locale === selectedLocale;
                return (
                  <TouchableOpacity
                    key={locale}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(locale)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {getLanguageLabel(locale)}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.gold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export const VideoLanguagePicker = memo(VideoLanguagePickerComponent);

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(250, 247, 242, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(191, 167, 106, 0.3)",
    gap: 8,
  },
  pickerLabel: {
    fontSize: 14,
    color: "#5d4e37",
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gold,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fffef9",
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(191, 167, 106, 0.2)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5d4e37",
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionItemSelected: {
    backgroundColor: "rgba(191, 167, 106, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#5d4e37",
  },
  optionTextSelected: {
    fontWeight: "600",
    color: colors.gold,
  },
});
