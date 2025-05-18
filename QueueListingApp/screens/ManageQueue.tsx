import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList ,Modal} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../App';
import QRCode from "react-native-qrcode-svg";

export default function ManageQueue() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [username,setUserName] = useState<string|null>('')
    const [queuename,setQueueName] = useState<string|null>('')
    const [QueueID,setQueueID] = useState<string|null>('')
    const [waitingList,setWaitingList] = useState<any[]>([])
    const [showQR,setShowQR]=useState<boolean>(false);

    const getInfo = async()=>{
        const {data:getId} = await supabase.auth.getSession()
        const user_id = getId.session?.user.id

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
        }

        const {data:fromwaiting} = await supabase.from('waiting')
        .select()
        .eq('queue_id',QueueID)
        if (fromwaiting){
            setWaitingList(fromwaiting)
        }
    }

    const RenderItem = ({item}:any) =>{
        return(
            <View>
                <Text>{item.queue_num}</Text>
                <Text>{item.user_id}</Text>
            </View> 
        )
    }

    useEffect(()=>{
        getInfo();
    },[])

    return (
        <View style={styles.container}>
            <Text>Welcome User {username}!</Text>
            <Text>Queue Name: {queuename}</Text>

            <TouchableOpacity style={styles.button} onPress={()=>setShowQR(!showQR)}>
                <Text style={styles.buttonText}>{showQR?'Hide QR Code':'Get QR Code'}</Text>
            </TouchableOpacity>
            
            {showQR&&
                <QRCode size={250} value={QueueID!}/>
            }
            
            <FlatList
                data={waitingList.map(list => ({key: list.user_id, ...list}))}
                renderItem={RenderItem}
            />
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
