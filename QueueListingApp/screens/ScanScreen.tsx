import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult} from 'expo-camera';
import { useState, useEffect , useRef} from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ScanScreen() {
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
    if(!hasScanned){
        if (qr.data){
            const queue_id = qr.data;
            const user_id = (await supabase.auth.getSession()).data.session?.user.id
            const joined_at = new Date().toISOString().split('.')[0].replace('T', ' ');

            const{error} = await supabase.from('queue')
            .insert({
                user_id:user_id,
                queue_id:queue_id,
                queue_num:10,
                time_joined:joined_at,
            })
            if(error){
                console.log(error)
            }

            setHasScanned(true)
            cooldownTimeout.current = setTimeout(() => {
                setHasScanned(false);
            }, 1000);
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
