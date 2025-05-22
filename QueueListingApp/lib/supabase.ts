import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { envStorage } from './envStorage';

export const supabase = createClient(envStorage.SUPABASE_URL!, envStorage.SUPABASE_ANON_KEY!,{
        auth:{
            persistSession:true,
            storage:AsyncStorage
        }
    });
