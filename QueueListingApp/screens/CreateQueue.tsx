import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function CreateQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [queuename,setQueueName] = useState<string>('')

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
            <Text>Queue Name:</Text>
            <TextInput
                    placeholder="eg. `Line for SuperStore`"
                    onChangeText={setQueueName}
                    value={queuename}
                    style={styles.input}
            />
            <Text>Add Queue Image:</Text>
            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Add Image</Text>
            </Pressable>
           

            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Create Queue</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  },
  guestButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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