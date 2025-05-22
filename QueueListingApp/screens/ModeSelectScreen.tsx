import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function ModeSelect() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')

    const getUserInfo =async()=>{
        const {data:getId} = await supabase.auth.getSession()
        const user_id = getId.session?.user.id

        const {data:frompeople}= await supabase.from('people')
        .select('username')
        .eq('user_id',user_id)

        if(frompeople){
            setUserName(frompeople[0].username)
        }
        
        //const {data:picturedownload} = await supabase.storage.from('profilepictures').download
    }

    useEffect(()=>{
        getUserInfo()
    },[])

    const SignOut = () => {
      supabase.auth.signOut()
      navigation.navigate('Main')
    }

    return (
        <View style={styles.container}>
            <Text>Welcome User {username}!</Text>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('CreateQueue')}>
                <Text style={styles.buttonText}>Create Your Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ManageQueue')}>
                <Text style={styles.buttonText}>Manage Existing Queues</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('JoinQueue')}>
                <Text style={styles.buttonText}>Join A Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={SignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
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