import { useEffect, useMemo, useState } from 'react';
import './liveClassroom.css';
import './classroomEvents.css';
import './analytics.css';

const BASE_STUDENTS = [
  { id: 1, name: 'น้องอิม', number: 1, team: 'Coding Hero', level: 5, exp: 72, coin: 420, badges: 3, score: 3, status: 'online', location: 'หมู่บ้าน', action: 'กำลังสำรวจหมู่บ้าน', x: 28, y: 54, attempts: 1, missions: 8, trend: 18 },
  { id: 2, name: 'น้องออฟตัน', number: 2, team: 'Robotics', level: 4, exp: 38, coin: 315, badges: 2, score: 2, status: 'online', location: 'ห้องหุ่นยนต์', action: 'กำลังสร้างรถขยะ', x: 76, y: 28, attempts: 2, missions: 6, trend: 9 },
  { id: 3, name: 'น้องน้ำมนต์', number: 3, team: 'Young Scientist', level: 6, exp: 15, coin: 540, badges: 4, score: 3, status: 'online', location: 'ห้องวิทยาศาสตร์', action: 'กำลังทำแบบทดสอบ', x: 48, y: 23, attempts: 1, missions: 9, trend: 22 },
  { id: 4, name: 'น้องปลาย', number: 4, team: 'Coding Hero', level: 3, exp: 81, coin: 260, badges: 2, score: 2, status: 'offline', location: 'ออฟไลน์', action: 'ออกจากระบบแล้ว', x: 15, y: 78, attempts: 3, missions: 4, trend: -4 },
  { id: 5, name: 'น้องน้ำขิง', number: 5, team: 'Green School', level: 5, exp: 44, coin: 390, badges: 3, score: 3, status: 'online', location: 'จุดคัดแยกขยะ', action: 'กำลังแยกขยะ', x: 73, y: 72, attempts: 1, missions: 8, trend: 15 },
  { id: 6, name: 'น้องปลาเป้า', number: 6, team: 'Young Scientist', level: 4, exp: 62, coin: 350, badges: 2, score: 2, status: 'offline', location: 'ออฟไลน์', action: 'ออกจากระบบแล้ว', x: 90, y: 84, attempts: 3, missions: 5, trend: 2 },
  { id: 7, name: 'น้องมิน', number: 7, team: 'Robotics', level: 5, exp: 20, coin: 405, badges: 3, score: 3, status: 'afk', location: 'สนามโรงเรียน', action: 'ไม่มีการเคลื่อนไหว', x: 37, y: 76, attempts: 1, missions: 7, trend: 12 },
  { id: 8, name: 'น้องการ์ตูน', number: 8, team: 'Green School', level: 4, exp: 90, coin: 375, badges: 3, score: 2, status: 'online', location: 'ห้องสมุด', action: 'กำลังอ่านหนังสือ', x: 19, y: 24, attempts: 2, missions: 6, trend: 6 },
  { id: 9, name: 'น้องฟิว', number: 9, team: 'Robotics', level: 6, exp: 48, coin: 580, badges: 5, score: 3, status: 'online', location: 'ห้องหุ่นยนต์', action: 'กำลังทดสอบหุ่นยนต์', x: 82, y: 39, attempts: 1, missions: 10, trend: 25 },
];

