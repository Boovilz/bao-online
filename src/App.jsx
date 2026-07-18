import { useEffect, useRef, useState } from 'react';
import { createGame } from './game/createGame.js';
import TeacherDashboard from './TeacherDashboard.jsx';
import { getCloudStatus } from './cloud/supabaseClient.js';
import { loadPlayerProgress, logActivity, savePlayerProgress, setPlayerPresence } from './cloud/cloudStore.js';

const DEFAULT_PLAYER = {
  username: '', character: 'boy', name: 'นักเรียนบ้านเฮา', level: 1, exp: 0, coin: 100,
  classroom: 'ป.6', number: '', team: 'ทีม Coding Hero',
  inventory: { seedling: 0, flower: 0, book: 0, lego: 0 },
  quest: { accepted: false, progress: 0, target: 3, completed: false, claimed: false },
  learning: { scienceCompleted: false, scienceBest: 0 }, badges: [],
};
const ITEM_INFO = { seedling: { icon: '🌱', name: 'ต้นกล้า' }, flower: { icon: '🌼', name: 'ดอกไม้' }, book: { icon: '📚', name: 'หนังสือ' }, lego: { icon: '🧱', name: 'ชิ้นส่วน LEGO' } };
const TEAMS = ['ทีม Coding Hero', 'ทีม Young Scientist', 'ทีม Green School', 'ทีม Robotics'];
const SAFE_MESSAGES = ['สวัสดี 👋', 'มาทำภารกิจกัน', 'ช่วยฉันหน่อย', 'เก่งมาก!', 'ขอบคุณ', 'ไปห้องวิทยาศาสตร์กัน'];
const EMOTES = ['👋', '👍', '🎉', '🤔', '💡', '🙏'];
const DEMO_PLAYERS = [
  { name: 'น้องฟิว', team: 'ทีม Robotics', place: 'ห้องหุ่นยนต์', icon: '🤖' },
  { name: 'น้องน้ำมนต์', team: 'ทีม Young Scientist', place: 'ห้องวิทยาศาสตร์', icon: '🧪' },
  { name: 'น้องการ์ตูน', team: 'ทีม Green School', place: 'จุดคัดแยกขยะ', icon: '♻️' },
];
const SCIENCE_QUIZ = [
  { question: 'วิธีใดเหมาะสำหรับแยกทรายออกจากน้ำ?', choices: ['การกรอง', 'การใช้แม่เหล็ก', 'การระเหิด'], answer: 0 },
  { question: 'วัสดุใดถูกดูดด้วยแม่เหล็กได้?', choices: ['ตะปูเหล็ก', 'แก้วน้ำ', 'ยางลบ'], answer: 0 },
  { question: 'เมื่อต้องการแยกเกลือออกจากน้ำเกลือ ควรใช้วิธีใด?', choices: ['การร่อน', 'การระเหยแห้ง', 'การใช้มือหยิบ'], answer: 1 },
];

function normalizePlayer(saved = {}) {
  return {
    ...DEFAULT_PLAYER,
    ...saved,
    name: saved.display_name || saved.name || DEFAULT_PLAYER.name,
    number: saved.student_number ?? saved.number ?? DEFAULT_PLAYER.number,
    inventory: { ...DEFAULT_PLAYER.inventory, ...(saved.inventory || {}) },
    quest: { ...DEFAULT_PLAYER.quest, ...(saved.quest || {}) },
    learning: { ...DEFAULT_PLAYER.learning, ...(saved.learning || {}) },
    badges: Array.isArray(saved.badges) ? saved.badges : [],
  };
}
function loadPlayer() { try { return normalizePlayer(JSON.parse(localStorage.getItem('bao-player') || '{}')); } catch { return DEFAULT_PLAYER; } }
function sendKey(key, type) { window.dispatchEvent(new KeyboardEvent(type, { key, code: key, bubbles: true })); }
function HoldButton({ label, keyName, className = '' }) { const press = (event) => { event.preventDefault(); sendKey(keyName, 'keydown'); }; const release = (event) => { event.preventDefault(); sendKey(keyName, 'keyup'); }; return <button className={`touch-btn ${className}`} onPointerDown={press} onPointerUp={release} onPointerCancel={release} onPointerLeave={release}>{label}</button>; }

