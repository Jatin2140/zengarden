import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart } from 'lucide-react';

export default function GratitudeJar({ onAction, theme }) {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('zengarden_notes');
    return saved ? JSON.parse(saved) : [
      { text: 'Peaceful moments in nature', date: Date.now() - 86400000 },
      { text: 'A warm cup of tea this morning', date: Date.now() - 40000000 },
      { text: 'Pair programming on this cool react app!', date: Date.now() - 10000000 }
    ];
  });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const [hoveredNote, setHoveredNote] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Load particles from saved notes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Initialize particles inside the jar
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      particlesRef.current = notes.map((note, index) => {
        // Distribute existing notes inside the jar
        const y = cy + (Math.random() * 100 - 30);
        const limitX = getJarWidthAtY(y, canvas.height) - 15;
        const x = cx + (Math.random() * limitX * 2 - limitX);

        return {
          id: index,
          text: note.text,
          x,
          y,
          vx: (Math.random() * 0.4 - 0.2),
          vy: -(Math.random() * 0.3 + 0.1),
          radius: Math.random() * 6 + 4,
          glowRadius: Math.random() * 20 + 10,
          color: theme === 'midnight' ? '#64ffda' : '#ffb74d',
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01
        };
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [notes, theme]);

  // Math: Calculate internal width of the jar at a given Y coordinate
  const getJarWidthAtY = (y, canvasHeight) => {
    const jarTop = 60;
    const neckY = 110;
    const shoulderY = 150;
    const jarBottom = canvasHeight - 50;

    if (y < jarTop || y > jarBottom) return 0;
    
    // Narrow neck
    if (y < neckY) {
      return 35; 
    }
    // Curve out from neck to shoulders
    if (y < shoulderY) {
      const pct = (y - neckY) / (shoulderY - neckY);
      return 35 + pct * 50; // morphs from 35 to 85
    }
    // Wide jar body
    return 85;
  };

  // Particle updates loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const h = canvas.height;

      // Draw the glass jar outline
      drawJarOutline(ctx, cx, h);

      // Update and draw fireflies
      particlesRef.current.forEach(p => {
        // Floating motion using sine waves
        p.angle += p.speed;
        p.x += p.vx + Math.sin(p.angle) * 0.15;
        p.y += p.vy;

        // Boundaries checks against jar walls
        const maxW = getJarWidthAtY(p.y, h) - p.radius - 5;
        
        // Bounce off left/right jar walls
        if (p.x < cx - maxW) {
          p.x = cx - maxW;
          p.vx *= -1;
        } else if (p.x > cx + maxW) {
          p.x = cx + maxW;
          p.vx *= -1;
        }

        // Float up to the jar neck/top and float back down (loop)
        const jarTopLimit = 75;
        const jarBottomLimit = h - 60;
        if (p.y < jarTopLimit) {
          p.y = jarBottomLimit;
          p.x = cx + (Math.random() * 40 - 20);
        }

        // Draw glowing aura
        const gradient = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.glowRadius);
        const colorBase = theme === 'midnight' ? '100, 255, 218' : theme === 'dawn' ? '255, 107, 107' : '255, 126, 95';
        gradient.addColorStop(0, `rgba(${colorBase}, 0.8)`);
        gradient.addColorStop(0.3, `rgba(${colorBase}, 0.25)`);
        gradient.addColorStop(1, `rgba(${colorBase}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [theme]);

  // Helper: Draw the Jar path
  const drawJarOutline = (ctx, cx, h) => {
    const jarTop = 60;
    const neckY = 110;
    const shoulderY = 150;
    const jarBottom = h - 50;

    ctx.strokeStyle = theme === 'dawn' ? 'rgba(60, 40, 40, 0.25)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shadow glow of the jar itself
    ctx.shadowColor = theme === 'midnight' ? 'rgba(100, 255, 218, 0.15)' : 'rgba(255, 255, 255, 0.05)';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    // Lid / Top Lip
    ctx.moveTo(cx - 40, jarTop);
    ctx.lineTo(cx + 40, jarTop);
    
    // Neck Left
    ctx.moveTo(cx - 35, jarTop);
    ctx.lineTo(cx - 35, neckY);
    // Shoulder Left
    ctx.quadraticCurveTo(cx - 35, shoulderY - 15, cx - 85, shoulderY);
    // Body Left
    ctx.lineTo(cx - 85, jarBottom - 15);
    // Bottom Corner Left
    ctx.quadraticCurveTo(cx - 85, jarBottom, cx - 70, jarBottom);
    
    // Base
    ctx.lineTo(cx + 70, jarBottom);
    
    // Bottom Corner Right
    ctx.quadraticCurveTo(cx + 85, jarBottom, cx + 85, jarBottom - 15);
    // Body Right
    ctx.lineTo(cx + 85, shoulderY);
    // Shoulder Right
    ctx.quadraticCurveTo(cx + 35, shoulderY - 15, cx + 35, neckY);
    // Neck Right
    ctx.lineTo(cx + 35, jarTop);
    
    ctx.stroke();

    // Draw glass highlights inside
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.arc(cx - 65, shoulderY + 25, 30, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // Reset shadow values for next draw
    ctx.shadowBlur = 0;
  };

  // Handle pointer hover detection for tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = null;
    particlesRef.current.forEach(p => {
      // Hit test: distance formula
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < p.glowRadius) {
        found = p;
      }
    });

    if (found) {
      setHoveredNote(found.text);
      // Tooltip position offsets
      setTooltipPos({
        x: found.x,
        y: found.y - 45
      });
    } else {
      setHoveredNote(null);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      text: noteText.trim(),
      date: Date.now()
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('zengarden_notes', JSON.stringify(updated));
    setNoteText('');
    
    // Trigger experience event
    onAction('gratitude', 20);

    // Spawn a float-up effect in particle array
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2;
      const newParticle = {
        id: Date.now(),
        text: newNote.text,
        x: cx,
        y: canvas.height - 80,
        vx: (Math.random() * 0.4 - 0.2),
        vy: -(Math.random() * 0.5 + 0.6), // float up fast initially
        radius: 8, // larger initial burst
        glowRadius: 28,
        color: theme === 'midnight' ? '#64ffda' : '#ffb74d',
        angle: Math.random() * Math.PI * 2,
        speed: 0.03
      };
      particlesRef.current.push(newParticle);
    }
  };

  return (
    <div className="glass-panel gratitude-container">
      <div className="gratitude-form-section">
        <h2>The Gratitude Jar</h2>
        <p>
          Reflecting on positive moments increases mindfulness. Type a brief sentence about something you're grateful for, then release it to fill the jar.
        </p>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="textarea-wrapper">
            <textarea
              className="gratitude-textarea"
              placeholder="I am grateful for..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              maxLength={120}
            />
            <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '0.8rem', opacity: 0.5 }}>
              {noteText.length}/120
            </div>
          </div>

          <button 
            type="submit" 
            className="accent-btn" 
            disabled={!noteText.trim()}
          >
            <Send size={16} />
            Release into Jar
          </button>
        </form>
      </div>

      <div className="jar-visualizer-section" ref={containerRef}>
        <div className="jar-canvas-container" onMouseMove={handleMouseMove}>
          <canvas ref={canvasRef} />
          
          {/* Tooltip Overlay */}
          <div 
            className={`gratitude-tooltip ${hoveredNote ? 'visible' : ''}`}
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px`,
              transform: hoveredNote ? 'translate(-50%, -100%) scale(1)' : 'translate(-50%, -100%) scale(0.9)'
            }}
          >
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.25rem', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.75rem' }}>
              <Heart size={10} fill="currentColor" />
              Gratitude
            </div>
            {hoveredNote}
          </div>
        </div>
      </div>
    </div>
  );
}
