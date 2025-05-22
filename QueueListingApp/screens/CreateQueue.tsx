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
                        <TouchableOpacity style={styles.button} onPress={() => callImagePicker('gallery')}>
                            <Text>Pick From Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => callImagePicker('camera')}>
                            <Text>Take Picture</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: 'red', marginTop: 10, width: '40%', padding: 12, borderRadius: 8, marginVertical: 5, alignItems: 'center'}} onPress={() => setModal(false)}>
                            <Text style={{ color: 'white' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {image&&
                <Image source={{uri:image}} style={{ height: 200, width: 200,}}/>
            }
            <Text>Welcome User {username}!</Text>
            <Text>Queue Name:</Text>
            <TextInput
                    placeholder="eg. `Line for SuperStore`"
                    onChangeText={setQueueName}
                    value={queuename}
                    style={styles.input}
            />
            <Text>Add Queue Image:</Text>
            <TouchableOpacity style={styles.button} onPress={()=>setModal(true)}>
                <Text style={styles.buttonText}>Add Image</Text>
            </TouchableOpacity>
           

            <TouchableOpacity style={styles.button} onPress={createNewQueue}>
                <Text style={styles.buttonText}>Create Queue</Text>
            </TouchableOpacity>
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