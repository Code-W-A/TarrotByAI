import * as React from 'react';
import { Modal, Portal, Provider, TextInput, DefaultTheme  } from 'react-native-paper';
import { View, StyleSheet, Text, TouchableOpacity, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import GradientButton from '../GradientButton';
import CancelRattingBtn from '../CancelRattingBtn';
import { handleUploadFirestore, handleUploadRating } from '../../utils/firestoreUtils';
import i18n from '../../../i18n';

const theme = {
  ...DefaultTheme,
  // Aici poți personaliza alte aspecte ale temei, dacă este necesar
  colors: {
    ...DefaultTheme.colors,
    // Personalizează culorile specificând culori pentru modul luminos
    // De exemplu:
    background: 'white',
    text: 'black',
    // Adaugă sau ajustează alte culori conform nevoilor tale
  },
};

export default function RattingDialog({ setVisible, visible }) {
  const [rating, setRating] = React.useState(0);
  const [hasRated, setHasRated] = React.useState(false);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    const checkRating = async () => {
      const userRating = await AsyncStorage.getItem('userRating');
      if (userRating !== null) {
        setHasRated(true);
      }
    };
    checkRating();
  }, []);

  const onRate = (rate) => {
    setRating(rate);
 
  };
  const onSubmit = async () => {
        console.log(rating)
    await AsyncStorage.setItem('userRating', JSON.stringify(rating));
    const rate = {rating, text}
    handleUploadRating(rate, "Ratings");
    setHasRated(true);
    setVisible(!visible);
    let url = "https://play.google.com/store/apps/details?id=com.cristina.zurba.tarot&hl=en&gl=US"
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => onRate(i)} style={{ marginHorizontal: 2 }}>
          <AntDesign
            name={i <= rating ? "star" : "staro"}
            size={35}
            color={i <= rating ? "yellow" : "grey"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  // Nu afișați modalul dacă utilizatorul a evaluat deja
  if (hasRated) {
    return null;
  }

  return (
    <Provider theme={theme}>
      <View style={styles.container}>
        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../../assets/starRatting.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.translate("rateApp")}</Text>
              <Text style={styles.subTitle}>{i18n.translate("descriereRate")}</Text>
              <View style={styles.starsContainer}>{renderStars()}</View>
                    {rating <= 3 && rating > 0 && (
  <>
    <Text style={styles.feedbackTitle}>{i18n.translate("feedbackPrompt")}</Text>
    <TextInput
      mode="outlined"
      placeholder="Your feedback"
      multiline
      numberOfLines={4}
      style={styles.feedbackInput}
      onChangeText={(text) => setText(text)} // Adaugă această linie
      value={text} // Și această linie pentru a controla valoarea inputului
    />
  </>
)}
            </View>
      
            <View style={styles.actionContainer}>
              <CancelRattingBtn label={"Cancel"} onPress={() => setVisible(false)} />
              <GradientButton hasRated={rating > 0} label={rating > 0 ? "Submit" : "Rate to submit"} onPress={() => onSubmit()} />
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  feedbackTitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 20,
  },
  feedbackInput: {
    backgroundColor: 'white',
    marginVertical: 10,
    width: '90%', // Ajustează conform design-ului tău
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 70,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginVertical: 10,
  },
  subTitle: {
    fontSize: 15,
    color: '#D3D3D3',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    display: 'flex',
  },
  modal: {
    backgroundColor: "rgba(40, 49, 64, 0.9)",
    paddingVertical: 20,
    margin: 20,
    borderWidth: 2,
    borderColor: colors.purpleBlue,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
