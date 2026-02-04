// App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(() => parseInt(localStorage.getItem('njCount')) || 0);
  const [target, setTarget] = useState(() => parseInt(localStorage.getItem('njTarget')) || 0);
  const [deityName, setDeityName] = useState(() => localStorage.getItem('njDeity') || '🙏 Jai Shri Ram 🙏');
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('njBgImage') || '');
  const [sound, setSound] = useState(() => localStorage.getItem('njSound') === 'true');
  const [running, setRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('njHistory')) || []);
  const [flash, setFlash] = useState(false);
  
  const audioContextRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playBeep = useCallback(() => {
    if (!sound || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [sound]);

  const playMalaComplete = useCallback(() => {
    if (!sound || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 1);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 1);
    });
  }, [sound]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('njCount', count);
    localStorage.setItem('njTarget', target);
    localStorage.setItem('njDeity', deityName);
    localStorage.setItem('njBgImage', bgImage);
    localStorage.setItem('njSound', sound);
    localStorage.setItem('njHistory', JSON.stringify(history));
  }, [count, target, deityName, bgImage, sound, history]);

  const incrementCount = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1;
      const prevMalas = Math.floor(prev / 108);
      const newMalas = Math.floor(newCount / 108);
      
      if (newMalas > prevMalas) {
        playMalaComplete();
        const entry = {
          mala: newMalas,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: Date.now()
        };
        setHistory(h => [...h, entry]);
      } else {
        playBeep();
      }
      
      return newCount;
    });
    
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  }, [playBeep, playMalaComplete]);

  const handleKeyPress = useCallback((e) => {
    if (e.target.tagName === 'INPUT') return;
    initAudio();
    if (running) {
      e.preventDefault();
      incrementCount();
    } else {
      setRunning(true);
    }
  }, [running, incrementCount, initAudio]);

  const handleTap = useCallback((e) => {
    if (e.target.closest('.menu-panel') || e.target.classList.contains('menu-btn')) return;
    initAudio();
    if (running) {
      incrementCount();
    } else {
      setRunning(true);
    }
  }, [running, incrementCount, initAudio]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startChanting = () => setRunning(true);
  const pauseChanting = () => setRunning(false);
  
  const resetCount = () => {
    if (!window.confirm('Reset all progress?')) return;
    setCount(0);
    setHistory([]);
  };

  const undoLast = () => {
    setCount(prev => {
      if (prev === 0) return 0;
      const newCount = prev - 1;
      const malas = Math.floor(newCount / 108);
      setHistory(h => h.filter(entry => entry.mala <= malas));
      return newCount;
    });
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const editDeityName = () => {
    const newName = prompt('Enter deity name:', deityName);
    if (newName?.trim()) setDeityName(newName.trim());
  };

  const malas = Math.floor(count / 108);
  const current = count % 108;
  const targetReached = target > 0 && malas >= target;

  return (
    <div 
      className="app" 
      onClick={handleTap}
      style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
    >
      <div className="overlay" />
      
      {!running && <div className="tap-hint">Tap anywhere or press any key to start</div>}
      
      <header className="header">
        <h1 className="deity-name">{deityName}</h1>
      </header>

      <main className="counter-area">
        <div className={`progress-ring ${flash ? 'flash' : ''}`} />
        <div className="main-count">{count}</div>
        <div className="mala-display">{malas} Malas • {current}/108</div>
        <div className={`target-display ${targetReached ? 'completed' : ''}`}>
          {target ? (
            targetReached 
              ? '🎉 Target Completed! 🎉' 
              : `Target: ${malas}/${target} Malas (${target - malas} remaining)`
          ) : 'Target: Not set'}
        </div>
      </main>

      <button className="menu-btn" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
        {showMenu ? '✕' : '⚙️'}
      </button>

      <div className={`menu-panel ${showMenu ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="settings-grid">
          <div className="setting-box">
            <label className="setting-label">Deity Name</label>
            <button className="btn btn-blue" onClick={editDeityName}>Edit Name</button>
          </div>
          
          <div className="setting-box">
            <label className="setting-label">Background</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBgChange}
              ref={fileInputRef}
              className="file-input"
            />
          </div>

          <div className="setting-box">
            <label className="setting-label">Target Malas</label>
            <input 
              type="number" 
              min="1" 
              value={target || ''} 
              onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
              className="number-input"
              placeholder="e.g., 5"
            />
          </div>

          <div className="setting-box">
            <label className="setting-label">Sound</label>
            <button 
              className={`btn ${sound ? 'btn-green' : 'btn-blue'}`} 
              onClick={() => { setSound(!sound); initAudio(); }}
            >
              {sound ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="controls-row">
          <button className="btn btn-gold" onClick={startChanting}>▶ Start</button>
          <button className="btn btn-gold" onClick={pauseChanting}>⏸ Pause</button>
          <button className="btn btn-red" onClick={resetCount}>↺ Reset</button>
          <button className="btn btn-red" onClick={undoLast}>↩ Undo</button>
        </div>

        <div className="history-section">
          <label className="setting-label">Mala Completion History</label>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-history">No malas completed yet</div>
            ) : (
              [...history].reverse().map(h => (
                <div key={h.id} className="history-item">
                  <span>Mala #{h.mala}</span>
                  <span className="history-time">{h.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
