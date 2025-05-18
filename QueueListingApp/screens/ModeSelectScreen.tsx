import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function ModeSelect() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')

    const getUserInfo =async()=>{
        const {data:getId} = await supabase.auth.getSession()
        const user_id = getId.session?.user.id

        const {data}= await supabase.from('people')
        .select('username')
        .eq('user_id',user_id)

        setUserName(data[0].username)
    }

    useEffect(()=>{
        getUserInfo()
    },[])

    return (
        <View style={styles.container}>
            <Text>Welcome User {username}!</Text>
            <Pressable style={styles.button} onPress={()=>navigation.navigate('CreateQueue')}>
                <Text style={styles.buttonText}>Create Your Queue</Text>
            </Pressable>

            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Join A Queue</Text>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  guestButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
