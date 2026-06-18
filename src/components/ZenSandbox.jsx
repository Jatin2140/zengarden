import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Grid, RefreshCw, Star, Trash2 } from 'lucide-react';

export default function ZenSandbox({ onAction, theme }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeTool, setActiveTool] = useState('rake-3'); // rake-1, rake-3, rake-5, ripple
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const pointsDrawnRef = useRef(0);

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      clearCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Clear/reset canvas with base texture
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear fully transparent so the CSS background shows through
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Trigger sweep animation and clear
  const handleReset = () => {
    setIsSweeping(true);
    onAction('reset', 2);
    setTimeout(() => {
      clearCanvas();
      setIsSweeping(false);
    }, 1000);
  };

  // Helper: Draw 3D-effect sand groove (dark valley + light peak)
  const drawGroove = (ctx, x1, y1, x2, y2, offset = 0, size = 3) => {
    // Math to get perpendicular offset vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const nx = (-dy / len) * offset;
    const ny = (dx / len) * offset;

    const ox1 = x1 + nx;
    const oy1 = y1 + ny;
    const ox2 = x2 + nx;
    const oy2 = y2 + ny;

    // Draw the valley (dark, shadow)
    ctx.beginPath();
    ctx.moveTo(ox1, oy1);
    ctx.lineTo(ox2, oy2);
    ctx.strokeStyle = theme === 'dawn' ? 'rgba(60, 40, 40, 0.12)' : 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw the peak (light, highlights) offset slightly
    ctx.beginPath();
    ctx.moveTo(ox1 + 1.5, oy1 + 1.5);
    ctx.lineTo(ox2 + 1.5, oy2 + 1.5);
    ctx.strokeStyle = theme === 'dawn' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = size * 0.75;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // Draw smooth expanding circle ripples on click
  const drawRipple = (ctx, cx, cy) => {
    let radius = 0;
    const maxRadius = Math.random() * 80 + 50;
    const speed = 2.5;

    const animateRipple = () => {
      if (radius < maxRadius) {
        // Redraw current step onto the canvas permanently (creates permanent concentric rings)
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        
        // Dynamic fading color based on radius
        const opacity = (1 - (radius / maxRadius)) * 0.15;
        ctx.strokeStyle = theme === 'dawn' ? `rgba(60, 40, 40, ${opacity})` : `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 1, cy + 1, radius, 0, Math.PI * 2);
        ctx.strokeStyle = theme === 'dawn' ? `rgba(255, 255, 255, ${opacity * 2.5})` : `rgba(0, 0, 0, ${opacity * 1.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        radius += speed;
        requestAnimationFrame(animateRipple);
      }
    };

    animateRipple();
    onAction('ripple', 5);
  };

  // Get pointer coordinates relative to canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    // Check if it is a touch event or mouse event
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Mouse event handlers (React standard)
  const handleMouseDown = (e) => {
    const pos = getCoordinates(e);
    lastPosRef.current = pos;
    setIsDrawing(true);

    if (activeTool === 'ripple') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      drawRipple(ctx, pos.x, pos.y);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || activeTool === 'ripple') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getCoordinates(e);
    const last = lastPosRef.current;

    // Draw pattern based on tool
    if (activeTool === 'rake-1') {
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 6);
    } else if (activeTool === 'rake-3') {
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, -8, 4);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 4);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 8, 4);
    } else if (activeTool === 'rake-5') {
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, -16, 3);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, -8, 3);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 3);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 8, 3);
      drawGroove(ctx, last.x, last.y, pos.x, pos.y, 16, 3);
    }

    // Accumulate points for Zen leveling
    pointsDrawnRef.current += 1;
    if (pointsDrawnRef.current >= 40) {
      onAction('rake', 1);
      pointsDrawnRef.current = 0;
    }

    lastPosRef.current = pos;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Native touch event listeners to override passive-mode scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isTouchDrawing = false;

    const onTouchStart = (e) => {
      // Prevent browser viewport scrolling when touching the canvas
      if (e.cancelable) {
        e.preventDefault();
      }

      isTouchDrawing = true;
      setIsDrawing(true);
      const pos = getCoordinates(e);
      lastPosRef.current = pos;

      if (activeTool === 'ripple') {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          drawRipple(ctx, pos.x, pos.y);
        }
      }
    };

    const onTouchMove = (e) => {
      // Lock viewport scrolling
      if (e.cancelable) {
        e.preventDefault();
      }

      if (!isTouchDrawing || activeTool === 'ripple') return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const pos = getCoordinates(e);
      const last = lastPosRef.current;

      // Draw pattern based on tool
      if (activeTool === 'rake-1') {
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 6);
      } else if (activeTool === 'rake-3') {
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, -8, 4);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 4);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 8, 4);
      } else if (activeTool === 'rake-5') {
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, -16, 3);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, -8, 3);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 0, 3);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 8, 3);
        drawGroove(ctx, last.x, last.y, pos.x, pos.y, 16, 3);
      }

      pointsDrawnRef.current += 1;
      if (pointsDrawnRef.current >= 40) {
        onAction('rake', 1);
        pointsDrawnRef.current = 0;
      }

      lastPosRef.current = pos;
    };

    const onTouchEnd = (e) => {
      isTouchDrawing = false;
      setIsDrawing(false);
    };

    // Attach listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });
    container.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [activeTool, isDrawing, theme]);

  return (
    <div className="glass-panel sandbox-card">
      <div className="sandbox-header">
        <div className="sandbox-title">
          <h2>Zen Sandbox</h2>
          <p>Drag to rake patterns in the sand. Click to create water ripples.</p>
        </div>
        
        <div className="sandbox-controls">
          <button 
            className={`tool-btn ${activeTool === 'rake-1' ? 'active' : ''}`}
            onClick={() => setActiveTool('rake-1')}
            title="Single Rake"
          >
            <Eraser size={16} />
            Single
          </button>
          <button 
            className={`tool-btn ${activeTool === 'rake-3' ? 'active' : ''}`}
            onClick={() => setActiveTool('rake-3')}
            title="3-Prong Rake"
          >
            <Grid size={16} />
            3-Prong
          </button>
          <button 
            className={`tool-btn ${activeTool === 'rake-5' ? 'active' : ''}`}
            onClick={() => setActiveTool('rake-5')}
            title="5-Prong Rake"
          >
            <Grid size={16} />
            5-Prong
          </button>
          <button 
            className={`tool-btn ${activeTool === 'ripple' ? 'active' : ''}`}
            onClick={() => setActiveTool('ripple')}
            title="Ripple Drop"
          >
            <Star size={16} />
            Ripple
          </button>
          
          <button 
            className="tool-btn" 
            onClick={handleReset}
            title="Clear Garden"
            style={{ marginLeft: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div 
        className="canvas-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} />
        <div className={`sweep-overlay ${isSweeping ? 'animate' : ''}`} />
      </div>
    </div>
  );
}
