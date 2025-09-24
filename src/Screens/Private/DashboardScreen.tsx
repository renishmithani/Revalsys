import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { navigate } from '../../Navigation/NavigationService';

const navigateButtonData = [
  { title: '⏰ Your Reminders', navigateTo: 'ReminderScreen' },
];

export default function DashboardScreen() {
  return (
    <View
      style={{ flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 15 }}
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
              marginTop: 20,
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
  );
}
