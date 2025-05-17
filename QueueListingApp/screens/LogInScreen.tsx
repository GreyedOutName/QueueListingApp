import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LogInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('user_id')
    .eq('username', username)
    .single();

  if (personError || !person || !person.user_id) {
    Alert.alert('Login Failed', 'Username not found');
    return;
  }

  const { data: user, error: userError } = await supabase
    .rpc('get_user_email', { uid: person.user_id });

  if (userError || !user || !user.email) {
    Alert.alert('Login Failed', 'User email not found');
    return;
  }

  const email = user.email;

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    Alert.alert('Login Failed', loginError.message);
  } else {
    Alert.alert('Success', 'Logged in successfully!');
    // Navigate to your app's home screen here
  }
};

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        style={styles.input}

      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />
      <Button title="Log In" onPress={handleLogin} />
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
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
});
