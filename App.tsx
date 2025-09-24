import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNBootSplash from 'react-native-bootsplash';
import RootNavigation from './src/Navigation/RootNavigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '789472873623-top50ervv4fcci06mjpmq8gl1ng46c8s.apps.googleusercontent.com', // from Firebase console
});

function App() {
  useEffect(() => {
    RNBootSplash.hide({ fade: true }); // only once
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      <RootNavigation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
