import { useEffect, useRef, useState } from 'react';
import { createGame } from './game/createGame.js';

const DEFAULT_PLAYER = {
  username: '',
  character: 'boy',
  name: 'นักเรียนบ้านเฮา',
  level: 1,
  exp: 0,
  coin: 100,
  quest: { accepted: false, progress: 0, target: 3, completed: false, claimed: false },
};

function loadPlayer() {
  try {
    return { ...DEFAULT_PLAYER, ...JSON.parse(localStorage.getItem('bao-player') || '{}') };
  } catch {
    return DEFAULT_PLAYER;
  }
}

function sendKey(key, type) {
  window.dispatchEvent(new KeyboardEvent(type, { key, code: key, bubbles: true }));
}

function HoldButton({ label, keyName, className = '' }) {
  const press = (event) => {
    event.preventDefault();
    sendKey(keyName, 'keydown');
  };
  const release = (event) => {
    event.preventDefault();
    sendKey(keyName, 'keyup');
  };
  return <button className={`touch-btn ${className}`} onPointerDown={press} onPointerUp={release} onPointerCancel={release} onPointerLeave={release}>{label}</button>;
}

export default function App() {
  const gameRef = useRef(null);
  const [screen, setScreen] = useState('login');
  const [username, setUsername] = useState('KruSara');
  const [player, setPlayer] = useState(loadPlayer);
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    localStorage.setItem('bao-player', JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    if (screen !== 'world') return undefined;
    gameRef.current = createGame('game', {
      player,
      onPlace: (place) => setPanel({ type: 'place', ...place }),
      onNpc: () => setPanel({ type: 'npc' }),
      onCollect: () => {
        setPlayer((current) => {
          if (!current.quest.accepted || current.quest.completed) return current;
          const progress = Math.min(current.quest.progress + 1, current.quest.target);
          return { ...current, quest: { ...current.quest, progress, completed: progress >= current.quest.target } };
        });
      },
    });
    return () => gameRef.current?.destroy(true);
  }, [screen]);

  const login = (event) => {
    event.preventDefault();
    if (!username.trim()) return;
    setPlayer((current) => ({ ...current, username: username.trim() }));
    setScreen('character');
  };

  const chooseCharacter = (character) => {
    setPlayer((current) => ({ ...current, character, name: character === 'girl' ? 'น้องข้าวหอม' : 'น้องต้นกล้า' }));
    setScreen('world');
  };

  const acceptQuest = () => {
    setPlayer((current) => ({ ...current, quest: { accepted: true, progress: 0, target: 3, completed: false, claimed: false } }));
    setPanel(null);
  };

  const claimReward = () => {
    setPlayer((current) => {
      if (!current.quest.completed || current.quest.claimed) return current;
      const totalExp = current.exp + 120;
      return {
        ...current,
        level: current.level + Math.floor(totalExp / 100),
        exp: totalExp % 100,
        coin: current.coin + 50,
        quest: { ...current.quest, claimed: true },
      };
    });
    setPanel({ type: 'reward' });
  };

  if (screen === 'login') {
    return (
      <main className="splash login-screen">
        <div className="sky-cloud cloud-one" /><div className="sky-cloud cloud-two" />
        <section className="login-card game-panel">
          <div className="brand-lockup"><div className="logo">BAO <span>ONLINE</span></div><div className="leaf-mark">🌱</div></div>
          <h1>บ้านเฮาออนไลน์</h1>
          <p className="subtitle">โรงเรียนบ้านเหล่าพ่อหา · โลกแห่งการเรียนรู้</p>
          <form onSubmit={login}>
            <label htmlFor="username">ชื่อผู้เล่น</label>
            <div className="input-frame"><span>👤</span><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={24} /></div>
            <button className="primary start-button" type="submit">เข้าสู่บ้านเฮา</button>
          </form>
          <small>V0.2 · บันทึกความก้าวหน้าในอุปกรณ์นี้</small>
        </section>
      </main>
    );
  }

  if (screen === 'character') {
    return (
      <main className="splash character-screen">
        <section className="select-card game-panel">
          <header className="select-heading"><span>เลือกตัวละคร</span><small>ผู้เล่น: {player.username}</small></header>
          <div className="character-grid">
            <button onClick={() => chooseCharacter('boy')}>
              <img src="/assets/player-boy.svg" alt="นักเรียนชาย" />
              <span>น้องต้นกล้า</span><small>นักเรียนชาย</small><em>เลือกตัวละครนี้</em>
            </button>
            <button onClick={() => chooseCharacter('girl')}>
              <img src="/assets/player-girl.svg" alt="นักเรียนหญิง" />
              <span>น้องข้าวหอม</span><small>นักเรียนหญิง</small><em>เลือกตัวละครนี้</em>
            </button>
          </div>
          <button className="secondary back-button" onClick={() => setScreen('login')}>← ย้อนกลับ</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="hud">
        <div className="identity">
          <span className="avatar"><img src={player.character === 'girl' ? '/assets/player-girl.svg' : '/assets/player-boy.svg'} alt="ตัวละคร" /></span>
          <div><h1>บ้านเฮาออนไลน์</h1><p>{player.name} · {player.username}</p></div>
        </div>
        <div className="stats"><span>Lv. {player.level}</span><span>EXP {player.exp}%</span><span>🪙 {player.coin}</span></div>
      </header>

      <section className="game-wrap">
        <section id="game" className="game" />
        <aside className="quest-widget">
          <strong>📜 ภารกิจแรก</strong>
          {!player.quest.accepted && <p>คุยกับครูภูมิปัญญา</p>}
          {player.quest.accepted && !player.quest.claimed && <p>เก็บต้นกล้า {player.quest.progress}/{player.quest.target}</p>}
          {player.quest.claimed && <p>✅ รับรางวัลแล้ว</p>}
          {player.quest.completed && !player.quest.claimed && <button onClick={claimReward}>รับรางวัล</button>}
        </aside>

        <div className="mobile-controls" aria-label="ปุ่มควบคุมเกม">
          <div className="dpad">
            <HoldButton label="▲" keyName="ArrowUp" className="up" />
            <HoldButton label="◀" keyName="ArrowLeft" className="left" />
            <HoldButton label="▼" keyName="ArrowDown" className="down" />
            <HoldButton label="▶" keyName="ArrowRight" className="right" />
          </div>
          <button className="action-btn" onPointerDown={(event) => { event.preventDefault(); sendKey('KeyE', 'keydown'); setTimeout(() => sendKey('KeyE', 'keyup'), 100); }}>E<br /><small>คุย</small></button>
        </div>
      </section>
      <footer className="help">WASD/ปุ่มลูกศร เพื่อเดิน · Shift เพื่อวิ่ง · E เพื่อคุยหรือเข้าอาคาร</footer>

      {panel && (
        <div className="overlay" onClick={() => setPanel(null)}>
          <section className="dialog" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setPanel(null)}>×</button>
            {panel.type === 'npc' && <>
              <img className="dialog-avatar" src="/assets/npc-teacher.svg" alt="ครูภูมิปัญญา" /><h2>ครูภูมิปัญญา</h2>
              {!player.quest.accepted && <><p>ช่วยครูเก็บต้นกล้าในบริเวณโรงเรียนให้ครบ 3 ต้น แล้วกลับมารับรางวัลนะ</p><button className="primary" onClick={acceptQuest}>รับภารกิจ</button></>}
              {player.quest.accepted && !player.quest.completed && <p>ตอนนี้เก็บได้ {player.quest.progress}/{player.quest.target} ต้น สู้ ๆ นะ</p>}
              {player.quest.completed && !player.quest.claimed && <><p>ทำได้ดีมาก! พร้อมรับ EXP 120 และเหรียญ 50</p><button className="primary" onClick={claimReward}>รับรางวัล</button></>}
              {player.quest.claimed && <p>ขอบใจหลาย ๆ ไปสำรวจบ้านเฮาต่อได้เลย</p>}
            </>}
            {panel.type === 'place' && <><div className="place-icon">{panel.icon}</div><h2>{panel.name}</h2><p>{panel.description}</p><button className="primary" onClick={() => setPanel(null)}>กลับเข้าเมือง</button></>}
            {panel.type === 'reward' && <><div className="place-icon">🎁</div><h2>ภารกิจสำเร็จ!</h2><p>ได้รับ EXP 120 และเหรียญ 50</p><button className="primary" onClick={() => setPanel(null)}>เยี่ยมเลย</button></>}
          </section>
        </div>
      )}
    </main>
  );
}
