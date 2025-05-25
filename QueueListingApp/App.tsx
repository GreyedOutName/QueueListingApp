import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import LoginScreen from './screens/LogInScreen';
import ModeSelect from './screens/ModeSelectScreen';
import CreateQueue from './screens/CreateQueue';
import JoinQueue from './screens/JoinQueue';
import ManageQueue from './screens/ManageQueue';
import ScanScreen from './screens/ScanScreen';
import GenerateQRScreen from './screens/GenerateQRScreen';
import GuestScreen from './screens/GuestScreen';
import { NotificationProvider } from './lib/notificationContext';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Main:undefined,
  SignIn: undefined;
  LogIn: undefined;
  ModeSelect: { username?: string }; 
  CreateQueue:undefined;
  JoinQueue:undefined;
  ManageQueue:undefined;
  ScanScreen:undefined;
  GenerateQR: { queueId: string }; 
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Main" component={WelcomeScreen} options={{headerShown:false}}/>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="LogIn" component={LoginScreen} />
          <Stack.Screen name="ModeSelect" component={ModeSelect} options={{headerShown:false}}/>
          <Stack.Screen name="CreateQueue" component={CreateQueue} />
          <Stack.Screen name="JoinQueue" component={JoinQueue} />
          <Stack.Screen name="ManageQueue" component={ManageQueue} />
          <Stack.Screen name="ScanScreen" component={ScanScreen} options={{headerShown:false}}/>
          <Stack.Screen name="Guest" component={GuestScreen} />
          <Stack.Screen name="GenerateQR" component={GenerateQRScreen} options={{headerShown:false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </NotificationProvider>
  );
}