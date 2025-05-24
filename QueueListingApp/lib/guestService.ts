
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const insertGuest = async (username: string) => {
  const guestId = uuidv4();

  const { error } = await supabase.from('people').insert([
    {
      id: guestId,
      username: username,
      user_id: null,
    },
  ]);

  if (error) {
    console.error('Insert guest error:', error);
    return null;
  }

  return guestId;
};
