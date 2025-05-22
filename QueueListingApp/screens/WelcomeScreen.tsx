import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleLogIn = () => {
    navigation.navigate('LogIn');
  };

  const handleGuest = () => {
    console.log('Continue as Guest Pressed');
    // You can also navigate to a Home screen or set session
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Banner.png')} style={styles.imageBanner} />
      <Text style={styles.text}>Ready to join the queue?</Text>

      <Pressable style={styles.button} onPress={handleLogIn}>
        <Text style={styles.buttonText}>Log in</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign up</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.guestButton]} onPress={handleGuest}>
        <Text style={styles.buttonText}>Continue as Guest</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#CF5050',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  guestButton: {
    backgroundColor: '#4A4848',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageBanner: {
    width: 300,
    height: 155,
    marginTop: -120,
    marginBottom: 60,
    resizeMode: 'contain',
  },
});