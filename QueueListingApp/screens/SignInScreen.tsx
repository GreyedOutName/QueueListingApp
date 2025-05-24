import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, Image, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      Alert.alert('Error signing in', signInError.message);
      return;
    }

    const user = signInData?.user;

    if (user) {
      const { error: insertError } = await supabase.from('people').insert([
        {
          user_id: user.id,
          username: username,
        },
      ]);

      if (insertError) {
        Alert.alert('Account created, but failed to save username', insertError.message);
      } else {
        Alert.alert('Success', 'Account and username created! Please check your email to confirm your account.');
      }
    } else {
      Alert.alert('Account created', 'Please check your email to confirm your account.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.icon} />
      
      <Text style={styles.welcometext}>Welcome to QueueLit!</Text>
      <Text style={styles.text}>Take a step ahead create your account on Queuelit!</Text>

      <TextInput
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
        autoCapitalize="none"
      />
      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={[styles.button, styles.login]}>Sign up</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 15,
    fontSize: 16,
  },
    button:{
    backgroundColor: '#4A4848',
    padding: 5,
    borderRadius: 12,
    marginTop: -1,
  },
  login:{
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '400',
  }
});
