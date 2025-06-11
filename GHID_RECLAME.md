# Ghid de Utilizare - Sistem Centralizat de Reclame

## 📋 Prezentare Generală

Sistemul de reclame a fost creat pentru a fi **simplu de folosit și centralizat**. Nu mai trebuie să scrii cod complex pentru reclame în fiecare screen - totul este gestionat automat!

## 🚀 Cum să Folosești Reclamele

### ⭐ Interstitial Ads - PRINCIPALA FUNCȚIONALITATE

**Momentan folosim DOAR reclame interstitiale.** Este foarte simplu:

Folosește hook-ul personalizat pentru a afișa reclame interstitiale:

```tsx
import { useAds } from '../hooks/useAds';
import { useAdsContext } from '../context/AdsContext';

const Screen = () => {
  const { adsConfig } = useAdsContext();
  const { showInterstitial, isInterstitialLoaded } = useAds(adsConfig);
  
  const navigateWithAd = async () => {
    const adShown = await showInterstitial();
    if (adShown) {
      console.log('Reclama a fost afișată!');
    }
    // Navigează oricum
    navigation.navigate('NextScreen');
  };
  
  return (
    <TouchableOpacity onPress={navigateWithAd}>
      <Text>Mergi la următorul screen</Text>
    </TouchableOpacity>
  );
};
```

### 🔮 Viitor: Banner și Rewarded Ads

**Banner Ads și Rewarded Ads sunt pregătite în cod, dar momentan nu le folosim:**

```tsx
// CÂND VEI AVEA BANNER ADS:
import { AdBanner } from '../components/AdBanner/AdBanner';
<AdBanner /> // Decomentează în AdBanner.tsx

// CÂND VEI AVEA REWARDED ADS:
const { showRewarded } = useAds(adsConfig);
const adShown = await showRewarded();
```

## 🔧 Configurare pentru Producție

### 1. ✅ ID-urile de Reclame CONFIGURATE

ID-urile reale sunt deja configurate în `src/utils/adsUtils.ts`:

```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716', // Test ID (nu avem banner încă)
    interstitial: 'ca-app-pub-9577714849380446/5660268593', // ✅ REAL iOS Interstitial
    rewarded: 'ca-app-pub-3940256099942544/1712485313', // Test ID (nu avem rewarded încă)
  },
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111', // Test ID (nu avem banner încă)
    interstitial: 'ca-app-pub-9577714849380446/7080054250', // ✅ REAL Android Interstitial
    rewarded: 'ca-app-pub-3940256099942544/5224354917', // Test ID (nu avem rewarded încă)
  },
};
```

**Status:** ✅ **Reclame Interstitiale configurate pentru ambele platforme**

### 2. ✅ app.json CONFIGURAT

Configurația Google Mobile Ads este deja setată în `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-9577714849380446~4870228858", // ✅ REAL Android App ID
          "iosAppId": "ca-app-pub-9577714849380446~1181241188" // ✅ REAL iOS App ID
        }
      ]
    ]
  }
}
```

**Status:** ✅ **App ID-urile reale sunt configurate pentru ambele platforme**

## ✨ Avantajele Acestui Sistem

### ✅ Pentru Dezvoltatori:
- **0 linii de cod complex** - tot este gestionat automat
- **Hook-uri simple** - `useAds()` îți dă tot ce ai nevoie  
- **Context global** - configurația este disponibilă peste tot
- **Type-safe** - totul este scris în TypeScript
- **Error handling** - erorile sunt gestionate automat

### ✅ Pentru Utilizatori:
- **Privacy-first** - respectă permisiunile ATT pe iOS
- **Performance optimizat** - reclamele se preîncarcă
- **Non-intrusive** - nu afectează UX-ul când sunt dezactivate

## 🎯 Exemple Practice

### Exemplu 1: Card cu Reclame
```tsx
const CardWithAd = () => {
  const { adsConfig } = useAdsContext();
  const { showInterstitial } = useAds(adsConfig);
  
  const handleCardPress = async () => {
    await showInterstitial(); // Afișează reclama
    navigateToDetails(); // Apoi navighează
  };
  
  return (
    <View>
      <Card onPress={handleCardPress} />
      <AdBanner /> {/* Banner în partea de jos */}
    </View>
  );
};
```

### Exemplu 2: Screen cu Banner Footer
```tsx
const MyScreen = () => {
  const { adsConfig } = useAdsContext();
  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Conținutul tău */}
      </ScrollView>
      
      {/* Banner fix în partea de jos */}
      <AdBanner 
        style={{ position: 'absolute', bottom: 0 }}
        adsConfig={adsConfig}
      />
    </View>
  );
};
```

## 🔍 Debugging și Monitorizare

Toate reclamele au logging automat în consolă:

```
✅ Ads initialized successfully: { isPersonalized: true, canShowAds: true }
✅ Interstitial ad loaded
✅ Banner ad loaded
❌ Interstitial ad error: [error details]
```

## 🚨 Importante de Reținut

1. **În development** - se folosesc ID-uri test automat
2. **Privacy compliance** - respectă GDPR și ATT 
3. **Fallback graceful** - dacă reclamele nu funcționează, app-ul merge normal
4. **Performance** - reclamele nu afectează loading-ul app-ului

## 🛠️ Build și Deploy

După ce ai configurat totul:

```bash
# Build pentru Android
eas build --platform android --profile preview

# Build pentru iOS  
eas build --platform ios --profile preview
```

Sistemul este **complet funcțional** și gata de producție! 🎉 