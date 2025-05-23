import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult} from 'expo-camera';
import { useState, useEffect , useRef} from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

export default function ScanScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned,setHasScanned]=useState<boolean>(false);
  const cooldownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
        return () => {
          if (cooldownTimeout.current) {
            clearTimeout(cooldownTimeout.current);
          }
        };
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const toggleCameraFacing=()=>{
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const qrScanned=async(qr:BarcodeScanningResult)=>{
    setHasScanned(true)
    cooldownTimeout.current = setTimeout(() => {
                  setHasScanned(false);
              }, 4000);
    if(!hasScanned){
        if (qr.data){
            console.log(qr.data)
            const queue_id = qr.data;
            const user_id = (await supabase.auth.getSession()).data.session?.user.id
            const joined_at = new Date().toISOString().split('.')[0].replace('T', ' ');
            const QueueNum = (await supabase.rpc('get_max_int8_value',{target_queue_id:queue_id})).data
          
            //check if user has already joined a queue (including the current scanned one)
            const{data:existingQueue}= await supabase.from('waiting').select('user_id').eq('user_id',user_id)
            if(existingQueue?.toString() == '[]'){
              console.log(existingQueue)
              Alert.alert('You are already waiting in a queue!')
              navigation.navigate('JoinQueue')
            }
            else{//else if user has no existing wait queue, proceed to add them to waiting table
              const{error} = await supabase.from('waiting')
              .insert({
                  user_id:user_id,
                  queue_id:queue_id,
                  queue_num:QueueNum,
                  time_joined:joined_at,
              })
              if(error){
                  console.log('QUEUE NUM :',QueueNum)
                  Alert.alert('Invalid QR Code')
              }else{
                navigation.navigate('JoinQueue')
              }
            }
        }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
      style={styles.camera}
      facing={facing}
      onBarcodeScanned={qrScanned}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
