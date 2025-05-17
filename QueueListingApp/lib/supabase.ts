import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tijhlobqhqxcokcltwvx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpamhsb2JxaHF4Y29rY2x0d3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxODUxMDUsImV4cCI6MjA2Mjc2MTEwNX0.fCJjoob6DJEb6wIuGkMHeMS0j4lwDY0fyVcyJlbA-hE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
