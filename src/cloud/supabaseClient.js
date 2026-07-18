import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cloudEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = cloudEnabled
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: { eventsPerSecond: 8 },
      },
    })
  : null;

export const classroomId =
  import.meta.env.VITE_CLASSROOM_ID ||
  import.meta.env.VITE_BAO_CLASSROOM_ID ||
  'banlaophoha-p6-2569';

export function getCloudStatus() {
  return {
    enabled: cloudEnabled,
    mode: cloudEnabled ? 'cloud' : 'local',
    classroomId,
  };
}
