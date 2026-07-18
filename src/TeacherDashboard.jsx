import { useEffect, useMemo, useState } from 'react';
import './liveClassroom.css';

const BASE_STUDENTS = [
  { id: 1, name: 'น้องอิม', number: 1, team: 'Coding Hero', level: 5, exp: 72, coin: 420, badges: 3, score: 3, status: 'online', location: 'หมู่บ้าน', action: 'กำลังสำรวจหมู่บ้าน', x: 28, y: 54 },
  { id: 2, name: 'น้องออฟตัน', number: 2, team: 'Robotics', level: 4, exp: 38, coin: 315, badges: 2, score: 2, status: 'online', location: 'ห้องหุ่นยนต์', action: 'กำลังสร้างรถขยะ', x: 76, y: 28 },
  { id: 3, name: 'น้องน้ำมนต์', number: 3, team: 'Young Scientist', level: 6, exp: 15, coin: 540, badges: 4, score: 3, status: 'online', location: 'ห้องวิทยาศาสตร์', action: 'กำลังทำแบบทดสอบ', x: 48, y: 23 },
  { id: 4, name: 'น้องปลาย', number: 4, team: 'Coding Hero', level: 3, exp: 81, coin: 260, badges: 2, score: 2, status: 'offline', location: 'ออฟไลน์', action: 'ออกจากระบบแล้ว', x: 15, y: 78 },
  { id: 5, name: 'น้องน้ำขิง', number: 5, team: 'Green School', level: 5, exp: 44, coin: 390, badges: 3, score: 3, status: 'online', location: 'จุดคัดแยกขยะ', action: 'กำลังแยกขยะ', x: 73, y: 72 },
  { id: 6, name: 'น้องปลาเป้า', number: 6, team: 'Young Scientist', level: 4, exp: 62, coin: 350, badges: 2, score: 2, status: 'offline', location: 'ออฟไลน์', action: 'ออกจากระบบแล้ว', x: 90, y: 84 },
  { id: 7, name: 'น้องมิน', number: 7, team: 'Robotics', level: 5, exp: 20, coin: 405, badges: 3, score: 3, status: 'afk', location: 'สนามโรงเรียน', action: 'ไม่มีการเคลื่อนไหว', x: 37, y: 76 },
  { id: 8, name: 'น้องการ์ตูน', number: 8, team: 'Green School', level: 4, exp: 90, coin: 375, badges: 3, score: 2, status: 'online', location: 'ห้องสมุด', action: 'กำลังอ่านหนังสือ', x: 19, y: 24 },
  { id: 9, name: 'น้องฟิว', number: 9, team: 'Robotics', level: 6, exp: 48, coin: 580, badges: 5, score: 3, status: 'online', location: 'ห้องหุ่นยนต์', action: 'กำลังทดสอบหุ่นยนต์', x: 82, y: 39 },
];

const TIMELINE = [
  ['09:20', 'เริ่มชั้นเรียน'], ['09:25', 'ภารกิจวิทยาศาสตร์'], ['09:40', 'ภารกิจ Coding'], ['09:55', 'นำเสนอผลงาน'],
];
const LOCATIONS = ['หมู่บ้าน', 'ห้องวิทยาศาสตร์', 'ห้องหุ่นยนต์', 'ห้องสมุด', 'จุดคัดแยกขยะ', 'สนามโรงเรียน'];
const ACTIONS = ['ได้รับ EXP +15', 'เข้าพื้นที่ใหม่', 'เริ่มทำภารกิจ', 'ตอบคำถามถูกต้อง', 'ได้รับ Badge'];

