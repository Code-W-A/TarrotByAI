import { ImageBackground } from 'react-native';

return (
  <MainContainer>
    <ImageBackground
      source={require('../../../../assets/dashboardbg.jpg')}
      style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      imageStyle={{ opacity: 1 }}
    >
      {/* Restul conținutului existent al ecranului */}
      {/* Înlocuiește cu conținutul real din tarotsettings */}
    </ImageBackground>
  </MainContainer>
); 