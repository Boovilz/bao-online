import { useMemo, useState } from 'react';
import './reports.css';

function downloadCsv(students) {
  const headers = ['เลขที่','ชื่อ','ทีม','สถานะ','Level','EXP','Coins','Badges','Score','Missions','Attempts','Trend'];
  const rows = students.map((s) => [s.number,s.name,s.team,s.status,s.level,s.exp,s.coin,s.badges,s.score,s.missions,s.attempts,s.trend]);
  const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bao-online-students.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsCenter({ students, events, feed }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? '');
  const [reportType, setReportType] = useState('classroom');
  const selected = students.find((s) => s.id === Number(studentId)) || students[0];
  const ranked = useMemo(() => [...students].sort((a,b) => (b.level * 100 + b.exp) - (a.level * 100 + a.exp)), [students]);
  const averageScore = students.reduce((sum,s) => sum + s.score, 0) / Math.max(1, students.length);
  const averageLevel = students.reduce((sum,s) => sum + s.level, 0) / Math.max(1, students.length);
  const attendance = { present: students.filter((s) => s.status === 'online').length, afk: students.filter((s) => s.status === 'afk').length, absent: students.filter((s) => s.status === 'offline').length };
  const print = (type) => { setReportType(type); window.setTimeout(() => window.print(), 80); };

  return <section className="reports-page">
    <header className="reports-toolbar"><div><h2>📄 Reports & Export Center</h2><p>สร้างรายงาน พิมพ์เอกสาร และส่งออกข้อมูลนักเรียน</p></div><select value={studentId} onChange={(e) => setStudentId(e.target.value)}>{students.map((s) => <option key={s.id} value={s.id}>{s.name} · เลขที่ {s.number}</option>)}</select></header>

    <section className="report-actions">
      <button onClick={() => print('classroom')}><span>🏫</span><strong>รายงานทั้งห้อง</strong><small>สรุปผลการเรียนและการเข้าใช้งาน</small></button>
      <button onClick={() => print('student')}><span>👨‍🎓</span><strong>รายงานรายบุคคล</strong><small>{selected?.name}</small></button>
      <button onClick={() => print('parent')}><span>👨‍👩‍👧</span><strong>รายงานผู้ปกครอง</strong><small>สรุปความก้าวหน้า 1 หน้า</small></button>
      <button onClick={() => print('certificate')}><span>🏅</span><strong>ใบประกาศนียบัตร</strong><small>Coding Mission Certificate</small></button>
      <button onClick={() => downloadCsv(students)}><span>📊</span><strong>ส่งออก CSV</strong><small>เปิดด้วย Excel หรือ Google Sheets</small></button>
      <button onClick={() => print('portfolio')}><span>📁</span><strong>Teacher Portfolio</strong><small>สถิติสำหรับรายงานและ PA</small></button>
    </section>

    <section className="report-overview">
      <article><small>นักเรียนทั้งหมด</small><strong>{students.length}</strong><em>ชั้นประถมศึกษาปีที่ 6</em></article>
      <article><small>คะแนนเฉลี่ย</small><strong>{averageScore.toFixed(1)}/3</strong><em>{Math.round((averageScore / 3) * 100)}%</em></article>
      <article><small>Level เฉลี่ย</small><strong>{averageLevel.toFixed(1)}</strong><em>ภารกิจรวม {students.reduce((sum,s) => sum + s.missions, 0)}</em></article>
      <article><small>กิจกรรมที่จัด</small><strong>{events.length}</strong><em>สำเร็จ {events.filter((e) => e.status === 'finished').length}</em></article>
    </section>

    <section className="report-grid">
      <article className="report-card"><h3>🏆 Leaderboard</h3>{ranked.slice(0,5).map((s,index) => <div className="leader-row" key={s.id}><b>{index + 1}</b><span>{s.name}<small>{s.team}</small></span><strong>Lv.{s.level} · {s.exp} EXP</strong></div>)}</article>
      <article className="report-card"><h3>📅 Attendance Snapshot</h3><div className="attendance-donut"><strong>{Math.round((attendance.present / students.length) * 100)}%</strong><small>กำลังเรียน</small></div><div className="attendance-legend"><span>🟢 มาเรียน {attendance.present}</span><span>🟡 AFK {attendance.afk}</span><span>⚪ ออฟไลน์ {attendance.absent}</span></div></article>
      <article className="report-card"><h3>🕘 บันทึกล่าสุด</h3><div className="report-feed">{feed.slice(0,6).map((item) => <p key={item.id}><time>{item.time}</time>{item.text}</p>)}</div></article>
    </section>

    <section className={`print-sheet print-${reportType}`}>
      {reportType === 'classroom' && <><h1>รายงานผลการเรียน BAO Online</h1><h2>โรงเรียนบ้านเหล่าพ่อหา · ชั้นประถมศึกษาปีที่ 6</h2><div className="print-stats"><span>นักเรียน <b>{students.length}</b></span><span>คะแนนเฉลี่ย <b>{averageScore.toFixed(1)}/3</b></span><span>Level เฉลี่ย <b>{averageLevel.toFixed(1)}</b></span><span>ภารกิจรวม <b>{students.reduce((sum,s) => sum + s.missions, 0)}</b></span></div><table><thead><tr><th>เลขที่</th><th>ชื่อ</th><th>ทีม</th><th>คะแนน</th><th>Level</th><th>ภารกิจ</th></tr></thead><tbody>{students.map((s) => <tr key={s.id}><td>{s.number}</td><td>{s.name}</td><td>{s.team}</td><td>{s.score}/3</td><td>{s.level}</td><td>{s.missions}</td></tr>)}</tbody></table></>}
      {reportType === 'student' && selected && <><h1>รายงานผลการเรียนรายบุคคล</h1><h2>{selected.name} · ป.6 เลขที่ {selected.number}</h2><div className="print-stats"><span>Level <b>{selected.level}</b></span><span>EXP <b>{selected.exp}</b></span><span>เหรียญ <b>{selected.coin}</b></span><span>Badge <b>{selected.badges}</b></span><span>คะแนน <b>{selected.score}/3</b></span><span>ภารกิจ <b>{selected.missions}</b></span></div><p>ข้อเสนอแนะ: ส่งเสริมให้ผู้เรียนทำภารกิจอย่างต่อเนื่อง ร่วมมือกับเพื่อน และทบทวนบทเรียนที่ยังไม่มั่นใจ</p></>}
      {reportType === 'parent' && selected && <><h1>รายงานความก้าวหน้าสำหรับผู้ปกครอง</h1><h2>{selected.name}</h2><ul><li>เข้าใช้งานล่าสุด: {selected.status === 'online' ? 'กำลังออนไลน์' : selected.status === 'afk' ? 'พักชั่วคราว' : 'ออฟไลน์'}</li><li>คะแนนบทเรียน: {selected.score}/3</li><li>ภารกิจสำเร็จ: {selected.missions}</li><li>Level ปัจจุบัน: {selected.level}</li><li>แนวโน้ม: {selected.trend >= 0 ? 'เพิ่มขึ้น' : 'ควรติดตาม'} {Math.abs(selected.trend)}%</li></ul><p>ครูผู้สอน: นายสราวุฒิ กุมภิโร</p></>}
      {reportType === 'certificate' && selected && <div className="certificate"><h1>Certificate of Achievement</h1><p>ขอมอบใบประกาศนียบัตรฉบับนี้ให้แก่</p><h2>{selected.name}</h2><p>เพื่อรับรองว่าได้ผ่านกิจกรรม</p><h3>Coding Rescue Mission</h3><small>BAO Online · โรงเรียนบ้านเหล่าพ่อหา</small></div>}
      {reportType === 'portfolio' && <><h1>สรุปผลการจัดการเรียนรู้ของครู</h1><h2>BAO Online Teacher Portfolio</h2><div className="print-stats"><span>นักเรียน <b>{students.length}</b></span><span>กิจกรรมที่จัด <b>{events.length}</b></span><span>กิจกรรมสำเร็จ <b>{events.filter((e) => e.status === 'finished').length}</b></span><span>ภารกิจนักเรียนรวม <b>{students.reduce((sum,s) => sum + s.missions,0)}</b></span><span>Badge รวม <b>{students.reduce((sum,s) => sum + s.badges,0)}</b></span><span>ผู้เรียนผ่านเกณฑ์ <b>{students.filter((s) => s.score >= 3).length}</b></span></div></>}
    </section>
  </section>;
}
