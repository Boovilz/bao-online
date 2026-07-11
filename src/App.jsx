import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGame } from './game/createGame.js';

export default function App() {
  const gameRef = useRef(null);
  const [place, setPlace] = useState(null);

  useEffect(() => {
    gameRef.current = createGame('game', setPlace);
    return () => gameRef.current?.destroy(true);
  }, []);

  return (
    <main className="app">
      <header className="hud">
        <div>
          <h1>Banlao Academy Online</h1>
          <p>Main Town · Alpha 0.1</p>
        </div>
        <div className="stats"><span>Lv. 1</span><span>EXP 0%</span><span>Coin 100</span></div>
      </header>
      <section id="game" className="game" />
      <footer className="help">เดินด้วย WASD หรือปุ่มลูกศร · กด E เมื่ออยู่ใกล้อาคาร</footer>

      {place && (
        <div className="overlay" onClick={() => setPlace(null)}>
          <section className="dialog" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPlace(null)}>×</button>
            <div className="place-icon">{place.icon}</div>
            <h2>{place.name}</h2>
            <p>{place.description}</p>
            <button className="primary" onClick={() => setPlace(null)}>กลับเข้าเมือง</button>
          </section>
        </div>
      )}
    </main>
  );
}
