import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import ContactScreen from './screens/ContactScreen';
import PredictionScreen from './screens/AcademicScreen';
import StressScreen from './screens/StressScreen';
import PlaylistPredictionScreen from './screens/MusicScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content
const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Avatar.Icon size={80} icon="account-circle" style={styles.avatar} />
        <Text variant="titleLarge" style={styles.username}>Welcome!</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

// Drawer Navigator with Icons
const DrawerNavigator = () => (
  <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
    <Drawer.Screen
      name="Home"
      component={HomeScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="home-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="account-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Performance"
      component={PerformanceScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="chart-bar" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="cog-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Help"
      component={HelpScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="help-circle-outline" size={size} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Contact Us"
      component={ContactScreen}
      options={{
        drawerIcon: ({ color, size }) => <Icon name="phone-outline" size={size} color={color} />,
      }}
    />
  </Drawer.Navigator>
);

// Stack Navigator for Authentication
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen 
          name="Academic" 
          component={PredictionScreen} 
          options={{ headerShown: true, title: "Academic Prediction" }} 
        />
        <Stack.Screen 
          name="Stress" 
          component={StressScreen} 
          options={{ headerShown: true, title: "Stress Level Prediction" }} 
        />
        <Stack.Screen 
          name="Music" 
          component={PlaylistPredictionScreen} 
          options={{ headerShown: true, title: "Music Playlist Prediction" }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  drawerHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    backgroundColor: 'white',
  },
  username: {
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
  },
});