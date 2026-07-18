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

function toPlayerPayload(player, extra = {}) {
  return {
    classroom_id: classroomId,
    username: player.username,
    display_name: player.name || player.display_name || player.username,
    character: player.character || 'boy',
    classroom: player.classroom || null,
    student_number: player.number || player.student_number || null,
    team: player.team || null,
    level: Number(player.level || 1),
    exp: Number(player.exp || 0),
    coin: Number(player.coin || 0),
    inventory: player.inventory || {},
    quest: player.quest || {},
    learning: player.learning || {},
    badges: Array.isArray(player.badges) ? player.badges : [],
    status: extra.status || player.status || 'online',
    current_location: extra.currentLocation ?? player.current_location ?? 'หมู่บ้าน',
    last_action: extra.lastAction ?? player.last_action ?? 'เข้าใช้งานเกม',
    last_seen_at: new Date().toISOString(),
  };
}

export async function savePlayerProgress(player, extra = {}) {
  if (!player?.username) return { mode: cloudEnabled ? 'cloud' : 'local', data: null };
  const payload = toPlayerPayload(player, extra);

  if (!cloudEnabled) {
    const local = readLocal();
    local[player.username] = payload;
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

  if (!cloudEnabled) return readLocal()[username] || null;

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function setPlayerPresence(username, status, details = {}) {
  if (!username) return;

  if (!cloudEnabled) {
    const local = readLocal();
    if (local[username]) {
      local[username] = {
        ...local[username],
        status,
        current_location: details.currentLocation ?? local[username].current_location,
        last_action: details.lastAction ?? local[username].last_action,
        last_seen_at: new Date().toISOString(),
      };
      writeLocal(local);
    }
    return;
  }

  const update = {
    status,
    last_seen_at: new Date().toISOString(),
  };
  if (details.currentLocation !== undefined) update.current_location = details.currentLocation;
  if (details.lastAction !== undefined) update.last_action = details.lastAction;

  const { error } = await supabase
    .from('player_profiles')
    .update(update)
    .eq('classroom_id', classroomId)
    .eq('username', username);

  if (error) throw error;
}

export async function logActivity(username, eventType, message, metadata = {}) {
  if (!username || !message) return;
  if (!cloudEnabled) return;

  const { error } = await supabase.from('activity_logs').insert({
    classroom_id: classroomId,
    username,
    event_type: eventType,
    message,
    metadata,
  });

  if (error) throw error;
}

export async function listClassroomPlayers() {
  if (!cloudEnabled) return Object.values(readLocal());

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
