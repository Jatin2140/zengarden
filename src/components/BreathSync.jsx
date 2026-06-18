import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';

const PRESETS = [
  {
    name: 'Box Breathing',
    desc: 'Equal duration stages for clarity and stress relief.',
    cycle: [
      { phase: 'inhale', text: 'Inhale', duration: 4 },
      { phase: 'hold', text: 'Hold', duration: 4 },
      { phase: 'exhale', text: 'Exhale', duration: 4 },
      { phase: 'hold', text: 'Hold', duration: 4 }
    ]
  },
  {
    name: 'Calming Breath (4-7-8)',
    desc: 'Deep relaxation method for sleep and anxiety control.',
    cycle: [
      { phase: 'inhale', text: 'Inhale', duration: 4 },
      { phase: 'hold', text: 'Hold', duration: 7 },
      { phase: 'exhale', text: 'Exhale', duration: 8 }
    ]
  },
  {
    name: 'Energizing Breath (6-2-4)',
    desc: 'Longer inhale to oxygenate and wake up the mind.',
    cycle: [
      { phase: 'inhale', text: 'Inhale', duration: 6 },
      { phase: 'hold', text: 'Hold', duration: 2 },
      { phase: 'exhale', text: 'Exhale', duration: 4 }
    ]
  }
];

export default function BreathSync({ onAction }) {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalCyclesCompleted, setTotalCyclesCompleted] = useState(0);

  const preset = PRESETS[selectedPresetIdx];
  const currentStep = preset.cycle[currentStepIdx];
  const timerRef = useRef(null);

  // Sound helper: Play a gentle chime on phase transition
  const playBreathCue = (frequency = 440) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Soft, non-harsh envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.05); // low volume
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    } catch (e) {
      // AudioContext might be blocked or unsupported
    }
  };

  // Start breathing exercise
  const startExercise = () => {
    setIsActive(true);
    setCurrentStepIdx(0);
    setSecondsRemaining(preset.cycle[0].duration);
    playBreathCue(523.25); // high pitch chime for start
  };

  // Stop breathing exercise
  const stopExercise = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Handle preset change
  const handlePresetSelect = (idx) => {
    setSelectedPresetIdx(idx);
    stopExercise();
    setSecondsRemaining(PRESETS[idx].cycle[0].duration);
    setCurrentStepIdx(0);
  };

  useEffect(() => {
    setSecondsRemaining(preset.cycle[0].duration);
  }, [selectedPresetIdx]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next step in cycle
          const nextStepIdx = (currentStepIdx + 1) % preset.cycle.length;
          setCurrentStepIdx(nextStepIdx);
          
          // Play sound cues on transition
          if (preset.cycle[nextStepIdx].phase === 'inhale') {
            playBreathCue(523.25); // C5
            // Finished a full cycle!
            setTotalCyclesCompleted(c => c + 1);
            onAction('breathe', 15);
          } else if (preset.cycle[nextStepIdx].phase === 'hold') {
            playBreathCue(587.33); // D5
          } else if (preset.cycle[nextStepIdx].phase === 'exhale') {
            playBreathCue(440.00); // A4
          }

          return preset.cycle[nextStepIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, currentStepIdx, selectedPresetIdx]);

  // Determine scaling class for SVG blob
  const getBlobClass = () => {
    if (!isActive) return 'exhale';
    return currentStep.phase;
  };

  return (
    <div className="glass-panel breath-card">
      <div className="breath-preset-select">
        {PRESETS.map((p, idx) => (
          <button
            key={p.name}
            className={`tool-btn ${selectedPresetIdx === idx ? 'active' : ''}`}
            onClick={() => handlePresetSelect(idx)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="breath-circle-wrapper">
        {/* Pulsing breathing SVG blob */}
        <svg viewBox="0 0 200 200" className={`breathing-svg-blob ${getBlobClass()}`}>
          <path
            d="M100,20 C140,20 180,60 180,100 C180,140 140,180 100,180 C60,180 20,140 20,100 C20,60 60,20 100,20 Z"
          />
        </svg>

        <div className="breath-text-container">
          <div className="breath-instruction">
            {isActive ? currentStep.text : 'Ready'}
          </div>
          <div className="breath-timer">
            {isActive ? `${secondsRemaining}s` : '0s'}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '420px', marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {preset.desc}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!isActive ? (
          <button className="accent-btn" onClick={startExercise}>
            <Play size={18} />
            Begin Meditation
          </button>
        ) : (
          <button className="accent-btn" onClick={stopExercise} style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--text-primary)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <Square size={18} />
            End Session
          </button>
        )}
      </div>

      {totalCyclesCompleted > 0 && (
        <div className="breath-stats-summary" style={{ marginTop: '1.5rem' }}>
          <span>Meditated cycles: <strong>{totalCyclesCompleted}</strong> (+{totalCyclesCompleted * 15} XP)</span>
        </div>
      )}
    </div>
  );
}
