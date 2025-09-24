import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigate } from '../../Navigation/NavigationService';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const navigateButtonData = [
  { title: '🧰 Explore Dashboard', navigateTo: 'DashboardScreen' },
  { title: '⏰ Your Reminders', navigateTo: 'ReminderScreen' },
];

const Header = ({ userDetails }: any) => {
  const logout = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again.');
    }
  };

  return (
    <View
      style={{
        height: 50,
        paddingHorizontal: 15,
        borderBottomWidth: 0.3,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700' }}>
        👋 Welcome, {userDetails?.displayName}
      </Text>
      <Text onPress={logout} style={{ fontSize: 12, fontWeight: '700' }}>
        Logout
      </Text>
    </View>
  );
};

export default function HomeScreen() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  function handleAuthStateChanged(currentUser: any) {
    setUser(currentUser);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <Header userDetails={user} />
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Image
          source={{ uri: user?.photoURL }}
          style={{ height: 100, width: 100, borderRadius: 200 }}
        />
        <Text
          style={{
            fontSize: 24,
            color: '#000000',
            fontWeight: '800',
            marginTop: 10,
          }}
        >
          {user?.displayName}
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: '#000000',
            fontWeight: '700',
            marginTop: 10,
          }}
        >
          {user?.email}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 15,
          alignItems: 'center',
          flex: 1,
          gap: 20,
          marginTop: 20,
        }}
      >
        {navigateButtonData?.map(value => {
          return (
            <TouchableOpacity
              onPress={() => navigate(value.navigateTo)}
              style={{
                width: '100%',
                alignItems: 'center',
                height: 100,
                backgroundColor: 'skyblue',
                borderRadius: 8,
                justifyContent: 'center',
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#000000',
                }}
              >
                {value.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
