
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Hotel, Compass, Heart, User, MapPin } from 'lucide-react-native';
import { HomeScreen } from './screens/HomeScreen';
import { VibeMatchScreen } from './screens/VibeMatchScreen';
import { HotelDetailScreen } from './screens/HotelDetailScreen';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const prefix = Linking.createURL('/');

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainHome" component={HomeScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Home: 'home',
        VibeMatch: 'vibe-match',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Hotel color={color} size={size} />;
            if (route.name === 'VibeMatch') return <Compass color={color} size={size} />;
            if (route.name === 'Tours') return <MapPin color={color} size={size} />;
            return <User color={color} size={size} />;
          },
          tabBarActiveTintColor: '#1E90FF',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#1E90FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '900' },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Tripzy Stays' }} />
        <Tab.Screen name="VibeMatch" component={VibeMatchScreen} options={{ title: 'Vibe Match™' }} />
        <Tab.Screen name="Profile" component={HomeScreen} options={{ title: 'My Tripzy' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
