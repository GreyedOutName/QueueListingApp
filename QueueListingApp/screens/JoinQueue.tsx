import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image , Alert} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';
import { decode } from 'base64-arraybuffer'
import * as ImagePicker from 'expo-image-picker';
import {randomUUID} from 'expo-crypto'


export default function JoinQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [image,setImage] = useState <string|null> ();
    const [imageBase64,setImageBase64] = useState<string|null>();
    const [hasGalleryPermission, setHasGalleryPermission] = useState <boolean | null> (null);
    
    useEffect(() => {
        (async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
              Alert.alert(
              'Permission Required',
              'Please grant permission to access your media library to use this feature.',
              [{ text: 'OK' }]
              );
          } else {
            setHasGalleryPermission(true);
          }
        })();
      }, []);

    const getUserInfo =async()=>{
        const {data:getId} = await supabase.auth.getSession()
        const user_id = getId.session?.user.id

        const {data:frompeople}= await supabase.from('people')
        .select()
        .eq('user_id',user_id)

        if(frompeople){
            setUserName(frompeople[0].username)
            const {data:picturedownload,error:pictureError} = await supabase.storage.from('profilepictures').download(frompeople[0].image_uri)
            if(picturedownload){
              const fr = new FileReader()
              fr.readAsDataURL(picturedownload)
              fr.onload = () =>{
                setImage(fr.result as string)
              }
            }
            if(pictureError){
              console.log(pictureError)
            }
        }
    }

    const callImagePicker = async()=>{
      try {
        const options: any = {
          base64:true,
          allowsEditing: true,
          aspect: [1, 1], 
          quality: 1,
        };

        const result = await ImagePicker.launchCameraAsync(options);
        if (result.assets && result.assets.length > 0) {
            const filename = randomUUID()+'.png'
            const userID = (await supabase.auth.getSession()).data.session?.user.id
            let databaseUri;
            setImageBase64(result.assets[0].base64)
            try{
              //upload image to supabase storage
              const { data:picturedata, error:pictureError } = await supabase
              .storage
              .from('profilepictures')
              .upload(filename, decode(result.assets[0].base64!), {
                contentType: 'image/png'
              })
              if(picturedata){
                databaseUri = picturedata.path
              }
              if (pictureError){
                console.log(pictureError)
              }
              
              //create row in queues table
              const { error:tableError } = await supabase
              .from('people')
              .update({
                image_uri:databaseUri
              })
              .eq('user_id',userID)
              if (tableError){
                console.log(tableError)
                }
            }
            catch(e){
              console.log(e)
            }
        }
      } 
      catch (error) {
        console.error(`Error when picking image: `, error);
      }
    }

    const replaceImage = async()=>{
      const userID = (await supabase.auth.getSession()).data.session?.user.id
      const {data,error} = await supabase.from('people')
      .select('image_uri')
      .eq('user_id',userID)
      try{
        if(data){
          const {error} = await supabase.storage.from('profilepictures').remove([data[0].image_uri])
          if(error){
            console.log(error)
          }
        }
      }finally{
        await callImagePicker()
      }
    }

    useEffect(()=>{
      getUserInfo()
    },[])

    return (
        <View style={styles.container}>
            {image? 
              <TouchableOpacity onLongPress={replaceImage}>
                <Image source={{uri:image}} style={{ width: 250, height: 250, borderRadius: 75 }}/>
              </TouchableOpacity>
            :
              <TouchableOpacity style={styles.missingImage} onPress={callImagePicker}>
                <Text>Add Your User Image</Text>
              </TouchableOpacity>
            }
            
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