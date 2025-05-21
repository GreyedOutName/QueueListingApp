import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image} from 'react-native';
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
    const [waitingList,setWaitingList] = useState<any[]|null>(null)
    const [showQR,setShowQR]=useState<boolean>(false);
    const [image,setImage] = useState <string|null> ();

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
        if (waitingList){
            setWaitingList(null)
        }else{
            const {data:fromwaiting} = await supabase.from('waiting')
            .select()
            .eq('queue_id',QueueID)
            if (fromwaiting){
                setWaitingList(fromwaiting)
            } 
        }
    }


    const exportQR = async()=>{
        Alert.alert('QR exported as PDF')
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
        Alert.alert('Notifications Given')
    }

    useEffect(()=>{
        getInfo();
    },[])

    return (
        <View style={styles.container}>
            {(image&&!showQR&&!waitingList)&&
                <Image source={{uri:image}} style={{ width: 250, height: 250, borderRadius: 75 }}/>
            }
            <Text>Welcome User {username}!</Text>
            <Text>Queue Name: {queuename}</Text>
            {showQR&&
                <View style={styles.smallercontainer}>
                    <QRCode size={250} value={QueueID!}/>
                    <TouchableOpacity style={styles.button} onPress={exportQR}>
                        <Text style={styles.buttonText}>Export as PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={exportQR}>
                        <Text style={styles.buttonText}>Export as Image</Text>
                    </TouchableOpacity>
                </View>
            }
            {!waitingList&&
                <TouchableOpacity style={styles.button} onPress={()=>setShowQR(!showQR)}>
                    <Text style={styles.buttonText}>{showQR?'Hide QR Code':'Get QR Code'}</Text>
                </TouchableOpacity>
            }
            {!showQR&&
                <TouchableOpacity style={styles.button} onPress={getTable}>
                    <Text style={styles.buttonText}>{waitingList?'Hide Waiting List':'Show Waiting List'}</Text>
                </TouchableOpacity>
            }
            {waitingList&&
                <View>
                    <FlatList
                        style={styles.flatList}
                        data={waitingList}
                        renderItem={({ item }) => <WaitingListItem item={item} />}
                    />
                    <View>
                        <TouchableOpacity style={styles.button} onPress={moveQueue}>
                            <Text style={styles.buttonText}>Move Queue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={giveMessage}>
                            <Text style={styles.buttonText}>Give Message</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  smallercontainer: {
    alignItems: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flatList: {
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'gray',
  },
  waitingList: {
    flex:1,
    flexDirection:'row',
    alignItems:'flex-start',
    padding:10,
  },
  queueNum: {
    width:'10%'
  },
  queueUser: {
    width:'60%'
  },
  queueTime: {
    width:'30%'
  }
});
