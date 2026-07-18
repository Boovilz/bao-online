import { classroomId, cloudEnabled, supabase } from './supabaseClient.js';

const LOCAL_KEY = 'bao-cloud-fallback';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(value) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(value));
}

export async function savePlayerProgress(player) {
  const payload = {
    classroom_id: classroomId,
    username: player.username,
    display_name: player.name,
    character: player.character,
    classroom: player.classroom,
    student_number: player.number || null,
    team: player.team,
    level: player.level,
    exp: player.exp,
    coin: player.coin,
    inventory: player.inventory,
    quest: player.quest,
    learning: player.learning,
    badges: player.badges,
    last_seen_at: new Date().toISOString(),
  };

  if (!cloudEnabled) {
    const local = readLocal();
    local[player.username || player.name] = payload;
    writeLocal(local);
    return { mode: 'local', data: payload };
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .upsert(payload, { onConflict: 'classroom_id,username' })
    .select()
    .single();

  if (error) throw error;
  return { mode: 'cloud', data };
}

export async function loadPlayerProgress(username) {
  if (!username) return null;

  if (!cloudEnabled) {
    return readLocal()[username] || null;
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listClassroomPlayers() {
  if (!cloudEnabled) {
    return Object.values(readLocal());
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('student_number', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

export function subscribeToClassroomPlayers(onChange) {
  if (!cloudEnabled) return () => {};

  const channel = supabase
    .channel(`classroom:${classroomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'player_profiles',
        filter: `classroom_id=eq.${classroomId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
