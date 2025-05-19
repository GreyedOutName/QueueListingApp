import React, { useState } from 'react';
import { View, TextInput, Text, Image, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function LogInScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      Alert.alert('Login Failed', loginError.message);
    } else {
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('ModeSelect')
    }
};

  return (
    <View style={styles.container}>

      <Image source={require('../assets/icon.png')} style={styles.icon}/>

      <Text style={styles.welcometext}>Welcome back, User!</Text>
      <Text style={styles.text}>Good to see you again! Let's start your queue by logging in!</Text>

      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}

      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />
      <Button title="Log In" onPress={handleLogin} color='#4A4848'/>
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
    marginTop: -140,
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
  }
});
