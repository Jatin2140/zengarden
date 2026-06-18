import React, { useState, useEffect } from 'react';
import { CloudRain, Waves, Wind, Music, Headphones } from 'lucide-react';
import { audioManager } from '../audio';

export default function SoundSanctuary({ onAction }) {
  const [sounds, setSounds] = useState([
    {
      id: 'rain',
      name: 'Soft Rain',
      desc: 'Synthetic pink-filtered ambient rain',
      icon: CloudRain,
      active: false,
      volume: 0.5
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      desc: 'LFO-modulated deep rushing tide',
      icon: Waves,
      active: false,
      volume: 0.5
    },
    {
      id: 'wind',
      name: 'Deep Wind',
      desc: 'Slowing resonant wind gusts',
      icon: Wind,
      active: false,
      volume: 0.4
    },
    {
      id: 'chimes',
      name: 'Wind Chimes',
      desc: 'Randomly generated pentatonic metal chimes',
      icon: Music,
      active: false,
      volume: 0.6
    },
    {
      id: 'binaural',
      name: 'Binaural Beats',
      desc: 'Detuned theta hum (6Hz focus)',
      icon: Headphones,
      active: false,
      volume: 0.3
    }
  ]);

  // Clean up all sounds when component unmounts
  useEffect(() => {
    return () => {
      audioManager.stopAll();
    };
  }, []);

  const handleToggle = (id) => {
    setSounds(prevSounds => {
      return prevSounds.map(sound => {
        if (sound.id === id) {
          const nextActive = !sound.active;
          
          if (nextActive) {
            audioManager.start(sound.id, sound.volume);
            onAction('sound-on', 3);
          } else {
            audioManager.stop(sound.id);
          }

          return { ...sound, active: nextActive };
        }
        return sound;
      });
    });
  };

  const handleVolumeChange = (id, newVolume) => {
    setSounds(prevSounds => {
      return prevSounds.map(sound => {
        if (sound.id === id) {
          audioManager.setVolume(sound.id, newVolume);
          return { ...sound, volume: newVolume };
        }
        return sound;
      });
    });
  };

  return (
    <div className="glass-panel sounds-container">
      {sounds.map((sound) => {
        const IconComponent = sound.icon;
        return (
          <div 
            key={sound.id} 
            className={`sound-card ${sound.active ? 'active' : ''}`}
          >
            <div className="sound-card-header">
              <div className="sound-info">
                <div className="sound-icon-wrapper">
                  <IconComponent size={20} />
                </div>
                <div className="sound-details">
                  <h3>{sound.name}</h3>
                  <p>{sound.desc}</p>
                </div>
              </div>
              
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={sound.active} 
                  onChange={() => handleToggle(sound.id)}
                />
                <span className="slider-toggle"></span>
              </label>
            </div>
            
            <div className="volume-control">
              <span style={{ fontSize: '0.75rem', opacity: 0.6, width: '22px' }}>VOL</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={sound.volume} 
                onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                disabled={!sound.active}
                className="volume-slider"
              />
              
              <div className="card-visualizer">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
