import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  Provider as PaperProvider,
  Provider,
  Portal,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, View } from "react-native";
import { Button, SocialMediaLogin } from "../../components/commonButton";
import { colors } from "../../utils/colors";

const ConsentModal = ({ hideModalAndSetConsent, visible }) => {
  return (
    <Provider>
      <View style={styles.centeredContainer}>
        <Portal>
          <Modal visible={visible} contentContainerStyle={styles.modal}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Consentiment pentru imagini</Text>
              <Text style={styles.subTitle}>
                Cristina Zurba - Tarot colectează și procesează imagini pentru a oferi experiențe personalizate de tarot. Acceptând, ești de acord cu utilizarea imaginilor tale pentru interpretări mai precise și o experiență îmbunătățită.
              </Text>
            </View>
            <View style={styles.actionContainer}>
              <Button
                disabled={false}
                funCallback={() => {
                  hideModalAndSetConsent();
                }}
                borderWidth={0}
                bgColor={colors.gold || '#FFD700'}
                label={"Accept"}
                borderColor={colors.gold || '#FFD700'}
                success={true}
                style={{ marginTop: 24, width: "80%", borderRadius: 28, alignSelf: 'center' }}
                txtColor={colors.white}
              />
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

export default ConsentModal;
const styles = StyleSheet.create({
  feedbackTitle: {
    fontSize: 16,
    color: "white",
    marginTop: 20,
  },
  feedbackInput: {
    backgroundColor: "white",
    marginVertical: 10,
    width: "90%", // Ajustează conform design-ului tău
  },
  container: {
    flex: 1,
    justifyContent: "center",
    zIndex: 10,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 70,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    color: '#FFD700',
    fontFamily: 'LoraBold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  subTitle: {
    fontSize: 16,
    color: '#131523',
    fontFamily: 'Lora',
    textAlign: 'center',
    opacity: 0.92,
    lineHeight: 22,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 10,
  },
  modal: {
    backgroundColor: '#FFF9F3',
    paddingVertical: 36,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: colors.gold || '#FFD700',
    borderRadius: 28,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 10,
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 400,
    alignSelf: 'center',
  },
});
