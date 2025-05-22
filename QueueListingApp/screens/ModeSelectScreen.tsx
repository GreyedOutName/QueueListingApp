import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
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

return (
    <View style={styles.container}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />


        <Text style={styles.title}>Good day, {username}!</Text>

        <Pressable style={styles.button1} onPress={() => navigation.navigate('CreateQueue')}>
            <View style={styles.buttonContent}>
                <Image source={require('../assets/create.png')} style={styles.image} />
                <Text style={styles.buttonText}>Create Queue</Text>
            </View>
        </Pressable>

        <Pressable style={styles.button2} onPress={() => navigation.navigate('ManageQueue')}>
            <View style={styles.buttonContent}>
                <Image source={require('../assets/manage.png')} style={styles.image} />
                <Text style={styles.buttonText}>Manage Queues</Text>
            </View>
        </Pressable>

        <Pressable style={styles.button3} onPress={() => navigation.navigate('JoinQueue')}>
            <View style={styles.buttonContent}>
                <Image source={require('../assets/join.png')} style={styles.image} />
                <Text style={styles.buttonText}>Join a Queue</Text>
            </View>
        </Pressable>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  logo: {
    marginTop: -70,
    alignSelf: 'flex-start',
    resizeMode: 'contain',
    width: 60,
    height: 60,
    marginBottom: 90,
  },
  buttonContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  image: {
    resizeMode: 'contain',
    width: 100,
    height: 130,
  },
  title: {
    marginTop: -25,
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  button1: {
    backgroundColor: '#D46666',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    marginVertical: 10,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: .5,
    shadowRadius: .3,
    elevation: 5,
},

  button2: {
    backgroundColor: '#356A7D',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    marginVertical: 10,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: .5,
    shadowRadius: .3,
    elevation: 5,
  },
  button3: {
    backgroundColor: '#E9B25F',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    marginVertical: 10,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: .5,
    shadowRadius: .3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
  },
});