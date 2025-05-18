import React, { useState } from 'react';
import { View, TextInput, Text, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function LogInScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('ModeSelect');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome back, User!</Text>

      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Log In" color="#CF5050" onPress={handleLogin} />
      </View>
    </View> 
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    textAlign: 'center',
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 100,
    marginTop: -40,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 5,
    overflow: 'hidden',
  },
});