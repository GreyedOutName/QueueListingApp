import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { insertGuest } from '../lib/guestService';
import { useNavigation } from '@react-navigation/native';


export default function GuestScreen() {
  const [username, setUsername] = useState('');
  const navigation = useNavigation();
  const handleSubmit = async () => {
    if (username.trim() === '') {
      Alert.alert('Username Required', 'Please enter a username to continue.');
      return;
    }
    try {
      const id = await insertGuest(username);
      if (id) {
        navigation.navigate('ModeSelect', {username});
      } else {
        Alert.alert("Error", "Could not proceed as guest.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not proceed as guest.");
    }
    // Optionally, navigate or store username here
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.icon} />

      <Text style={styles.welcometext}>Log in temporarily.</Text>

      <Text style={styles.text}>Don't need an account? Continue as guest.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
    icon:{
    height: 100,
    width: 100,
    marginTop: -200,
    marginBottom: 30,
    alignSelf: 'center',
    resizeMode: 'contain'
  },
    welcometext: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 50,
    paddingBottom: 10,
    color: '#C83E3E',
    textAlign: 'center',
  },
    text: {
    fontSize: 22,
    paddingBottom: 65,
    fontWeight: '500',
    fontFamily: 'Roboto',
    textAlign: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
    button:{
    backgroundColor: '#4A4848',
    padding: 5,
    borderRadius: 12,
    marginTop: -4,
    width: '100%',

  },
  buttonText:{
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '400',
    padding: 3,
  }
});
