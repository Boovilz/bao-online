import { useMemo, useState } from 'react';

const STUDENTS = [
  { id: 1, name: 'น้องอิม', classroom: 'ป.6', number: 1, team: 'Coding Hero', level: 5, exp: 72, coin: 420, badges: 3, score: 3, online: true, activity: 'อยู่ในหมู่บ้าน' },
  { id: 2, name: 'น้องออฟตัน', classroom: 'ป.6', number: 2, team: 'Robotics', level: 4, exp: 38, coin: 315, badges: 2, score: 2, online: true, activity: 'ห้องหุ่นยนต์' },
  { id: 3, name: 'น้องน้ำมนต์', classroom: 'ป.6', number: 3, team: 'Young Scientist', level: 6, exp: 15, coin: 540, badges: 4, score: 3, online: true, activity: 'ห้องวิทยาศาสตร์' },
  { id: 4, name: 'น้องปลาย', classroom: 'ป.6', number: 4, team: 'Coding Hero', level: 3, exp: 81, coin: 260, badges: 2, score: 2, online: false, activity: 'ออฟไลน์' },
  { id: 5, name: 'น้องน้ำขิง', classroom: 'ป.6', number: 5, team: 'Green School', level: 5, exp: 44, coin: 390, badges: 3, score: 3, online: true, activity: 'จุดคัดแยกขยะ' },
  { id: 6, name: 'น้องปลาเป้า', classroom: 'ป.6', number: 6, team: 'Young Scientist', level: 4, exp: 62, coin: 350, badges: 2, score: 2, online: false, activity: 'ออฟไลน์' },
  { id: 7, name: 'น้องมิน', classroom: 'ป.6', number: 7, team: 'Robotics', level: 5, exp: 20, coin: 405, badges: 3, score: 3, online: true, activity: 'กำลังทำภารกิจ' },
  { id: 8, name: 'น้องการ์ตูน', classroom: 'ป.6', number: 8, team: 'Green School', level: 4, exp: 90, coin: 375, badges: 3, score: 2, online: true, activity: 'ห้องสมุด' },
  { id: 9, name: 'น้องฟิว', classroom: 'ป.6', number: 9, team: 'Robotics', level: 6, exp: 48, coin: 580, badges: 5, score: 3, online: true, activity: 'ห้องหุ่นยนต์' },
];

