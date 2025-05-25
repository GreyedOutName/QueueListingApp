import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { randomUUID } from 'expo-crypto';

type JoinQueueRouteProp = RouteProp<RootStackParamList, 'JoinQueue'>;

export default function JoinQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute<JoinQueueRouteProp>();

    // Guest username passed from GuestScreen if guest
    const guestUsername = route.params?.guestUsername;

    const [username, setUserName] = useState<string | null>(guestUsername || null);
    const [image, setImage] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
    const [isGuest, setIsGuest] = useState<boolean>(!!guestUsername);

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

    useEffect(() => {
        if (!guestUsername) {
            // Only fetch user info if NOT a guest (i.e., logged-in user)
            getUserInfo();
            setIsGuest(false);
        }
    }, [guestUsername]);

    const getUserInfo = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user_id = sessionData.session?.user?.id;

        if (!user_id) {
            // No logged-in user and no guest username → no username
            setUserName(null);
            setImage(null);
            setIsGuest(true);
            return;
        }

        const { data: frompeople, error: fetchError } = await supabase
            .from('people')
            .select()
            .eq('user_id', user_id);

        if (fetchError) {
            console.error('Error fetching user data:', fetchError);
            setUserName(null);
            setImage(null);
            setIsGuest(true);
            return;
        }

        if (frompeople && frompeople.length > 0) {
            setUserName(frompeople[0].username);

            if (frompeople[0].image_uri) {
                const { data: picturedownload, error: pictureError } = await supabase
                    .storage
                    .from('profilepictures')
                    .download(frompeople[0].image_uri);

                if (picturedownload) {
                    const fr = new FileReader();
                    fr.readAsDataURL(picturedownload);
                    fr.onload = () => setImage(fr.result as string);
                }

                if (pictureError) {
                    console.log(pictureError);
                }
            }
        } else {
            setUserName(null);
            setImage(null);
            setIsGuest(true);
        }
    };

    const callImagePicker = async () => {
        if (isGuest) {
            Alert.alert('Access Denied', 'Guests cannot upload profile images.');
            return;
        }

        try {
            const options: any = {
                base64: true,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            };

            const result = await ImagePicker.launchCameraAsync(options);
            if (result.assets && result.assets.length > 0) {
                const filename = randomUUID() + '.png';
                const session = await supabase.auth.getSession();
                const userID = session.data.session?.user?.id;

                if (!userID) {
                    Alert.alert('Error', 'You must be logged in to upload a profile image.');
                    return;
                }

                let databaseUri;
                setImageBase64(result.assets[0].base64);

                const { data: picturedata, error: pictureError } = await supabase
                    .storage
                    .from('profilepictures')
                    .upload(filename, decode(result.assets[0].base64!), {
                        contentType: 'image/png'
                    });

                if (picturedata) {
                    databaseUri = picturedata.path;
                }

                if (pictureError) {
                    console.log(pictureError);
                }

                const { error: tableError } = await supabase
                    .from('people')
                    .update({
                        image_uri: databaseUri
                    })
                    .eq('user_id', userID);

                if (tableError) {
                    console.log(tableError);
                }
            }
        } catch (error) {
            console.error(`Error when picking image: `, error);
        }
    };

    const replaceImage = async () => {
        if (isGuest) {
            Alert.alert('Access Denied', 'Guests cannot replace profile images.');
            return;
        }

        const session = await supabase.auth.getSession();
        const userID = session.data.session?.user?.id;

        if (!userID) {
            Alert.alert('Error', 'You must be logged in to replace your profile image.');
            return;
        }

        const { data, error } = await supabase
            .from('people')
            .select('image_uri')
            .eq('user_id', userID);

        try {
            if (data && data[0]?.image_uri) {
                const { error } = await supabase
                    .storage
                    .from('profilepictures')
                    .remove([data[0].image_uri]);
                if (error) {
                    console.log(error);
                }
            }
        } finally {
            await callImagePicker();
        }
    };

    const handlePWDUpload = async () => {
        if (isGuest) {
            Alert.alert('Access Denied', 'Guests cannot submit PWD verification.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                base64: true,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (result.assets && result.assets.length > 0) {
                const filename = randomUUID() + '.png';
                const pwdUUID = randomUUID();
                const session = await supabase.auth.getSession();
                const userID = session.data.session?.user?.id;

                if (!userID) {
                    Alert.alert('Error', 'You must be logged in to upload PWD verification.');
                    return;
                }

                const { data: pwdUpload, error: pwdError } = await supabase
                    .storage
                    .from('profilepictures')
                    .upload(filename, decode(result.assets[0].base64!), {
                        contentType: 'image/png'
                    });

                if (pwdError) {
                    console.error('PWD Image upload error:', pwdError);
                    return;
                }

                if (pwdUpload) {
                    const { error: updateError } = await supabase
                        .from('people')
                        .update({
                            pwd: pwdUUID,
                            pwd_img: pwdUpload.path
                        })
                        .eq('user_id', userID);

                    if (updateError) {
                        console.log('Error updating PWD info:', updateError);
                    } else {
                        Alert.alert('Success', 'PWD verification submitted.');
                    }
                }
            }
        } catch (error) {
            console.error('Error uploading PWD proof:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add your profile and join.</Text>

            {image ? (
                <TouchableOpacity onLongPress={replaceImage}>
                    <Image source={{ uri: image }} style={styles.profileImage} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.missingImage}
                    onPress={callImagePicker}
                    disabled={isGuest} // disable if guest, no image upload
                >
                    <Text>Click to add user image.</Text>
                </TouchableOpacity>
            )}

            <Text>{username ? `Username: ${username}` : 'Welcome!'}</Text>

            <Pressable style={styles.button} onPress={() => navigation.navigate('ScanScreen')}>
                <Text style={styles.buttonText}>Scan to Join Queue</Text>
            </Pressable>

            <Pressable
                style={[styles.pwdButton, isGuest && { backgroundColor: '#888' }]}
                onPress={handlePWDUpload}
                disabled={isGuest} // disable for guests
            >
                <Text style={styles.buttonText}>I am a PWD.</Text>
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
        textAlign: 'center',
        marginTop: -150,
        marginBottom: 200,
    },
    profileImage: {
        width: 250,
        height: 250,
        borderRadius: 150,
        marginTop: -150,
        marginBottom: 5,
    },
    missingImage: {
        borderWidth: 2,
        borderColor: '#000',
        width: 250,
        height: 250,
        borderRadius: 150,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -150,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#CF5050',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
        marginTop: 40,
    },
    pwdButton: {
        backgroundColor: '#4B84D6',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
