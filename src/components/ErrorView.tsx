import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import { Button, Card, Paragraph } from "react-native-paper";
import i18n from "../../i18n";
import { screenName } from "../utils/screenName";

export const ErrorView = () =>
{
  const navigation = useNavigation()

return (

<ImageBackground
source={require('../images/loginBG.png')}
resizeMode="cover"
style={{
  flex: 1,
  width: null,
  height: null,
  justifyContent:"center"
  // maxHeight: 905,
  // alignItems: 'flex-end',
}}>
      <Card style={{margin:20}} mode={"elevated"}>
      <Card.Title
          title={i18n.translate("errorOnOurSide")}
          // subtitle="Subtitle variant"
          titleVariant="headlineMedium"
          subtitleVariant="bodyLarge"
        />
        <Card.Content>
          <Paragraph variant="bodyMedium">
            {i18n.translate("errorOnOurSideMessage")}
          </Paragraph>
        </Card.Content>
      <Card.Actions>
        <Button onPress={() => {navigation.navigate(screenName.SettingsPage)}}>{i18n.translate("contact")}</Button>
        <Button onPress={() => {navigation.navigate(screenName.OnboardingScreen)}}>{i18n.translate("cancel")}</Button>
      </Card.Actions>
    </Card>
</ImageBackground>

);
}