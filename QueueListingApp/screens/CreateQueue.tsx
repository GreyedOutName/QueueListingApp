import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput , Alert , Image, Modal, TouchableOpacity} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

import { supabase } from '../lib/supabase';

import { decode } from 'base64-arraybuffer'
import * as ImagePicker from 'expo-image-picker';
import {randomUUID} from 'expo-crypto'

export default function CreateQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [queuename,setQueueName] = useState<string>('')

    const [hasGalleryPermission, setHasGalleryPermission] = useState <boolean | null> (null);
    const [modalVisible,setModal]=useState<boolean>(false);
    const [image, setImage] = useState <string | null> (); // Value of selected image
    const [imageBase64,setImageBase64] = useState<string|null>();

    const getUserInfo =async()=>{
        const {data:getId} = await supabase.auth.getSession()
        const user_id = getId.session?.user.id

        const {data}= await supabase.from('people')
        .select('username')
        .eq('user_id',user_id)

        if(data){
            setUserName(data[0].username)
        }
    }

    const callImagePicker = async(source:string)=>{
        try {
            const options: any = {
                base64:true,
                allowsEditing: true,
                aspect: [1, 1], 
                quality: 1,
            };
            const result = source === 'gallery'
                ? await ImagePicker.launchImageLibraryAsync(options)
                : await ImagePicker.launchCameraAsync(options);

                if (result.assets && result.assets.length > 0) {
                    const imageUri = result.assets[0].uri;
                    setImage(imageUri);
                    setImageBase64(result.assets[0].base64)
                }
        } 
        catch (error) {
            console.error(`Error picking image from ${source}:`, error);
        }
        setModal(false)
    }

    const createNewQueue= async()=>{
        const filename = randomUUID()+'.png'
        const userID = (await supabase.auth.getSession()).data.session?.user.id
        const queue_id = randomUUID()
        try{
            //upload image to supabase storage
            const { data:picturedata, error:pictureError } = await supabase
            .storage
            .from('queuepictures')
            .upload(filename, decode(imageBase64!), {
                contentType: 'image/png'
            })
            if (pictureError){
                console.log(pictureError)
            }
            const databaseUri = picturedata?.path

            //create row in queues table
            const { error:tableError } = await supabase
            .from('queues')
            .insert({
                owner_id:userID,
                queue_id:queue_id,
                queue_name:queuename,
                image_uri:databaseUri
            })
            if (tableError){
                console.log(tableError)
            }
        }
        finally{
            Alert.alert('Queue Created!')
            navigation.navigate('ManageQueue')
        }
    }

    useEffect(()=>{
        getUserInfo()
    },[]);

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

    return (
        <View style={styles.container}>
            <Modal
                visible={modalVisible}
                onRequestClose={() => {
                setModal(false);
                }}
                transparent={true}
                animationType="fade"
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                    <View style={{
                        width: 300,
                        padding: 20,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        alignItems: 'center',
                        }}>
                        <Pressable style={styles.button1} onPress={() => callImagePicker('gallery')}>
                            <Text style={{color: 'white', fontWeight: '400'}}>Pick From Gallery</Text>
                        </Pressable>
                        <Pressable style={styles.button1} onPress={() => callImagePicker('camera')}>
                            <Text style={{color: 'white', fontWeight: '400'}}>Take Picture</Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={() => setModal(false)}>
                            <Text style={{ color: 'white'}}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Text style={styles.title}>Create a New Queue</Text>

            {image&&
                <Image source={{uri:image}} style={{ height: 230, width: 230, alignSelf:'center', marginBottom: 30}}/>
            }
            <Text>Queue Label:</Text>
            <TextInput
                    placeholder="eg. `Line for SuperStore`"
                    onChangeText={setQueueName}
                    value={queuename}
                    style={styles.input}
            />
            <Text>Add Queue Image:</Text>
            <Pressable style={[styles.button1]} onPress={()=>setModal(true)}>
                <Text style={styles.buttonText}>Add Image</Text>
            </Pressable>
           

            <Pressable style={styles.button2} onPress={createNewQueue}>
                <Text style={styles.buttonText}>Create Queue</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    marginTop: -150,
  },
  button1: {
    backgroundColor: '#CF5050',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    color: '#fff',
    alignItems: 'center',
  },
  button2: {
    backgroundColor: '#4A4848',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4A4848',
    padding: 12,
    borderRadius: 8,
    marginTop: 7,
    width: '30%',
    alignItems: 'center',
  },
  guestButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
});