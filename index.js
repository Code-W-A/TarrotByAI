// import {AppRegistry, Platform} from 'react-native';

// import App from './App';

// AppRegistry.registerComponent('main', () => App);

// if (Platform.OS === 'web') {
//   const rootTag =
//     document.getElementById('root') || document.getElementById('main');
//   AppRegistry.runApplication('main', {rootTag});
// }

import {registerRootComponent} from 'expo';
import App from './App';

// Sentry disabled for now - uncomment and configure with real DSN when needed
// import * as Sentry from '@sentry/react-native';
// Sentry.init({
//   dsn: 'YOUR_REAL_SENTRY_DSN_HERE',
//   debug: __DEV__,
// });

registerRootComponent(App);
