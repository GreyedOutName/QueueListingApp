import React, { useState } from 'react';
import { View, TextInput, Text, Image, Pressable, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';
import { registerForPushNotificationsAsync } from '../lib/registerForPushNotificiations';

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
      
      const expo_token = await registerForPushNotificationsAsync()
      const user_id = (await supabase.auth.getSession()).data.session?.user.id;
      const {error} = await supabase.from('people')
      .update({
        expo_push_token:expo_token
      })
      .eq('user_id',user_id)
      
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
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={[styles.button, styles.login]}>Log in</Text>
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
