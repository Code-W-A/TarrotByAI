import WebViewConsultatiiScreen from '../pages/doctors/WebViewConsultatiiScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WebViewConsultatiiScreen" component={WebViewConsultatiiScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator; 