// screens/GenerateQRScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { RootStackParamList } from '../App';

type QRScreenRouteProp = RouteProp<RootStackParamList, 'GenerateQR'>;

export default function GenerateQRScreen() {
  const route = useRoute<QRScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { queueId } = route.params;

  const hideQRCode = () => {
    navigation.goBack();
  };

  const exportAsImage = () => {
    Alert.alert('QR exported as Image (not yet implemented)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Queue QR Code</Text>
      {queueId ? (
        <>
          <QRCode value={queueId} size={250} />
          <TouchableOpacity style={styles.button} onPress={hideQRCode}>
            <Text style={styles.buttonText}>Hide QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={exportAsImage}>
            <Text style={styles.buttonText}>Export as Image</Text>
          </TouchableOpacity>
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
});
