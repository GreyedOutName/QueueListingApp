import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export const WaitingListItem=({ item }: any)=>{
  const [username, setUsername] = useState('Loading...');

  useEffect(() => {
    const fetchUsername = async () => {
      const result = await getUsername(item.user_id);
      setUsername(result || 'Unknown');
    };

    fetchUsername();
  }, [item.user_id]);
  
  const getUsername=async(user_id:string)=>{
        const {data:frompeople} = await supabase.from('people')
        .select('username')
        .eq('user_id',user_id)
        if(frompeople){
            return frompeople[0].username
        }else{
            return 'failed'
        }
    }

  return (
    <View style={styles.waitingList}>
      <Text style={styles.queueNum}>{item.queue_num}</Text>
      <Text style={styles.queueUser}>{username}</Text>
      <Text style={styles.queueTime}>{item.time_joined}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
