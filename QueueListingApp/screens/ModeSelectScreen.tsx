import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type ModeSelectRouteProp = RouteProp<RootStackParamList, 'ModeSelect'>;

export default function ModeSelect() {
  const route = useRoute<ModeSelectRouteProp>();
  const guestUsername = route.params?.username;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [username, setUserName] = useState<string | null>('');
  const [hasQueue, setHasQueue] = useState<boolean>(false);

  useEffect(() => {
    const getUserInfoAndQueue = async () => {
      if (guestUsername) {
        setUserName(guestUsername);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const user_id = sessionData.session?.user.id;

      if (!user_id) return;

      // Get username
      const { data: userData } = await supabase
        .from('people')
        .select('username')
        .eq('user_id', user_id);

      if (userData && userData.length > 0) {
        setUserName(userData[0].username);
      }

      // Check if user has queue
      const { data: queueData, error } = await supabase
        .from('queues')
        .select('queue_id')
        .eq('owner_id', user_id);

      if (error) {
        console.error('Error checking queues:', error);
      } else {
        setHasQueue(queueData && queueData.length > 0);
        console.log('Queues found:', queueData);
      }
    };

    getUserInfoAndQueue();
  }, []);

  const SignOut = () => {
    supabase.auth.signOut();
    navigation.navigate('Main');
  };

  const isGuest = !!guestUsername;

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer]}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Pressable onPress={SignOut}>
          <Image source={require('../assets/exit.png')} style={styles.exit} />
        </Pressable>
      </View>

      <Text style={styles.title}>Good day, {username}!</Text>

      <Pressable
        style={[
          styles.button1,
          (isGuest || hasQueue) && styles.disabledButton,
        ]}
        onPress={() => {
          if (!isGuest && !hasQueue) {
            navigation.navigate('CreateQueue');
          }
        }}
        disabled={isGuest || hasQueue}
      >
        <View style={styles.buttonContent}>
          <Image source={require('../assets/create.png')} style={styles.image} />
          <Text style={styles.buttonText}>
            Create Queue {isGuest ? '(Guests Restricted)' : hasQueue ? '(Queue already exists)' : ''}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.button2,
          (isGuest || !hasQueue) && styles.disabledButton,
        ]}
        onPress={() => {
          if (!isGuest && hasQueue) {
            navigation.navigate('ManageQueue');
          }
        }}
        disabled={isGuest || !hasQueue}
      >
        <View style={styles.buttonContent}>
          <Image source={require('../assets/manage.png')} style={styles.image} />
          <Text style={styles.buttonText}>
            Manage Queue {isGuest ? '(Guests Restricted)' : !hasQueue ? '(No queue created)' : ''}
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.button3}
        onPress={() => navigation.navigate('JoinQueue', { guestName: guestUsername })}
      >
        <View style={styles.buttonContent}>
          <Image source={require('../assets/join.png')} style={styles.image} />
          <Text style={styles.buttonText}>Join a Queue</Text>
        </View>
      </Pressable>

      {isGuest && (
        <Text style={styles.guestNotice}>Guest users can only join queues.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '109%',
    paddingHorizontal: 20,
    marginBottom: 80,
    marginTop: -80,
  },
  logo: {
    resizeMode: 'contain',
    width: 60,
    height: 60,
  },
  exit: {
    resizeMode: 'contain',
    width: 60,
    height: 60,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'contain',
    width: 100,
    height: 130,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  button1: {
    backgroundColor: '#D46666',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0.3,
    elevation: 5,
  },
  button2: {
    backgroundColor: '#356A7D',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0.3,
    elevation: 5,
  },
  button3: {
    backgroundColor: '#E9B25F',
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 25,
    width: '85%',
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 0.3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '70%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  guestNotice: {
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 10,
    fontSize: 14,
  },
});
