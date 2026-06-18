import React, { useState, useEffect } from 'react';
import { Sun, Sunset, Moon, Award, Compass, Music, Wind, Heart, Sparkles } from 'lucide-react';
import ZenSandbox from './components/ZenSandbox';
import SoundSanctuary from './components/SoundSanctuary';
import BreathSync from './components/BreathSync';
import GratitudeJar from './components/GratitudeJar';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('sandbox'); // sandbox, sounds, breathing, gratitude
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('zengarden_theme');
    return saved || 'sunset'; // dawn, sunset, midnight
  });
  
  const [zenXP, setZenXP] = useState(() => {
    const saved = localStorage.getItem('zengarden_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('zengarden_stats');
    return saved ? JSON.parse(saved) : { rakes: 0, breaths: 0, gratitudes: 0 };
  });

  const [pulseBadge, setPulseBadge] = useState(false);

  // Sync theme to body class for global variables transitions
  useEffect(() => {
    const body = document.body;
    body.className = ''; // reset classes
    body.classList.add(`theme-${theme}`);
    localStorage.setItem('zengarden_theme', theme);
  }, [theme]);

  // Action hook to award XP and update statistics
  const handleAction = (type, xpReward) => {
    setZenXP(prev => {
      const next = prev + xpReward;
      localStorage.setItem('zengarden_xp', next.toString());
      return next;
    });

    setStats(prev => {
      const next = { ...prev };
      if (type === 'rake') next.rakes += 1;
      if (type === 'breathe') next.breaths += 1;
      if (type === 'gratitude') next.gratitudes += 1;
      localStorage.setItem('zengarden_stats', JSON.stringify(next));
      return next;
    });

    // Pulse the badge
    setPulseBadge(true);
    setTimeout(() => setPulseBadge(false), 500);
  };

  const level = Math.floor(zenXP / 100) + 1;
  const progressPercent = zenXP % 100;

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Header Bar */}
      <header className="glass-panel header-bar">
        <div className="brand">
          <h1>ZenGarden</h1>
          <p>Mindful Sensory Space</p>
        </div>
        
        <div className="header-controls">
          {/* XP Badge */}
          <div className={`level-badge ${pulseBadge ? 'pulse' : ''}`}>
            <Award size={18} />
            <span>Lv. {level}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{progressPercent}/100 XP</span>
          </div>

          {/* Theme Switcher */}
          <div className="theme-selector">
            <button 
              className={`theme-btn ${theme === 'dawn' ? 'active' : ''}`}
              onClick={() => setTheme('dawn')}
            >
              <Sun size={14} />
              Dawn
            </button>
            <button 
              className={`theme-btn ${theme === 'sunset' ? 'active' : ''}`}
              onClick={() => setTheme('sunset')}
            >
              <Sunset size={14} />
              Sunset
            </button>
            <button 
              className={`theme-btn ${theme === 'midnight' ? 'active' : ''}`}
              onClick={() => setTheme('midnight')}
            >
              <Moon size={14} />
              Midnight
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('sandbox')}
        >
          <Compass size={18} />
          <span>Zen Sandbox</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('sounds')}
        >
          <Music size={18} />
          <span>Sound Sanctuary</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={18} />
          <span>Breath Sync</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'gratitude' ? 'active' : ''}`}
          onClick={() => setActiveTab('gratitude')}
        >
          <Heart size={18} />
          <span>Gratitude Jar</span>
        </button>
      </nav>

      {/* Primary Tab Content Area */}
      <main className="tab-content">
        <div className="dashboard-grid">
          {activeTab === 'sandbox' && (
            <ZenSandbox onAction={handleAction} theme={theme} />
          )}
          {activeTab === 'sounds' && (
            <SoundSanctuary onAction={handleAction} />
          )}
          {activeTab === 'breathing' && (
            <BreathSync onAction={handleAction} />
          )}
          {activeTab === 'gratitude' && (
            <GratitudeJar onAction={handleAction} theme={theme} />
          )}
        </div>
      </main>

      {/* Bottom Stats Summary */}
      <footer className="stats-summary-row">
        <div className="glass-panel stat-item">
          <div className="stat-icon">
            <Sparkles size={20} />
          </div>
          <div className="stat-data">
            <h4>Sand Grooves Made</h4>
            <p>{stats.rakes}</p>
          </div>
        </div>
        <div className="glass-panel stat-item">
          <div className="stat-icon">
            <Wind size={20} />
          </div>
          <div className="stat-data">
            <h4>Breathing Cycles</h4>
            <p>{stats.breaths}</p>
          </div>
        </div>
        <div className="glass-panel stat-item">
          <div className="stat-icon">
            <Heart size={20} />
          </div>
          <div className="stat-data">
            <h4>Gratitudes Shared</h4>
            <p>{stats.gratitudes}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