const TIMELINE = [['09:20', 'เริ่มชั้นเรียน'], ['09:25', 'ภารกิจวิทยาศาสตร์'], ['09:40', 'ภารกิจ Coding'], ['09:55', 'นำเสนอผลงาน']];
const LOCATIONS = ['หมู่บ้าน', 'ห้องวิทยาศาสตร์', 'ห้องหุ่นยนต์', 'ห้องสมุด', 'จุดคัดแยกขยะ', 'สนามโรงเรียน'];
const ACTIONS = ['ได้รับ EXP +15', 'เข้าพื้นที่ใหม่', 'เริ่มทำภารกิจ', 'ตอบคำถามถูกต้อง', 'ได้รับ Badge'];
const EVENT_TEMPLATES = [
  { title: 'นักแยกสารตัวน้อย', description: 'ไปที่ห้องวิทยาศาสตร์และทำแบบทดสอบให้ครบ', duration: 20, exp: 100, coin: 50, target: 'ทุกคน' },
  { title: 'Coding Rescue Mission', description: 'ร่วมทีมออกแบบคำสั่งช่วยเหลือผู้ประสบภัย', duration: 25, exp: 120, coin: 60, target: 'ทุกคน' },
  { title: 'Green School Challenge', description: 'รวบรวมและคัดแยกขยะให้ถูกประเภท', duration: 15, exp: 80, coin: 40, target: 'ทุกคน' },
];
const QUICK_ANNOUNCEMENTS = ['เริ่มกิจกรรมแล้ว', 'เหลือเวลา 5 นาที', 'ทุกคนกลับมาที่จุดรวม', 'เตรียมนำเสนอผลงาน', 'ภารกิจสำเร็จแล้ว'];
const WEEKLY_PROGRESS = [
  { label: 'จันทร์', value: 52 }, { label: 'อังคาร', value: 61 }, { label: 'พุธ', value: 68 }, { label: 'พฤหัสบดี', value: 76 }, { label: 'ศุกร์', value: 84 },
];