function timeNow() {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TeacherDashboard({ onExit }) {
  const [view, setView] = useState('overview');
  const [students, setStudents] = useState(BASE_STUDENTS);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [following, setFollowing] = useState(null);
  const [feed, setFeed] = useState([
    { id: 1, time: '09:31', text: 'น้องฟิว เข้าห้องหุ่นยนต์' },
    { id: 2, time: '09:32', text: 'น้องน้ำมนต์ ทำ Quiz ผ่าน' },
    { id: 3, time: '09:34', text: 'น้องอิม ได้รับ Badge' },
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const online = students.filter((student) => student.status !== 'offline');
      if (!online.length) return;
      const target = online[Math.floor(Math.random() * online.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      setStudents((items) => items.map((student) => student.id === target.id ? {
        ...student,
        location,
        action,
        x: Math.max(8, Math.min(92, student.x + Math.round(Math.random() * 16 - 8))),
        y: Math.max(12, Math.min(86, student.y + Math.round(Math.random() * 16 - 8))),
      } : student));
      setFeed((items) => [{ id: Date.now(), time: timeNow(), text: `${target.name} ${action}` }, ...items].slice(0, 8));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [students]);

  const filtered = useMemo(() => students.filter((student) => {
    const text = `${student.name} ${student.team} ${student.location}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (status === 'all' || student.status === status);
  }), [students, query, status]);

  const counts = useMemo(() => ({
    online: students.filter((student) => student.status === 'online').length,
    afk: students.filter((student) => student.status === 'afk').length,
    offline: students.filter((student) => student.status === 'offline').length,
  }), [students]);

  const heatmap = useMemo(() => LOCATIONS.map((location) => ({
    location,
    count: students.filter((student) => student.status !== 'offline' && student.location === location).length,
  })).sort((a, b) => b.count - a.count), [students]);

  const inspect = (student) => { setSelected(student); setFollowing(null); };

  return (
    <main className="teacher-shell">
      <aside className="teacher-sidebar">
        <div className="teacher-brand"><span>🌱</span><div><strong>BAO ONLINE</strong><small>Teacher Center</small></div></div>
        <nav>
          <button className={view === 'overview' ? 'active' : ''} onClick={() => setView('overview')}>📊 ภาพรวม</button>
          <button className={view === 'live' ? 'active' : ''} onClick={() => setView('live')}>🛰️ ห้องเรียนสด</button>
          <button disabled>🎯 กิจกรรมชั้นเรียน</button><button disabled>📈 วิเคราะห์ผล</button><button disabled>📄 รายงาน</button>
        </nav>
        <div className="teacher-account"><div className="teacher-avatar">ครู</div><div><strong>ครูสรา</strong><small>ผู้ดูแลชั้น ป.6</small></div></div>
        <button className="teacher-exit" onClick={onExit}>← กลับหน้าหลัก</button>
      </aside>

      <section className="teacher-main">
        <header className="teacher-topbar">
          <div><p>โรงเรียนบ้านเหล่าพ่อหา</p><h1>{view === 'live' ? 'Live Classroom Mission Control' : 'ศูนย์ควบคุมชั้นเรียน'}</h1></div>
          <div className="teacher-live"><span /> จำลองการอัปเดตทุก 4 วินาที</div>
        </header>

        {view === 'overview' ? <>
          <section className="teacher-cards">
            <article><span>👨‍🎓</span><div><small>นักเรียนทั้งหมด</small><strong>{students.length}</strong><em>ชั้นประถมศึกษาปีที่ 6</em></div></article>
            <article><span>🟢</span><div><small>กำลังออนไลน์</small><strong>{counts.online}</strong><em>{counts.afk} คน AFK</em></div></article>
            <article><span>✅</span><div><small>จบบทเรียนแล้ว</small><strong>{students.filter((s) => s.score >= 3).length}</strong><em>นักแยกสารตัวน้อย</em></div></article>
            <article><span>⭐</span><div><small>คะแนนเฉลี่ย</small><strong>{(students.reduce((sum, s) => sum + s.score, 0) / students.length).toFixed(1)}/3</strong><em>ผลการเรียนรู้ล่าสุด</em></div></article>
          </section>
          <StudentTable students={filtered} query={query} setQuery={setQuery} status={status} setStatus={setStatus} inspect={inspect} />
        </> : <>
          <section className="live-summary">
            <span>🟢 ออนไลน์ <b>{counts.online}</b></span><span>🟡 AFK <b>{counts.afk}</b></span><span>⚪ ออฟไลน์ <b>{counts.offline}</b></span><button onClick={() => setView('overview')}>ดูรายชื่อทั้งหมด</button>
          </section>
          <section className="class-timeline">{TIMELINE.map(([time, label], index) => <div key={time} className={index <= 1 ? 'done' : ''}><b>{time}</b><span>{label}</span></div>)}</section>
          <section className="live-grid">
            <article className="live-map-card">
              <header><div><h2>🗺️ แผนที่ห้องเรียนสด</h2><p>คลิกตัวละครเพื่อดูข้อมูล</p></div>{following && <button onClick={() => setFollowing(null)}>ยกเลิกติดตาม {following.name}</button>}</header>
              <div className="live-map">
                <span className="map-building lab">🧪<small>วิทย์</small></span><span className="map-building robot">🤖<small>หุ่นยนต์</small></span><span className="map-building library">📚<small>ห้องสมุด</small></span><span className="map-building recycle">♻️<small>คัดแยกขยะ</small></span><span className="map-building school">🏫<small>อาคารเรียน</small></span>
                {students.filter((student) => student.status !== 'offline').map((student) => <button key={student.id} className={`map-student ${student.status} ${following?.id === student.id ? 'following' : ''}`} style={{ left: `${student.x}%`, top: `${student.y}%` }} onClick={() => inspect(student)} title={`${student.name} · ${student.location}`}>{student.name.replace('น้อง', '').slice(0, 2)}</button>)}
              </div>
            </article>
            <aside className="live-side">
              <article><h2>📡 Activity Feed</h2><div className="activity-feed">{feed.map((item) => <p key={item.id}><time>{item.time}</time><span>{item.text}</span></p>)}</div></article>
              <article><h2>🔥 Classroom Heatmap</h2><div className="heatmap-list">{heatmap.map((item) => <div key={item.location}><span>{item.location}</span><i><b style={{ width: `${Math.max(5, item.count * 28)}%` }} /></i><strong>{item.count}</strong></div>)}</div></article>
            </aside>
          </section>
        </>}
      </section>

      {selected && <div className="teacher-modal" onClick={() => setSelected(null)}><section className="inspector-modal" onClick={(event) => event.stopPropagation()}><button className="inspector-close" onClick={() => setSelected(null)}>×</button><div className="student-big-avatar">{selected.name.slice(-1)}</div><h2>{selected.name}</h2><p>ป.6 · เลขที่ {selected.number} · {selected.team}</p><div className="student-detail-grid"><span><small>สถานะ</small><strong>{selected.status === 'online' ? '🟢 ออนไลน์' : selected.status === 'afk' ? '🟡 AFK' : '⚪ ออฟไลน์'}</strong></span><span><small>ตำแหน่ง</small><strong>{selected.location}</strong></span><span><small>การกระทำล่าสุด</small><strong>{selected.action}</strong></span><span><small>ความก้าวหน้า</small><strong>Lv. {selected.level} · {selected.exp} EXP</strong></span><span><small>เหรียญ</small><strong>🪙 {selected.coin}</strong></span><span><small>Badge</small><strong>🏅 {selected.badges}</strong></span></div><div className="inspector-actions"><button onClick={() => { setFollowing(selected); setSelected(null); setView('live'); }}>👁 ติดตามบนแผนที่</button><button disabled>📍 Teleport — Phase Multiplayer</button></div></section></div>}
    </main>
  );
}

function StudentTable({ students, query, setQuery, status, setStatus, inspect }) {
  return <section className="teacher-panel"><div className="teacher-panel-head"><div><h2>รายชื่อนักเรียน</h2><p>ติดตามสถานะและความก้าวหน้าใน BAO Online</p></div><div className="teacher-tools"><label>🔎<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ ทีม หรือสถานที่" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">ทุกสถานะ</option><option value="online">ออนไลน์</option><option value="afk">AFK</option><option value="offline">ออฟไลน์</option></select></div></div><div className="teacher-table-wrap"><table className="teacher-table"><thead><tr><th>นักเรียน</th><th>สถานะ</th><th>ทีม</th><th>Level / EXP</th><th>ตำแหน่ง</th><th>คะแนน</th><th /></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className="student-name"><span>{student.name.slice(-1)}</span><div><strong>{student.name}</strong><small>ป.6 · เลขที่ {student.number}</small></div></div></td><td><span className={`status-pill ${student.status}`}>● {student.status === 'online' ? 'ออนไลน์' : student.status === 'afk' ? 'AFK' : 'ออฟไลน์'}</span></td><td><span className="team-pill">{student.team}</span></td><td><strong>Lv. {student.level}</strong><div className="mini-progress"><i style={{ width: `${student.exp}%` }} /></div><small>{student.exp}/100 EXP</small></td><td><strong>{student.location}</strong><small className="activity-text">{student.action}</small></td><td><strong>{student.score}/3</strong></td><td><button className="detail-button" onClick={() => inspect(student)}>ดูข้อมูล</button></td></tr>)}</tbody></table>{students.length === 0 && <div className="empty-students">ไม่พบนักเรียนที่ตรงกับการค้นหา</div>}</div></section>;
}
