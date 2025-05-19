import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';

export default function JoinQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [image,setImage] = useState <string | null> ();
    

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

    return (
        <View style={styles.container}>

            <TouchableOpacity style={styles.missingImage}>
              <Text>Add Your User Image</Text>
            </TouchableOpacity>
            <Text>Welcome User {username}!</Text>
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('ScanScreen')}>
                <Text style={styles.buttonText}>Scan to Join!</Text>
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
  missingImage:{
    borderWidth: 2,
    borderColor: '#000',
    width:250,
    height:250,
    borderRadius: 0,
    alignItems:'center',
    justifyContent:'center'
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