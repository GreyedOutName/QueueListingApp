// screens/GenerateQRScreen.tsx

import React,{useRef} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation ,NavigationProp} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../App';
import FileSystem from 'expo-file-system'
import MediaLibrary from 'expo-media-library'

type QRScreenRouteProp = RouteProp<RootStackParamList, 'GenerateQR'>;

export default function GenerateQRScreen() {
  const route = useRoute<QRScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { queueId } = route.params;
  const qrRef = useRef<any>(null);

  const hideQRCode = () => {
    navigation.goBack();
  };

  const exportAsImage = async () => {
  if (qrRef.current) {
    qrRef.current.toDataURL(async (data: string) => {
      const uri = `data:image/png;base64,${data}`;
      try {
        // Extract base64 string
        const base64Data = uri.replace('data:image/png;base64,', '');

        // Write to a file in app's document directory
        const fileUri = FileSystem.documentDirectory + 'qr_code.png';
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Request media library permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Cannot save image to gallery');
          return;
        }

        // Save to gallery
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);

        Alert.alert('Success', 'QR code saved to gallery!');
      } catch (error) {
        Alert.alert('Error', 'Failed to save image: ' + error);
      }
    });
  } else {
    Alert.alert('QR code not ready');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Queue QR Code</Text>
      {queueId ? (
        <>
          <View style={styles.qrContainer}>
            <QRCode 
              value={queueId} 
              size={300} 
              getRef={(c) => (qrRef.current = c)}
            />
          </View>
          <View style={styles.qrButtonsContainer}> 
            <TouchableOpacity style={styles.buttonRed} onPress={hideQRCode}>
              <Text style={styles.buttonText}>Hide QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonBlack} onPress={exportAsImage}>
              <Text style={styles.buttonText}>Export as Image</Text>
            </TouchableOpacity>
          </View>
          
        </>
      ) : (
        <Text>No Queue ID Provided</Text>
      )}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