export default function App() {
  const gameRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('KruSara');
  const [player, setPlayer] = useState(loadPlayer);
  const [panel, setPanel] = useState(null);
  const [toast, setToast] = useState('');
  const [feed, setFeed] = useState([]);
  const [loginBusy, setLoginBusy] = useState(false);
  const [cloudState, setCloudState] = useState({ ...getCloudStatus(), saving: false, error: '' });
  const [quiz, setQuiz] = useState({ index: 0, score: 0, answered: false, selected: null });

  useEffect(() => { localStorage.setItem('bao-player', JSON.stringify(player)); }, [player]);
  useEffect(() => {
    if (screen !== 'world' || !player.username) return undefined;
    window.clearTimeout(saveTimerRef.current);
    setCloudState((state) => ({ ...state, saving: true, error: '' }));
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const result = await savePlayerProgress(player, { status: 'online' });
        setCloudState((state) => ({ ...state, mode: result.mode, saving: false, error: '' }));
      } catch (error) {
        console.error('[BAO Cloud] save failed', error);
        setCloudState((state) => ({ ...state, saving: false, error: 'บันทึก Cloud ไม่สำเร็จ' }));
      }
    }, 700);
    return () => window.clearTimeout(saveTimerRef.current);
  }, [player, screen]);

  useEffect(() => {
    if (screen !== 'world' || !player.username) return undefined;
    const markOffline = () => { setPlayerPresence(player.username, 'offline', { lastAction: 'ออกจากเกม' }).catch(() => {}); };
    const markVisibility = () => {
      const status = document.hidden ? 'afk' : 'online';
      setPlayerPresence(player.username, status, { lastAction: document.hidden ? 'ไม่มีการเคลื่อนไหว' : 'กลับเข้าเกม' }).catch(() => {});
    };
    document.addEventListener('visibilitychange', markVisibility);
    window.addEventListener('pagehide', markOffline);
    return () => {
      document.removeEventListener('visibilitychange', markVisibility);
      window.removeEventListener('pagehide', markOffline);
      markOffline();
    };
  }, [screen, player.username]);

  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(''), 1800); };
  const postCommunity = (message) => { setFeed((items) => [{ id: Date.now(), name: player.name, message }, ...items].slice(0, 5)); showToast(`${player.name}: ${message}`); };
  useEffect(() => {
    if (screen !== 'world') return undefined;
    gameRef.current = createGame('game', {
      player,
      onPlace: (place) => {
        setPlayerPresence(player.username, 'online', { currentLocation: place.name, lastAction: `เข้า ${place.name}` }).catch(() => {});
        setPanel(place.name === 'ห้องวิทยาศาสตร์' ? { type: 'science-intro', ...place } : { type: 'place', ...place });
      },
      onNpc: () => setPanel({ type: 'npc' }),
      onCollect: () => { setPlayer((current) => { const inventory = { ...current.inventory, seedling: current.inventory.seedling + 1 }; if (!current.quest.accepted || current.quest.completed) return { ...current, inventory }; const progress = Math.min(current.quest.progress + 1, current.quest.target); return { ...current, inventory, quest: { ...current.quest, progress, completed: progress >= current.quest.target } }; }); showToast('ได้รับ 🌱 ต้นกล้า x1'); },
    });
    return () => gameRef.current?.destroy(true);
  }, [screen]);

  const login = async (event) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || loginBusy) return;
    setLoginBusy(true);
    setCloudState((state) => ({ ...state, error: '' }));
    try {
      const cloudPlayer = await loadPlayerProgress(cleanUsername);
      if (cloudPlayer) {
        setPlayer(normalizePlayer(cloudPlayer));
        setScreen('world');
        await setPlayerPresence(cleanUsername, 'online', { currentLocation: cloudPlayer.current_location || 'หมู่บ้าน', lastAction: 'เข้าสู่เกม' });
        showToast('โหลดข้อมูลจาก Cloud แล้ว');
      } else {
        setPlayer((current) => normalizePlayer({ ...current, username: cleanUsername }));
        setScreen('character');
      }
    } catch (error) {
      console.error('[BAO Cloud] login failed', error);
      setCloudState((state) => ({ ...state, error: 'เชื่อมต่อ Cloud ไม่สำเร็จ กำลังใช้ข้อมูลในเครื่อง' }));
      setPlayer((current) => normalizePlayer({ ...current, username: cleanUsername }));
      setScreen('character');
    } finally {
      setLoginBusy(false);
    }
  };
  const chooseCharacter = async (character) => {
    const nextPlayer = normalizePlayer({ ...player, character, name: character === 'girl' ? 'น้องข้าวหอม' : 'น้องต้นกล้า' });
    setPlayer(nextPlayer);
    setScreen('world');
    try {
      await savePlayerProgress(nextPlayer, { status: 'online', currentLocation: 'หมู่บ้าน', lastAction: 'สร้างโปรไฟล์ผู้เล่น' });
      await logActivity(nextPlayer.username, 'player_joined', `${nextPlayer.name} เข้าสู่บ้านเฮาออนไลน์`);
    } catch (error) {
      console.error('[BAO Cloud] profile creation failed', error);
      setCloudState((state) => ({ ...state, error: 'สร้างข้อมูล Cloud ไม่สำเร็จ' }));
    }
  };
  const acceptQuest = () => { setPlayer((p) => ({ ...p, quest: { accepted: true, progress: 0, target: 3, completed: false, claimed: false } })); setPanel(null); showToast('รับภารกิจใหม่แล้ว'); };
  const addExp = (current, amount) => { const total = current.exp + amount; return { level: current.level + Math.floor(total / 100), exp: total % 100 }; };
  const claimReward = () => { setPlayer((current) => current.quest.completed && !current.quest.claimed ? { ...current, ...addExp(current, 120), coin: current.coin + 50, quest: { ...current.quest, claimed: true } } : current); setPanel({ type: 'reward' }); };
  const saveProfile = (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setPlayer((p) => ({ ...p, classroom: data.get('classroom'), number: data.get('number'), team: data.get('team') })); setPanel(null); showToast('บันทึกโปรไฟล์ชุมชนแล้ว'); };
  const startScience = () => { setQuiz({ index: 0, score: 0, answered: false, selected: null }); setPanel({ type: 'science-quiz' }); };
  const answerScience = (choice) => { if (quiz.answered) return; const correct = choice === SCIENCE_QUIZ[quiz.index].answer; setQuiz((q) => ({ ...q, answered: true, selected: choice, score: q.score + (correct ? 1 : 0) })); };
  const nextScience = () => {
    if (quiz.index < SCIENCE_QUIZ.length - 1) { setQuiz((q) => ({ ...q, index: q.index + 1, answered: false, selected: null })); return; }
    const finalScore = quiz.score;
    setPlayer((current) => { const firstClear = !current.learning.scienceCompleted; return { ...current, ...(firstClear ? addExp(current, 80) : { level: current.level, exp: current.exp }), coin: current.coin + (firstClear ? 40 : 0), inventory: { ...current.inventory, book: current.inventory.book + (firstClear ? 1 : 0) }, learning: { ...current.learning, scienceCompleted: true, scienceBest: Math.max(current.learning.scienceBest, finalScore) }, badges: firstClear && !current.badges.includes('Young Scientist') ? [...current.badges, 'Young Scientist'] : current.badges }; });
    setPanel({ type: 'science-result', score: finalScore });
  };

  if (screen === 'teacher') return <TeacherDashboard onExit={() => setScreen('login')} />;
  if (screen === 'login') return <main className="splash login-screen"><div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" /><section className="login-card game-panel"><div className="brand-lockup"><div className="logo">BAO <span>ONLINE</span></div><div className="leaf-mark">🌱</div></div><h1>บ้านเฮาออนไลน์</h1><p className="subtitle">โรงเรียนบ้านเหล่าพ่อหา · โลกแห่งการเรียนรู้</p><form onSubmit={login}><label htmlFor="username">ชื่อผู้เล่น</label><div className="input-frame"><span>👤</span><input id="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} /></div><button className="primary start-button" type="submit" disabled={loginBusy}>{loginBusy ? 'กำลังโหลดข้อมูล...' : 'เข้าสู่บ้านเฮา'}</button></form>{cloudState.error && <p className="connection-note">⚠️ {cloudState.error}</p>}<div className="role-divider"><span>หรือ</span></div><button className="teacher-login-button" onClick={() => setScreen('teacher')}>🧑‍🏫 เข้าสู่ศูนย์ควบคุมครู</button><small>V0.8.2 · {cloudState.enabled ? 'Supabase Cloud' : 'Local Mode'}</small></section></main>;
  if (screen === 'character') return <main className="splash character-screen"><section className="select-card game-panel"><header className="select-heading"><span>เลือกตัวละคร</span><small>ผู้เล่น: {player.username}</small></header><div className="character-grid"><button onClick={() => chooseCharacter('boy')}><img src="/assets/player-boy.svg" alt="นักเรียนชาย" /><span>น้องต้นกล้า</span><small>นักเรียนชาย</small><em>เลือกตัวละครนี้</em></button><button onClick={() => chooseCharacter('girl')}><img src="/assets/player-girl.svg" alt="นักเรียนหญิง" /><span>น้องข้าวหอม</span><small>นักเรียนหญิง</small><em>เลือกตัวละครนี้</em></button></div><button className="secondary back-button" onClick={() => setScreen('login')}>← ย้อนกลับ</button></section></main>;

  const question = SCIENCE_QUIZ[quiz.index];
  return <main className="app">
    <header className="hud"><div className="identity"><span className="avatar"><img src={player.character === 'girl' ? '/assets/player-girl.svg' : '/assets/player-boy.svg'} alt="ตัวละคร" /></span><div><h1>บ้านเฮาออนไลน์</h1><p>{player.name} · {player.classroom}{player.number ? ` เลขที่ ${player.number}` : ''}</p></div></div><div className="stats"><span>Lv. {player.level}</span><span>EXP {player.exp}/100</span><span>🪙 {player.coin}</span><span>{cloudState.saving ? '☁️ กำลังบันทึก' : cloudState.enabled ? '☁️ Cloud' : '💾 Local'}</span><button onClick={() => setPanel({ type: 'community' })}>🟢 ชุมชน</button><button onClick={() => setPanel({ type: 'profile' })}>👤 โปรไฟล์</button><button onClick={() => setPanel({ type: 'inventory' })}>🎒</button></div></header>
    <section className="game-wrap"><section id="game" className="game" /><aside className="quest-widget"><strong>📜 ภารกิจแรก</strong>{!player.quest.accepted && <p>คุยกับครูภูมิปัญญา</p>}{player.quest.accepted && !player.quest.claimed && <p>เก็บต้นกล้า {player.quest.progress}/{player.quest.target}</p>}{player.quest.claimed && <p>✅ รับรางวัลแล้ว</p>}{player.quest.completed && !player.quest.claimed && <button onClick={claimReward}>รับรางวัล</button>}</aside>{feed.length > 0 && <aside className="community-feed"><strong>💬 ชุมชน</strong>{feed.map((item) => <p key={item.id}><b>{item.name}</b> {item.message}</p>)}</aside>}{toast && <div className="toast">{toast}</div>}<div className="mobile-controls" aria-label="ปุ่มควบคุมเกม"><div className="dpad"><HoldButton label="▲" keyName="ArrowUp" className="up" /><HoldButton label="◀" keyName="ArrowLeft" className="left" /><HoldButton label="▼" keyName="ArrowDown" className="down" /><HoldButton label="▶" keyName="ArrowRight" className="right" /></div><button className="action-btn" onPointerDown={(e) => { e.preventDefault(); sendKey('KeyE', 'keydown'); setTimeout(() => sendKey('KeyE', 'keyup'), 100); }}>E<br /><small>คุย</small></button></div></section>
    <footer className="help">Phase 8.2 Player Cloud Sync · บันทึกโปรไฟล์ EXP เหรียญ ภารกิจ และสถานะผู้เล่น</footer>
    {panel && <div className="overlay" onClick={() => setPanel(null)}><section className={`dialog ${panel.type === 'science-quiz' ? 'learning-dialog' : ''}`} onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setPanel(null)}>×</button>
      {panel.type === 'profile' && <><div className="place-icon">👤</div><h2>โปรไฟล์ชุมชน</h2><form className="profile-form" onSubmit={saveProfile}><label>ชั้นเรียน<input name="classroom" defaultValue={player.classroom} maxLength="12" /></label><label>เลขที่<input name="number" defaultValue={player.number} inputMode="numeric" maxLength="3" /></label><label>ทีม<select name="team" defaultValue={player.team}>{TEAMS.map((team) => <option key={team}>{team}</option>)}</select></label><button className="primary" type="submit">บันทึกโปรไฟล์</button></form></>}
      {panel.type === 'community' && <><div className="place-icon">🌐</div><h2>ชุมชนบ้านเฮา</h2><div className="connection-note">{cloudState.enabled ? 'เชื่อมต่อ Supabase Cloud แล้ว' : 'กำลังใช้ข้อมูลในเครื่อง'}</div><div className="online-list"><div><span>🟢</span><b>{player.name}</b><small>{player.team} · อยู่ในหมู่บ้าน</small></div>{DEMO_PLAYERS.map((friend) => <div key={friend.name}><span>{friend.icon}</span><b>{friend.name}</b><small>{friend.team} · {friend.place}</small></div>)}</div><h3>ข้อความปลอดภัย</h3><div className="quick-grid">{SAFE_MESSAGES.map((message) => <button key={message} onClick={() => postCommunity(message)}>{message}</button>)}</div><h3>Emote</h3><div className="emote-grid">{EMOTES.map((emote) => <button key={emote} onClick={() => postCommunity(emote)}>{emote}</button>)}</div></>}
      {panel.type === 'inventory' && <><div className="place-icon">🎒</div><h2>กระเป๋าของฉัน</h2><div className="inventory-grid">{Object.entries(ITEM_INFO).map(([key, item]) => <div className="inventory-item" key={key}><span>{item.icon}</span><strong>{item.name}</strong><em>x{player.inventory[key]}</em></div>)}</div></>}
      {panel.type === 'npc' && <><img className="dialog-avatar" src="/assets/npc-teacher.svg" alt="ครูภูมิปัญญา" /><h2>ครูภูมิปัญญา</h2>{!player.quest.accepted && <><p>ช่วยครูเก็บต้นกล้าให้ครบ 3 ต้น แล้วกลับมารับรางวัลนะ</p><button className="primary" onClick={acceptQuest}>รับภารกิจ</button></>}{player.quest.accepted && !player.quest.completed && <p>ตอนนี้เก็บได้ {player.quest.progress}/{player.quest.target} ต้น</p>}{player.quest.completed && !player.quest.claimed && <button className="primary" onClick={claimReward}>รับรางวัล</button>}{player.quest.claimed && <p>ไปลองเรียนที่ห้องวิทยาศาสตร์ได้เลย</p>}</>}
      {panel.type === 'science-intro' && <><div className="place-icon">🧪</div><h2>ห้องวิทยาศาสตร์</h2><p>ภารกิจการเรียนรู้: นักแยกสารตัวน้อย</p><button className="primary" onClick={startScience}>เริ่มบทเรียน</button></>}
      {panel.type === 'science-quiz' && <><div className="lesson-progress">ข้อ {quiz.index + 1}/{SCIENCE_QUIZ.length} · คะแนน {quiz.score}</div><div className="place-icon">🧪</div><h2>{question.question}</h2><div className="quiz-choices">{question.choices.map((choice, index) => <button key={choice} disabled={quiz.answered} className={quiz.answered ? (index === question.answer ? 'correct' : index === quiz.selected ? 'wrong' : '') : ''} onClick={() => answerScience(index)}>{choice}</button>)}</div>{quiz.answered && <button className="primary" onClick={nextScience}>{quiz.index === SCIENCE_QUIZ.length - 1 ? 'ดูผลการเรียน' : 'ข้อต่อไป'}</button>}</>}
      {panel.type === 'science-result' && <><div className="place-icon">🏆</div><h2>จบบทเรียนแล้ว!</h2><p>ได้คะแนน {panel.score}/{SCIENCE_QUIZ.length}</p><button className="primary" onClick={() => setPanel(null)}>กลับสู่หมู่บ้าน</button></>}
      {panel.type === 'place' && <><div className="place-icon">{panel.icon}</div><h2>{panel.name}</h2><p>{panel.description}</p><div className="coming-soon">กำลังเตรียมบทเรียนและมินิเกมสำหรับห้องนี้</div></>}
      {panel.type === 'reward' && <><div className="place-icon">🎁</div><h2>ภารกิจสำเร็จ!</h2><p>ได้รับ EXP 120 และเหรียญ 50</p></>}
    </section></div>}
  </main>;
}
