import React, { useRef, useState } from 'react';
import { TouchableOpacity, View, Alert, Modal, Text, StyleSheet, Pressable, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

const getShareText = (language) => {
  if (language === 'ro') {
    return `Descarcă aplicația Cristina Zurba Tarot:\nAndroid: https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro\niOS: https://apps.apple.com/ro/app/cristina-zurba-tarot/id6475713937`;
  }
  return `Download the Cristina Zurba Tarot app:\nAndroid: https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=ro\niOS: https://apps.apple.com/ro/app/cristina-zurba-tarot/id6475713937`;
};

const getToastText = (language) => {
  if (language === 'ro') {
    return 'Textul cu linkul a fost trimis!';
  }
  return 'The text with the link has been shared!';
};

const getDialogTexts = (language) => {
  if (language === 'ro') {
    return {
      title: 'Ce vrei să distribui?',
      shareImage: 'Trimite imaginea',
      shareApp: 'Trimite linkul aplicației',
      cancel: 'Anulează',
    };
  }
  return {
    title: 'What do you want to share?',
    shareImage: 'Share image',
    shareApp: 'Share app link',
    cancel: 'Cancel',
  };
};

const ShareScreenshot = ({ children, fabPosition }) => {
  const viewShotRef = useRef();
  const [showFab, setShowFab] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { language } = useLanguage();
  const dialogTexts = getDialogTexts(language);

  const handleShareImage = async () => {
    setShowDialog(false);
    try {
      setShowFab(false);
      await new Promise((resolve) => setTimeout(resolve, 200));
      const uri = await viewShotRef.current.capture();
      setShowFab(true);
      const shareText = getShareText(language);
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: dialogTexts.shareImage,
        UTI: 'public.png',
        message: shareText,
      });
      Alert.alert(getToastText(language));
    } catch (e) {
      setShowFab(true);
      alert('Nu s-a putut distribui imaginea.');
    }
  };

  const handleShareApp = async () => {
    setShowDialog(false);
    try {
      const shareText = getShareText(language);
      await Share.share({ message: shareText });
      Alert.alert(getToastText(language));
    } catch (e) {
      alert('Nu s-a putut distribui textul.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={{ flex: 1 }}>
        {children}
      </ViewShot>
      {showFab && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            ...(fabPosition || { bottom: 120, right: 24 }),
            backgroundColor: '#FFD700',
            borderRadius: 28,
            width: 56,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#FFD700',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            zIndex: 99,
          }}
          onPress={() => setShowDialog(true)}
        >
          <MaterialCommunityIcons name="share-variant" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>{dialogTexts.title}</Text>
            <Pressable style={styles.dialogButton} onPress={handleShareImage}>
              <Text style={styles.dialogButtonText}>{dialogTexts.shareImage}</Text>
            </Pressable>
            <Pressable style={styles.dialogButton} onPress={handleShareApp}>
              <Text style={styles.dialogButtonText}>{dialogTexts.shareApp}</Text>
            </Pressable>
            <Pressable style={styles.dialogCancel} onPress={() => setShowDialog(false)}>
              <Text style={styles.dialogCancelText}>{dialogTexts.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 280,
    alignItems: 'center',
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#131523',
    textAlign: 'center',
  },
  dialogButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  dialogButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogCancel: {
    marginTop: 10,
    padding: 8,
  },
  dialogCancelText: {
    color: '#131523',
    fontSize: 15,
  },
});

export default ShareScreenshot; 