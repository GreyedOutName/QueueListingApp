import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
        navigation.navigate('ModeSelect', { username});
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
      <Text style={styles.title}>Enter as Guest</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 30,
    color: '#1f2937',
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
  button: {
    backgroundColor: '#CF5050',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