function timeNow() { return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
function addProgress(student, exp, coin) {
  const total = student.exp + Number(exp || 0);
  return { ...student, level: student.level + Math.floor(total / 100), exp: total % 100, coin: student.coin + Number(coin || 0) };
}

export default function TeacherDashboard({ onExit }) {
  const [view, setView] = useState('overview');
  const [students, setStudents] = useState(BASE_STUDENTS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [following, setFollowing] = useState(null);
  const [analyticsTeam, setAnalyticsTeam] = useState('all');
  const [feed, setFeed] = useState([
    { id: 1, time: '09:31', text: 'น้องฟิว เข้าห้องหุ่นยนต์' },
    { id: 2, time: '09:32', text: 'น้องน้ำมนต์ ทำ Quiz ผ่าน' },
    { id: 3, time: '09:34', text: 'น้องอิม ได้รับ Badge' },
  ]);
  const [events, setEvents] = useState([]);
  const [activeEventId, setActiveEventId] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [announcementLog, setAnnouncementLog] = useState([]);
  const [rewardTarget, setRewardTarget] = useState('all');
  const [rewardExp, setRewardExp] = useState(50);
  const [rewardCoin, setRewardCoin] = useState(20);
  const [eventDraft, setEventDraft] = useState(EVENT_TEMPLATES[0]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStudents((current) => {
        const online = current.filter((student) => student.status !== 'offline');
        if (!online.length) return current;
        const target = online[Math.floor(Math.random() * online.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        setFeed((items) => [{ id: Date.now(), time: timeNow(), text: `${target.name} ${action}` }, ...items].slice(0, 12));
        return current.map((student) => student.id === target.id ? { ...student, location, action, x: Math.max(8, Math.min(92, student.x + Math.round(Math.random() * 16 - 8))), y: Math.max(12, Math.min(86, student.y + Math.round(Math.random() * 16 - 8))) } : student);
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeEventId || remaining <= 0) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [activeEventId, remaining]);

  useEffect(() => {
    if (activeEventId && remaining === 0) {
      setEvents((items) => items.map((item) => item.id === activeEventId ? { ...item, status: 'finished' } : item));
      setFeed((items) => [{ id: Date.now(), time: timeNow(), text: 'กิจกรรมหมดเวลาแล้ว' }, ...items].slice(0, 12));
      setActiveEventId(null);
    }
  }, [remaining, activeEventId]);

  const filtered = useMemo(() => students.filter((student) => {
    const text = `${student.name} ${student.team} ${student.location}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === 'all' || student.status === status);
  }), [students, query, status]);
  const counts = useMemo(() => ({ online: students.filter((s) => s.status === 'online').length, afk: students.filter((s) => s.status === 'afk').length, offline: students.filter((s) => s.status === 'offline').length }), [students]);
  const heatmap = useMemo(() => LOCATIONS.map((location) => ({ location, count: students.filter((s) => s.status !== 'offline' && s.location === location).length })).sort((a, b) => b.count - a.count), [students]);
  const activeEvent = events.find((event) => event.id === activeEventId);
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const inspect = (student) => { setSelected(student); setFollowing(null); };

  const createEvent = (event) => {
    event.preventDefault();
    const created = { ...eventDraft, id: Date.now(), duration: Number(eventDraft.duration), exp: Number(eventDraft.exp), coin: Number(eventDraft.coin), status: 'draft', createdAt: timeNow() };
    setEvents((items) => [created, ...items]);
    setFeed((items) => [{ id: Date.now() + 1, time: timeNow(), text: `ครูสร้างกิจกรรม “${created.title}”` }, ...items].slice(0, 12));
  };
  const startEvent = (item) => { setEvents((items) => items.map((event) => ({ ...event, status: event.id === item.id ? 'active' : event.status === 'active' ? 'paused' : event.status }))); setActiveEventId(item.id); setRemaining(item.duration * 60); setFeed((items) => [{ id: Date.now(), time: timeNow(), text: `เริ่มกิจกรรม “${item.title}”` }, ...items].slice(0, 12)); };
  const pauseEvent = () => { setEvents((items) => items.map((item) => item.id === activeEventId ? { ...item, status: 'paused' } : item)); setActiveEventId(null); setFeed((items) => [{ id: Date.now(), time: timeNow(), text: 'ครูหยุดกิจกรรมชั่วคราว' }, ...items].slice(0, 12)); };
  const finishEvent = (item) => { setEvents((items) => items.map((event) => event.id === item.id ? { ...event, status: 'finished' } : event)); if (activeEventId === item.id) { setActiveEventId(null); setRemaining(0); } setStudents((items) => items.map((student) => student.status === 'offline' ? student : addProgress(student, item.exp, item.coin))); setFeed((items) => [{ id: Date.now(), time: timeNow(), text: `จบกิจกรรมและมอบ ${item.exp} EXP · ${item.coin} เหรียญ` }, ...items].slice(0, 12)); };
  const sendAnnouncement = (message = announcement) => { const clean = message.trim(); if (!clean) return; const item = { id: Date.now(), time: timeNow(), text: clean }; setAnnouncementLog((items) => [item, ...items].slice(0, 6)); setFeed((items) => [{ id: item.id + 1, time: item.time, text: `📢 ${clean}` }, ...items].slice(0, 12)); setAnnouncement(''); };
  const giveReward = (event) => { event.preventDefault(); const targetId = Number(rewardTarget); setStudents((items) => items.map((student) => rewardTarget === 'all' || student.id === targetId ? addProgress(student, rewardExp, rewardCoin) : student)); const targetName = rewardTarget === 'all' ? 'นักเรียนทั้งห้อง' : students.find((student) => student.id === targetId)?.name; setFeed((items) => [{ id: Date.now(), time: timeNow(), text: `มอบ ${rewardExp} EXP และ ${rewardCoin} เหรียญให้${targetName}` }, ...items].slice(0, 12)); };

  const title = view === 'live' ? 'Live Classroom Mission Control' : view === 'events' ? 'Classroom Event Control' : view === 'analytics' ? 'Learning Analytics' : 'ศูนย์ควบคุมชั้นเรียน';

  return <main className="teacher-shell">
    <aside className="teacher-sidebar">
      <div className="teacher-brand"><span>🌱</span><div><strong>BAO ONLINE</strong><small>Teacher Center</small></div></div>
      <nav>
        <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}>📊 ภาพรวม</button>
        <button className={view === 'live' ? 'active' : ''} onClick={() => setView('live')}>🛰️ ห้องเรียนสด</button>
        <button className={view === 'events' ? 'active' : ''} onClick={() => setView('events')}>🎯 กิจกรรมชั้นเรียน</button>
        <button className={view === 'analytics' ? 'active' : ''} onClick={() => setView('analytics')}>📈 วิเคราะห์ผล</button>
        <button disabled>📄 รายงาน</button>
      </nav>
      <div className="teacher-account"><div className="teacher-avatar">ครู</div><div><strong>ครูสรา</strong><small>ผู้ดูแลชั้น ป.6</small></div></div>
      <button className="teacher-exit" onClick={onExit}>← กลับหน้าหลัก</button>
    </aside>

    <section className="teacher-main">
      <header className="teacher-topbar"><div><p>โรงเรียนบ้านเหล่าพ่อหา</p><h1>{title}</h1></div><div className="teacher-live"><span /> ระบบจำลองข้อมูลในเครื่อง</div></header>
      {activeEvent && <section className="active-event-banner"><div><span>🔴 LIVE EVENT</span><strong>{activeEvent.title}</strong><small>{activeEvent.description}</small></div><div className="event-countdown">⏱ {formatTime(remaining)}</div><button onClick={pauseEvent}>⏸ หยุดชั่วคราว</button><button onClick={() => finishEvent(activeEvent)}>✅ จบกิจกรรม</button></section>}

      {view === 'overview' && <><section className="teacher-cards"><article><span>👨‍🎓</span><div><small>นักเรียนทั้งหมด</small><strong>{students.length}</strong><em>ชั้นประถมศึกษาปีที่ 6</em></div></article><article><span>🟢</span><div><small>กำลังออนไลน์</small><strong>{counts.online}</strong><em>{counts.afk} คน AFK</em></div></article><article><span>🎯</span><div><small>กิจกรรมทั้งหมด</small><strong>{events.length}</strong><em>{events.filter((item) => item.status === 'finished').length} กิจกรรมสำเร็จ</em></div></article><article><span>⭐</span><div><small>คะแนนเฉลี่ย</small><strong>{(students.reduce((sum, s) => sum + s.score, 0) / students.length).toFixed(1)}/3</strong><em>ผลการเรียนรู้ล่าสุด</em></div></article></section><StudentTable students={filtered} query={query} setQuery={setQuery} status={status} setStatus={setStatus} inspect={inspect} /></>}

      {view === 'live' && <><section className="live-summary"><span>🟢 ออนไลน์ <b>{counts.online}</b></span><span>🟡 AFK <b>{counts.afk}</b></span><span>⚪ ออฟไลน์ <b>{counts.offline}</b></span><button onClick={() => setView('events')}>🎯 ควบคุมกิจกรรม</button></section><section className="class-timeline">{TIMELINE.map(([time, label], index) => <div key={time} className={index <= 1 ? 'done' : ''}><b>{time}</b><span>{label}</span></div>)}</section><section className="live-grid"><article className="live-map-card"><header><div><h2>🗺️ แผนที่ห้องเรียนสด</h2><p>คลิกตัวละครเพื่อดูข้อมูล</p></div>{following && <button onClick={() => setFollowing(null)}>ยกเลิกติดตาม {following.name}</button>}</header><div className="live-map"><span className="map-building lab">🧪<small>วิทย์</small></span><span className="map-building robot">🤖<small>หุ่นยนต์</small></span><span className="map-building library">📚<small>ห้องสมุด</small></span><span className="map-building recycle">♻️<small>คัดแยกขยะ</small></span><span className="map-building school">🏫<small>อาคารเรียน</small></span>{students.filter((student) => student.status !== 'offline').map((student) => <button key={student.id} className={`map-student ${student.status} ${following?.id === student.id ? 'following' : ''}`} style={{ left: `${student.x}%`, top: `${student.y}%` }} onClick={() => inspect(student)}>{student.name.replace('น้อง', '').slice(0, 2)}</button>)}</div></article><aside className="live-side"><article><h2>📡 Activity Feed</h2><div className="activity-feed">{feed.slice(0, 8).map((item) => <p key={item.id}><time>{item.time}</time><span>{item.text}</span></p>)}</div></article><article><h2>🔥 Classroom Heatmap</h2><div className="heatmap-list">{heatmap.map((item) => <div key={item.location}><span>{item.location}</span><i><b style={{ width: `${Math.max(5, item.count * 28)}%` }} /></i><strong>{item.count}</strong></div>)}</div></article></aside></section></>}

      {view === 'events' && <section className="event-control-grid"><div className="event-control-main"><article className="event-card event-builder"><header><div><h2>🎯 สร้างกิจกรรมชั้นเรียน</h2><p>กำหนดภารกิจ เวลา และรางวัลสำหรับนักเรียน</p></div></header><div className="template-row">{EVENT_TEMPLATES.map((template) => <button key={template.title} onClick={() => setEventDraft(template)}>{template.title}</button>)}</div><form onSubmit={createEvent}><label>ชื่อกิจกรรม<input required value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} /></label><label className="wide-field">คำอธิบาย<textarea required value={eventDraft.description} onChange={(e) => setEventDraft({ ...eventDraft, description: e.target.value })} /></label><label>เวลา (นาที)<input type="number" min="1" max="120" value={eventDraft.duration} onChange={(e) => setEventDraft({ ...eventDraft, duration: e.target.value })} /></label><label>รางวัล EXP<input type="number" min="0" value={eventDraft.exp} onChange={(e) => setEventDraft({ ...eventDraft, exp: e.target.value })} /></label><label>รางวัลเหรียญ<input type="number" min="0" value={eventDraft.coin} onChange={(e) => setEventDraft({ ...eventDraft, coin: e.target.value })} /></label><label>กลุ่มเป้าหมาย<select value={eventDraft.target} onChange={(e) => setEventDraft({ ...eventDraft, target: e.target.value })}><option>ทุกคน</option><option>Coding Hero</option><option>Robotics</option><option>Young Scientist</option><option>Green School</option></select></label><button className="event-create-button" type="submit">＋ สร้างกิจกรรม</button></form></article><article className="event-card"><header><div><h2>📋 รายการกิจกรรม</h2><p>เริ่ม หยุด หรือปิดกิจกรรมจากรายการนี้</p></div><span>{events.length} รายการ</span></header><div className="event-list">{events.length === 0 && <div className="event-empty">ยังไม่มีกิจกรรม ลองเลือกแม่แบบด้านบนแล้วกดสร้างกิจกรรม</div>}{events.map((item) => <div key={item.id} className={`event-list-item ${item.status}`}><div className="event-status-icon">{item.status === 'active' ? '🔴' : item.status === 'finished' ? '✅' : item.status === 'paused' ? '⏸' : '📝'}</div><div><strong>{item.title}</strong><p>{item.description}</p><small>⏱ {item.duration} นาที · ⭐ {item.exp} EXP · 🪙 {item.coin} · {item.target}</small></div><div className="event-actions">{item.status !== 'finished' && item.status !== 'active' && <button onClick={() => startEvent(item)}>▶ เริ่ม</button>}{item.status === 'active' && <button onClick={pauseEvent}>⏸ หยุด</button>}{item.status !== 'finished' && <button onClick={() => finishEvent(item)}>✅ จบ</button>}</div></div>)}</div></article></div><aside className="event-control-side"><article className="event-card announcement-card"><h2>📢 ประกาศถึงนักเรียน</h2><div className="quick-announcements">{QUICK_ANNOUNCEMENTS.map((text) => <button key={text} onClick={() => sendAnnouncement(text)}>{text}</button>)}</div><textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="พิมพ์ประกาศเพิ่มเติม..." /><button className="send-announcement" onClick={() => sendAnnouncement()}>ส่งประกาศ</button>{announcementLog.length > 0 && <div className="announcement-history">{announcementLog.map((item) => <p key={item.id}><time>{item.time}</time>{item.text}</p>)}</div>}</article><article className="event-card reward-card"><h2>🎁 แจกของรางวัล</h2><form onSubmit={giveReward}><label>ผู้รับ<select value={rewardTarget} onChange={(e) => setRewardTarget(e.target.value)}><option value="all">นักเรียนทั้งห้อง</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label><label>EXP<input type="number" min="0" value={rewardExp} onChange={(e) => setRewardExp(Number(e.target.value))} /></label><label>เหรียญ<input type="number" min="0" value={rewardCoin} onChange={(e) => setRewardCoin(Number(e.target.value))} /></label><button type="submit">มอบรางวัล</button></form></article><article className="event-card mini-feed"><h2>⚡ กิจกรรมล่าสุด</h2>{feed.slice(0, 6).map((item) => <p key={item.id}><time>{item.time}</time><span>{item.text}</span></p>)}</article></aside></section>}

      {view === 'analytics' && <AnalyticsView students={students} team={analyticsTeam} setTeam={setAnalyticsTeam} feed={feed} inspect={inspect} />}
    </section>

    {selected && <div className="teacher-modal" onClick={() => setSelected(null)}><section className="inspector-modal" onClick={(event) => event.stopPropagation()}><button className="inspector-close" onClick={() => setSelected(null)}>×</button><div className="student-big-avatar">{selected.name.slice(-1)}</div><h2>{selected.name}</h2><p>ป.6 · เลขที่ {selected.number} · {selected.team}</p><div className="student-detail-grid"><span><small>สถานะ</small><strong>{selected.status === 'online' ? '🟢 ออนไลน์' : selected.status === 'afk' ? '🟡 AFK' : '⚪ ออฟไลน์'}</strong></span><span><small>ตำแหน่ง</small><strong>{selected.location}</strong></span><span><small>การกระทำล่าสุด</small><strong>{selected.action}</strong></span><span><small>ความก้าวหน้า</small><strong>Lv. {selected.level} · {selected.exp} EXP</strong></span><span><small>เหรียญ</small><strong>🪙 {selected.coin}</strong></span><span><small>Badge</small><strong>🏅 {selected.badges}</strong></span></div><div className="inspector-actions"><button onClick={() => { setFollowing(selected); setSelected(null); setView('live'); }}>👁 ติดตามบนแผนที่</button><button onClick={() => { setRewardTarget(String(selected.id)); setSelected(null); setView('events'); }}>🎁 มอบรางวัล</button></div></section></div>}
  </main>;
}

function StudentTable({ students, query, setQuery, status, setStatus, inspect }) {
  return <section className="teacher-panel"><div className="teacher-panel-head"><div><h2>รายชื่อนักเรียน</h2><p>ติดตามสถานะและความก้าวหน้าใน BAO Online</p></div><div className="teacher-tools"><label>🔎<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ ทีม หรือสถานที่" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">ทุกสถานะ</option><option value="online">ออนไลน์</option><option value="afk">AFK</option><option value="offline">ออฟไลน์</option></select></div></div><div className="teacher-table-wrap"><table className="teacher-table"><thead><tr><th>นักเรียน</th><th>สถานะ</th><th>ทีม</th><th>Level / EXP</th><th>ตำแหน่ง</th><th>คะแนน</th><th /></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className="student-name"><span>{student.name.slice(-1)}</span><div><strong>{student.name}</strong><small>ป.6 · เลขที่ {student.number}</small></div></div></td><td><span className={`status-pill ${student.status}`}>● {student.status === 'online' ? 'ออนไลน์' : student.status === 'afk' ? 'AFK' : 'ออฟไลน์'}</span></td><td><span className="team-pill">{student.team}</span></td><td><strong>Lv. {student.level}</strong><div className="mini-progress"><i style={{ width: `${student.exp}%` }} /></div><small>{student.exp}/100 EXP</small></td><td><strong>{student.location}</strong><small className="activity-text">{student.action}</small></td><td><strong>{student.score}/3</strong></td><td><button className="detail-button" onClick={() => inspect(student)}>ดูข้อมูล</button></td></tr>)}</tbody></table>{students.length === 0 && <div className="empty-students">ไม่พบนักเรียนที่ตรงกับการค้นหา</div>}</div></section>;
}

function AnalyticsView({ students, team, setTeam, feed, inspect }) {
  const teams = [...new Set(students.map((student) => student.team))];
  const visible = team === 'all' ? students : students.filter((student) => student.team === team);
  const average = visible.reduce((sum, student) => sum + student.score, 0) / Math.max(1, visible.length);
  const completion = Math.round((visible.filter((student) => student.score >= 3).length / Math.max(1, visible.length)) * 100);
  const averageLevel = (visible.reduce((sum, student) => sum + student.level, 0) / Math.max(1, visible.length)).toFixed(1);
  const needsHelp = visible.filter((student) => student.score < 3 || student.attempts >= 3 || student.trend < 0);
  const ranked = [...visible].sort((a, b) => (b.score * 100 + b.level * 10 + b.exp) - (a.score * 100 + a.level * 10 + a.exp));
  const teamData = teams.map((name) => { const members = students.filter((student) => student.team === name); return { name, value: Math.round((members.reduce((sum, student) => sum + student.score, 0) / members.length / 3) * 100), count: members.length }; });

  return <section className="analytics-page">
    <div className="analytics-toolbar"><div><h2>📈 ภาพรวมการเรียนรู้</h2><p>วิเคราะห์คะแนน ความก้าวหน้า การทำภารกิจ และนักเรียนที่ควรได้รับการช่วยเหลือ</p></div><select value={team} onChange={(event) => setTeam(event.target.value)}><option value="all">ทุกทีม</option>{teams.map((name) => <option key={name}>{name}</option>)}</select></div>
    <section className="analytics-kpis"><article><small>คะแนนเฉลี่ย</small><strong>{average.toFixed(1)}/3</strong><em>จากนักเรียน {visible.length} คน</em></article><article><small>อัตราจบบทเรียน</small><strong>{completion}%</strong><em>{visible.filter((student) => student.score >= 3).length} คนผ่านครบ</em></article><article><small>Level เฉลี่ย</small><strong>{averageLevel}</strong><em>ความก้าวหน้ารวม</em></article><article><small>ต้องการการช่วยเหลือ</small><strong>{needsHelp.length}</strong><em>จากคะแนนและจำนวนครั้งที่ลอง</em></article></section>
    <section className="analytics-grid"><article className="analytics-card"><h2>📅 แนวโน้มรายสัปดาห์</h2><p>เปอร์เซ็นต์ความสำเร็จของภารกิจในแต่ละวัน</p><div className="score-bars">{WEEKLY_PROGRESS.map((item) => <div className="score-bar" key={item.label}><span>{item.label}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong></div>)}</div></article><article className="analytics-card"><h2>🏆 ผลงานรายทีม</h2><p>คะแนนเฉลี่ยเทียบกับคะแนนเต็ม</p><div className="team-list">{teamData.map((item) => <div className="team-row" key={item.name}><span><strong>{item.name}</strong><small>{item.count} คน</small></span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value}%</strong></div>)}</div></article></section>
    <section className="analytics-grid"><article className="analytics-card"><h2>⚠️ นักเรียนที่ควรติดตาม</h2><p>พิจารณาจากคะแนน จำนวนครั้งที่ทำ และแนวโน้มล่าสุด</p><div className="needs-list">{needsHelp.length === 0 && <div className="analytics-empty">ยังไม่พบนักเรียนที่ต้องติดตามเป็นพิเศษ</div>}{needsHelp.map((student) => <div className="needs-item" key={student.id}><span>{student.name.slice(-1)}</span><div><strong>{student.name}</strong><small>คะแนน {student.score}/3 · ทำ {student.attempts} ครั้ง · แนวโน้ม {student.trend > 0 ? '+' : ''}{student.trend}%</small></div><button onClick={() => inspect(student)}>ดูข้อมูล</button></div>)}</div></article><article className="analytics-card"><h2>🕘 Activity History</h2><p>กิจกรรมล่าสุดจากห้องเรียนและระบบครู</p><div className="activity-history">{feed.map((item) => <p key={item.id}><time>{item.time}</time><span>{item.text}</span></p>)}</div></article></section>
    <article className="analytics-card"><h2>🥇 ตารางคะแนนรายบุคคล</h2><p>เรียงจากคะแนน Level และ EXP ปัจจุบัน</p><div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>อันดับ</th><th>นักเรียน</th><th>ทีม</th><th>คะแนน</th><th>ภารกิจ</th><th>Level / EXP</th><th>แนวโน้ม</th><th /></tr></thead><tbody>{ranked.map((student, index) => <tr key={student.id}><td><span className="rank-badge">{index + 1}</span></td><td><strong>{student.name}</strong><small> เลขที่ {student.number}</small></td><td>{student.team}</td><td><strong>{student.score}/3</strong></td><td>{student.missions}</td><td>Lv. {student.level} · {student.exp} EXP</td><td><span className={`trend ${student.trend >= 0 ? 'up' : 'watch'}`}>{student.trend >= 0 ? '▲' : '▼'} {Math.abs(student.trend)}%</span></td><td><button className="detail-button" onClick={() => inspect(student)}>วิเคราะห์</button></td></tr>)}</tbody></table></div></article>
  </section>;
}
