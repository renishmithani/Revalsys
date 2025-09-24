import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Screens/Private/HomeScreen';
import LoginScreen from '../Screens/Public/LoginScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../Screens/Private/DashboardScreen';
import ReminderScreen from '../Screens/Private/ReminderScreen';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import LoadingScreen from '../Screens/Public/LoadingScreen';
import { Text } from 'react-native';
import { navigationRef } from './NavigationService';
import CameraScreen from '../Screens/CameraScreen';

const Tab = createBottomTabNavigator();
const Main = createStackNavigator();

export default function RootNavigation() {
  const TabStack = () => {
    return (
      <Tab.Navigator screenOptions={{}}>
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>🧰</Text>,
          }}
        />
        <Tab.Screen
          name="ReminderScreen"
          component={ReminderScreen}
          options={{
            title: 'Reminder',
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>⏰</Text>,
          }}
        />
      </Tab.Navigator>
    );
  };

  const MainStack = () => {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);

    function handleAuthStateChanged(currentUser: any) {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    }

    useEffect(() => {
      const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
      return subscriber;
    }, []);

    if (initializing) {
      return <LoadingScreen />;
    }

    return (
      <Main.Navigator screenOptions={{ headerShown: false }}>
        {/* {user ? (
          <Main.Screen name="Home" component={TabStack} />
        ) : (
          <>
            <Main.Screen name="LoginScreen" component={LoginScreen} />
          </>
        )} */}
        <Main.Screen name="CameraScreen" component={CameraScreen} />
      </Main.Navigator>
    );
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <MainStack />
    </NavigationContainer>
  );
}
