import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet , Image} from 'react-native';
import { supabase } from '../lib/supabase';

export const WaitingListItem=({ item }: any)=>{
  const [username, setUsername] = useState('Loading...');
  const [image, setImage] = useState<string | null>(null);
  const [image_url,setImageUrl]=useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      const result = await getUsername(item.user_id);
      setUsername(result || 'Unknown');
    };

    const getPicture = async() =>{
      const {data:frompeople,error:peopleError} = await supabase.from('people').select('image_uri').eq('user_id',item.user_id)
      if(peopleError){
        console.log(peopleError)
      }
      const { data: picturedownload, error: pictureError } = await supabase
      .storage
      .from('profilepictures')
      .download(frompeople![0].image_uri);
    
      if (picturedownload) {
        const fr = new FileReader();
        fr.readAsDataURL(picturedownload);
        fr.onload = () => setImage(fr.result as string);
      }
    
      if (pictureError) {
        console.log(pictureError);
      }
    }
    fetchUsername();
    getPicture();
    
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
      <Image source={{uri:image}} style={styles.queueImage}/>
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
    width:'40%'
  },
  queueTime: {
    width:'30%'
  },
  queueImage:{
    width:'20%',
    aspectRatio: 1, // or another ratio like 16 / 9
    resizeMode: 'contain',
  }
});
