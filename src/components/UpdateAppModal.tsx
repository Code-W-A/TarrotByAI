import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import i18n from '../../i18n';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro';
const APP_STORE_URL = 'https://apps.apple.com/ro/app/cristina-zurba-tarot/id6475713937';

const UpdateAppModal = ({ visible, onClose }) => {
  const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
  const storeLabel = Platform.OS === 'ios' ? 'Descarcă din App Store' : 'Descarcă din Google Play';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Image
            source={require("../../assets/LogoPngTransparent.png")}
            style={{ width: 120, height: 120, alignSelf: 'center', marginBottom: 22 }}
            resizeMode="contain"
          />
          <Text style={styles.title}>{i18n.translate('updateAvailable')}</Text>
          <Text style={styles.text}>
            {i18n.translate('updateDescription')}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(storeUrl)}>
            <Text style={styles.buttonText}>{Platform.OS === 'ios' ? i18n.translate('downloadFromAppStore') : i18n.translate('downloadFromGooglePlay')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>{i18n.translate('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fffbeae0',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#bfa76a',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'LoraBold',
  },
  text: {
    fontSize: 17,
    color: '#7c6f57',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'LoraRegular',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
    shadowColor: '#bfa76a',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  buttonText: {
    color: '#131523',
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'LoraBold',
  },
  closeBtn: {
    marginTop: 4,
    padding: 8,
  },
  closeText: {
    color: '#bfa76a',
    fontSize: 16,
    fontFamily: 'LoraRegular',
  },
});

export default UpdateAppModal;