export default function TeacherDashboard({ onExit }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => STUDENTS.filter((student) => {
    const text = `${student.name} ${student.team} ${student.activity}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesStatus = status === 'all' || (status === 'online' ? student.online : !student.online);
    return matchesQuery && matchesStatus;
  }), [query, status]);

  const onlineCount = STUDENTS.filter((student) => student.online).length;
  const averageScore = (STUDENTS.reduce((sum, student) => sum + student.score, 0) / STUDENTS.length).toFixed(1);
  const completed = STUDENTS.filter((student) => student.score >= 3).length;

  return (
    <main className="teacher-shell">
      <aside className="teacher-sidebar">
        <div className="teacher-brand"><span>🌱</span><div><strong>BAO ONLINE</strong><small>Teacher Center</small></div></div>
        <nav>
          <button className="active">📊 ภาพรวม</button>
          <button disabled>👨‍🎓 นักเรียน</button>
          <button disabled>🎯 กิจกรรมชั้นเรียน</button>
          <button disabled>📈 วิเคราะห์ผล</button>
          <button disabled>📄 รายงาน</button>
        </nav>
        <div className="teacher-account"><div className="teacher-avatar">ครู</div><div><strong>ครูสรา</strong><small>ผู้ดูแลชั้น ป.6</small></div></div>
        <button className="teacher-exit" onClick={onExit}>← กลับหน้าหลัก</button>
      </aside>

      <section className="teacher-main">
        <header className="teacher-topbar">
          <div><p>โรงเรียนบ้านเหล่าพ่อหา</p><h1>ศูนย์ควบคุมชั้นเรียน</h1></div>
          <div className="teacher-live"><span /> ระบบจำลองข้อมูลในเครื่อง</div>
        </header>

        <section className="teacher-cards">
          <article><span>👨‍🎓</span><div><small>นักเรียนทั้งหมด</small><strong>{STUDENTS.length}</strong><em>ชั้นประถมศึกษาปีที่ 6</em></div></article>
          <article><span>🟢</span><div><small>กำลังออนไลน์</small><strong>{onlineCount}</strong><em>{STUDENTS.length - onlineCount} คนออฟไลน์</em></div></article>
          <article><span>✅</span><div><small>จบบทเรียนแล้ว</small><strong>{completed}</strong><em>นักแยกสารตัวน้อย</em></div></article>
          <article><span>⭐</span><div><small>คะแนนเฉลี่ย</small><strong>{averageScore}/3</strong><em>ผลการเรียนรู้ล่าสุด</em></div></article>
        </section>

        <section className="teacher-panel">
          <div className="teacher-panel-head">
            <div><h2>รายชื่อนักเรียน</h2><p>ติดตามสถานะและความก้าวหน้าใน BAO Online</p></div>
            <div className="teacher-tools">
              <label>🔎<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ ทีม หรือสถานที่" /></label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">ทุกสถานะ</option><option value="online">ออนไลน์</option><option value="offline">ออฟไลน์</option></select>
            </div>
          </div>

          <div className="teacher-table-wrap">
            <table className="teacher-table">
              <thead><tr><th>นักเรียน</th><th>สถานะ</th><th>ทีม</th><th>Level / EXP</th><th>เหรียญ</th><th>Badge</th><th>คะแนน</th><th /></tr></thead>
              <tbody>{filtered.map((student) => <tr key={student.id}>
                <td><div className="student-name"><span>{student.name.slice(-1)}</span><div><strong>{student.name}</strong><small>{student.classroom} · เลขที่ {student.number}</small></div></div></td>
                <td><span className={`status-pill ${student.online ? 'online' : 'offline'}`}>{student.online ? '● ออนไลน์' : '● ออฟไลน์'}</span><small className="activity-text">{student.activity}</small></td>
                <td><span className="team-pill">{student.team}</span></td>
                <td><strong>Lv. {student.level}</strong><div className="mini-progress"><i style={{ width: `${student.exp}%` }} /></div><small>{student.exp}/100 EXP</small></td>
                <td>🪙 {student.coin}</td><td>🏅 {student.badges}</td><td><strong>{student.score}/3</strong></td>
                <td><button className="detail-button" onClick={() => setSelected(student)}>ดูข้อมูล</button></td>
              </tr>)}</tbody>
            </table>
            {filtered.length === 0 && <div className="empty-students">ไม่พบนักเรียนที่ตรงกับการค้นหา</div>}
          </div>
        </section>
      </section>

      {selected && <div className="teacher-modal" onClick={() => setSelected(null)}><section onClick={(event) => event.stopPropagation()}><button onClick={() => setSelected(null)}>×</button><div className="student-big-avatar">{selected.name.slice(-1)}</div><h2>{selected.name}</h2><p>{selected.classroom} · เลขที่ {selected.number} · {selected.team}</p><div className="student-detail-grid"><span><small>สถานะ</small><strong>{selected.online ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}</strong></span><span><small>ตำแหน่งล่าสุด</small><strong>{selected.activity}</strong></span><span><small>ความก้าวหน้า</small><strong>Lv. {selected.level} · {selected.exp} EXP</strong></span><span><small>ผลบทเรียน</small><strong>{selected.score}/3 คะแนน</strong></span><span><small>เหรียญ</small><strong>🪙 {selected.coin}</strong></span><span><small>เหรียญตรา</small><strong>🏅 {selected.badges}</strong></span></div></section></div>}
    </main>
  );
}
