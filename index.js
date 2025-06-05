// import {AppRegistry, Platform} from 'react-native';

// import App from './App';

// AppRegistry.registerComponent('main', () => App);

// if (Platform.OS === 'web') {
//   const rootTag =
//     document.getElementById('root') || document.getElementById('main');
//   AppRegistry.runApplication('main', {rootTag});
// }

import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://DSN-ul-tau@sentry.io/NUMAR_PROIECT', // Înlocuiește cu DSN-ul tău Sentry
  debug: true, // true pentru development, false pentru producție
});

import {registerRootComponent} from 'expo';
import App from './App';

registerRootComponent(Sentry.wrap(App));
