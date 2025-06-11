# 🎯 Exemplu Simplu - Reclame Interstitiale

## 📋 Ce Avem Configurat

✅ **Doar reclame INTERSTITIALE** pentru:
- **iOS:** `ca-app-pub-9577714849380446/5660268593`
- **Android:** `ca-app-pub-9577714849380446/7080054250`

## 🚀 Cum să Folosești - 3 Pași Simpli

### Pasul 1: Importă Hook-urile
```tsx
import { useAds } from '../hooks/useAds';
import { useAdsContext } from '../context/AdsContext';
```

### Pasul 2: Folosește Hook-urile în Componentă
```tsx
const MyScreen = () => {
  const { adsConfig } = useAdsContext();
  const { showInterstitial } = useAds(adsConfig);
  
  // Restul componentei...
};
```

### Pasul 3: Afișează Reclama
```tsx
const handleButtonPress = async () => {
  // Afișează reclama interstitială
  await showInterstitial();
  
  // Apoi fă ce voiai să faci (navigare, etc.)
  navigation.navigate('NextScreen');
};
```

## 🎯 Exemplu Complet - Buton cu Reclamă

```tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAds } from '../hooks/useAds';
import { useAdsContext } from '../context/AdsContext';

const ButtonWithAd = ({ targetScreen, buttonText }) => {
  const navigation = useNavigation();
  const { adsConfig } = useAdsContext();
  const { showInterstitial } = useAds(adsConfig);
  
  const handlePress = async () => {
    try {
      // Afișează reclama ta REALĂ
      const adShown = await showInterstitial();
      console.log('Reclama afișată:', adShown);
    } catch (error) {
      console.log('Eroare la reclamă:', error);
    } finally {
      // Navighează oricum (chiar dacă reclama a eșuat)
      navigation.navigate(targetScreen);
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{buttonText}</Text>
    </TouchableOpacity>
  );
};

export default ButtonWithAd;
```

## 🎯 Exemplu pentru Card (cum ai în app)

Componenta `Card` este deja actualizată și va afișa reclame automat:

```tsx
// În TarotMainScreen sau oriunde folosești Card:
<Card 
  text="Tarot Reading" 
  screen="TarotScreen" 
  image={require('./assets/card-image.png')} 
/>
// GATA! Card-ul va afișa reclama când e apăsat
```

## 🔍 Cum să Verifici că Funcționează

1. **Build app-ul:**
```bash
eas build --platform android --profile preview
```

2. **Caută în logs:**
```
✅ Ads initialized successfully
✅ Interstitial ad loaded
✅ Card pressed - Ad shown: true
```

3. **Testează:** Apasă pe orice card și vei vedea reclama ta reală!

## 🎉 Asta e Tot!

**Nu mai trebuie să faci nimic altceva.** Sistem-ul este complet configurat și gata să afișeze reclamele tale reale pe ambele platforme!

**Reclamele vor apărea automat când utilizatorii ating cardurile în aplicația ta.** 🚀 