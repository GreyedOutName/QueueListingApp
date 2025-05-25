import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, TextInput} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';
import QRCode from "react-native-qrcode-svg";
import {WaitingListItem} from '../components/waitingListItem';

export default function ManageQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [queuename,setQueueName] = useState<string|null>('')
    const [QueueID,setQueueID] = useState<string|null>('')
    const [showWaitingList,setShowWaitingList] = useState<boolean>(false);
    const [waitingList,setWaitingList] = useState<any[]|null>(null)
    const [showQR,setShowQR]=useState<boolean>(false);
    const [image,setImage] = useState <string|null> ();
    const [messageGiven,setMessage] = useState<string|null>();
    
    const getInfo = async()=>{
        const user_id = (await supabase.auth.getSession()).data.session?.user.id

        const {data:frompeople} = await supabase.from('people')
        .select('username')
        .eq('user_id',user_id)

        if(frompeople){
            setUserName(frompeople[0].username)
        }

        const {data:fromqueues} = await supabase.from('queues')
        .select()
        .eq('owner_id',user_id)
        if(fromqueues){
            setQueueID(fromqueues[0].queue_id)
            setQueueName(fromqueues[0].queue_name)

            const {data:picturedownload,error:pictureError} = await supabase.storage.from('queuepictures').download(fromqueues[0].image_uri)
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

    const getTable = async()=>{
        const {data:fromwaiting} = await supabase.from('waiting')
        .select()
        .eq('queue_id',QueueID)
        if (fromwaiting){
            setWaitingList(fromwaiting)
        } 
    }


    const exportQR = async()=>{
        /*
        if (qrRef.current) {
            qrRef.current.toDataURL((data: string) => {
                const uri = `data:image/png;base64,${data}`;
                Alert.alert('QR exported', uri.slice(0, 100) + '...');
            });
        } else {
            Alert.alert('QR code not ready');
        }*/
    }

    const moveQueue = async()=>{
        const {error} = await supabase.rpc('decrement_column', {
            target_queue_id: QueueID
        });
        if (error){
            console.log(error)
        }
        getTable()
    }

    const giveMessage = async()=>{
        const joined_at = new Date().toISOString().split('.')[0].replace('T', ' ');

        const {error:deleteError} = await supabase.from('alerts').delete().eq('queue_id',QueueID)
        if(deleteError){
            console.log(deleteError)
        }

        const {error} = await supabase.from('alerts').upsert(
            {
                queue_id:QueueID,
                text:messageGiven,
                time_created:joined_at,
            }
        )
        if(error){
            console.log(error)
        }
    }

    const deleteQueueFromDatabase = async()=>{
        const {error} = await supabase.from('queues').delete().eq('queue_id',QueueID)
        if(error){
            console.log(error)
        }
        navigation.navigate('ModeSelect')
        Alert.alert('Queue Deletion','Queue is now Deleted')
    }

    const deleteQueue = async()=>{
        Alert.alert('Delete Queue', 'Are you sure you want to delete Queue?', [
        {
            text: 'Cancel',
            onPress: () => Alert.alert('Deletion Canceled'),
            style: 'cancel',
        },
        {text: 'OK', onPress: () => deleteQueueFromDatabase()},
        ]);
    }

    useEffect(()=>{
        getInfo();
    },[])

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Manage your queue</Text>

            {(!image && !showQR && !waitingList) && (
                <View style={styles.placeholderBox}>
                    <Text style={styles.queueLabel}>Queue Label:</Text>
                </View>
            )}

            {(image&&!showQR&&!showWaitingList)&&
                <Image source={{uri:image}} style={{ width: 250, height: 250, borderRadius: 75 }}/>
            }
            <Text style={styles.queueNameText}>Queue Name: {queuename}</Text>

            {/*showQR&&
                <View style={styles.smallercontainer}>
                    <QRCode size={250} value={QueueID!}/>
                    <TouchableOpacity style={styles.button} onPress={exportQR}>
                        <Text style={styles.buttonText}>Export as PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={exportQR}>
                        <Text style={styles.buttonText}>Export as Image</Text>
                    </TouchableOpacity>
                </View>
            */}

            {!showWaitingList && (
                <TouchableOpacity
                    style={styles.buttonRed}
                    onPress={() => {
                    if (QueueID) {
                        navigation.navigate('GenerateQR', { queueId: QueueID });
                    } else {
                        Alert.alert('Queue ID not available');
                    }
                    }}
                >
                    <Text style={styles.buttonText}>Generate QR Code</Text>
                </TouchableOpacity>
                )}
            {!showQR&&
                <TouchableOpacity style={styles.buttonBlack} onPress={()=>{setShowWaitingList(!showWaitingList);getTable()}}>
                    <Text style={styles.buttonText}>{showWaitingList?'Hide Waiting List':'Show Waiting List'}</Text>
                </TouchableOpacity>
            }
            {showWaitingList&&
                <View>
                    <FlatList
                        style={styles.flatList}
                        data={waitingList}
                        renderItem={({ item }) => <WaitingListItem item={item} />}
                    />
                    <View>
                        <TouchableOpacity style={styles.buttonBlack} onPress={moveQueue}>
                            <Text style={styles.buttonText}>Move Queue</Text>
                        </TouchableOpacity>
                        <TextInput
                            placeholder='Message Text'
                            onChangeText={setMessage}
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.buttonBlack} onPress={giveMessage}>
                            <Text style={styles.buttonText}>Give Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonRed} onPress={deleteQueue}>
                            <Text style={styles.buttonText}>Delete Queue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }  
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 70,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    queueNameText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    placeholderBox: {
        width: 250,
        height: 250,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    queueLabel: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8,
    },
    imageBox: {
        width: 250,
        height: 250,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonRed: {
        backgroundColor: '#d9534f',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 12,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        alignSelf: 'center',
    },
    buttonBlack: {
        backgroundColor: '#333',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 12,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        alignSelf: 'center',
    },
    flatList: {
        maxHeight: '40%',
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        fontSize: 16,
        marginTop: 12,
    },
    controlsWrapper: {
        marginTop: 30,
        width: '100%',
        alignSelf: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 10,
    },
    qrButtonsContainer: {
        width: '100%',
        alignItems: 'center',
    },
});
