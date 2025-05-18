import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import LoginScreen from './screens/LogInScreen';
import ModeSelect from './screens/ModeSelectScreen';
import CreateQueue from './screens/CreateQueue';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  SignIn: undefined;
  LogIn: undefined;
  ModeSelect: undefined;
  CreateQueue:undefined;
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={WelcomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="LogIn" component={LoginScreen} />
        <Stack.Screen name="ModeSelect" component={ModeSelect} />
        <Stack.Screen name="CreateQueue" component={CreateQueue} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
