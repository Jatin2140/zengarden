// Web Audio API Synthesis Library for ZenGarden Ambient Sounds

let audioCtx = null;
const activeSources = {};
const gainNodes = {};

// Safe initialization of AudioContext
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Helper: Create a loopable white noise buffer
function getNoiseBuffer(ctx, duration = 3.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// ----------------------------------------------------
// Sound generators
// ----------------------------------------------------

// 1. Rain Synthesizer
function createRainNode(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx, 4.0);
  noiseSource.loop = true;

  // Filter out harsh highs to sound like soft pattering rain
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 750;
  filter.Q.value = 0.5;

  // Second filter to add a subtle high-frequency rumble for droplets
  const dropletFilter = ctx.createBiquadFilter();
  dropletFilter.type = 'peaking';
  dropletFilter.frequency.value = 1200;
  dropletFilter.Q.value = 2.0;
  dropletFilter.gain.value = -3;

  noiseSource.connect(filter);
  filter.connect(dropletFilter);

  return {
    source: noiseSource,
    output: dropletFilter
  };
}

// 2. Ocean Waves Synthesizer (Modulated noise)
function createOceanNode(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx, 5.0);
  noiseSource.loop = true;

  // Bandpass filter for a deep rushing wave sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 350;
  filter.Q.value = 1.0;

  // Gain node to modulate volume
  const waveGain = ctx.createGain();
  waveGain.gain.value = 0.3;

  // LFO to modulate wave gain (8-second cycle)
  const lfo = ctx.createOscillator();
  lfo.type = 'triangle';
  lfo.frequency.value = 0.08; // 12 seconds per wave cycle

  // Map LFO to swell the volume
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.25; // range of modulation

  lfo.connect(lfoGain);
  lfoGain.connect(waveGain.gain); // Modulate volume

  noiseSource.connect(filter);
  filter.connect(waveGain);

  // Start LFO
  lfo.start();

  return {
    source: noiseSource,
    output: waveGain,
    extraNodes: [lfo, lfoGain]
  };
}

// 3. Wind Synthesizer (Modulated resonant filter)
function createWindNode(ctx) {
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = getNoiseBuffer(ctx, 6.0);
  noiseSource.loop = true;

  // Resonant bandpass filter to give wind its pitch
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 4.0; // Resonant peak

  // LFO to modulate filter frequency (wind gusts)
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05; // 20-second gusts

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200; // Gust range (200Hz up/down)

  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  noiseSource.connect(filter);

  lfo.start();

  return {
    source: noiseSource,
    output: filter,
    extraNodes: [lfo, lfoGain]
  };
}

// 4. Wind Chimes Synthesizer
let chimeIntervalId = null;
function createChimesNode(ctx) {
  // Master node for chimes output
  const chimesGain = ctx.createGain();
  chimesGain.gain.value = 1.0;

  // Audio delay to give chimes spatial depth
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.4;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.25;

  chimesGain.connect(ctx.destination); // Connect delay loop
  chimesGain.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(chimesGain);

  const chimeScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66]; // Pentatonic scale (C5-D5-E5-G5-A5-C6-D6)

  // Trigger individual chime sound
  const triggerChime = () => {
    if (ctx.state === 'suspended') return;
    
    // Choose random chime note and pan position
    const pitch = chimeScale[Math.floor(Math.random() * chimeScale.length)];
    const pan = Math.random() * 1.6 - 0.8; // spatial spread

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    let panner = null;
    if (ctx.createStereoPanner) {
      panner = ctx.createStereoPanner();
      panner.pan.value = pan;
    }

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    // Add micro-vibrato
    osc.frequency.linearRampToValueAtTime(pitch + (Math.random() * 4 - 2), ctx.currentTime + 1.5);

    // Chime ADSR (instant attack, long decay)
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(Math.random() * 0.12 + 0.03, ctx.currentTime + 0.02); // randomized velocity
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0); // 3-second ring out

    if (panner) {
      osc.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(chimesGain);
    } else {
      osc.connect(gainNode);
      gainNode.connect(chimesGain);
    }

    osc.start();
    osc.stop(ctx.currentTime + 3.2);
  };

  // Schedule random chime events (every 2-5 seconds)
  const scheduleNextChime = () => {
    const nextInterval = Math.random() * 3000 + 1500;
    chimeIntervalId = setTimeout(() => {
      triggerChime();
      scheduleNextChime();
    }, nextInterval);
  };

  scheduleNextChime();

  return {
    source: {
      start: () => {},
      stop: () => {
        if (chimeIntervalId) {
          clearTimeout(chimeIntervalId);
          chimeIntervalId = null;
        }
      }
    },
    output: chimesGain
  };
}

// 5. Binaural Beats Synthesizer
function createBinauralNode(ctx) {
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  
  // Left ear: 140Hz, Right ear: 146Hz (Theta wave focus at 6Hz difference)
  oscL.type = 'sine';
  oscL.frequency.value = 140;

  oscR.type = 'sine';
  oscR.frequency.value = 146;

  let panL = null;
  let panR = null;

  if (ctx.createStereoPanner) {
    panL = ctx.createStereoPanner();
    panL.pan.value = -1.0; // left
    panR = ctx.createStereoPanner();
    panR.pan.value = 1.0; // right
  }

  const outputGain = ctx.createGain();
  outputGain.gain.value = 0.5; // low hum

  if (panL && panR) {
    oscL.connect(panL);
    panL.connect(outputGain);
    oscR.connect(panR);
    panR.connect(outputGain);
  } else {
    oscL.connect(outputGain);
    oscR.connect(outputGain);
  }

  return {
    source: {
      start: () => {
        oscL.start();
        oscR.start();
      },
      stop: () => {
        oscL.stop();
        oscR.stop();
      }
    },
    output: outputGain,
    extraNodes: [oscL, oscR]
  };
}

// ----------------------------------------------------
// Public API Methods
// ----------------------------------------------------

export const audioManager = {
  // Start playing a synthesised sound
  start: (id, volume = 0.5) => {
    try {
      const ctx = initAudio();
      
      // If already playing, stop first
      if (activeSources[id]) {
        audioManager.stop(id);
      }

      // Create master gain control for this sound channel
      const channelGain = ctx.createGain();
      channelGain.gain.value = volume;
      channelGain.connect(ctx.destination);
      gainNodes[id] = channelGain;

      let soundData;
      switch (id) {
        case 'rain':
          soundData = createRainNode(ctx);
          break;
        case 'ocean':
          soundData = createOceanNode(ctx);
          break;
        case 'wind':
          soundData = createWindNode(ctx);
          break;
        case 'chimes':
          soundData = createChimesNode(ctx);
          break;
        case 'binaural':
          soundData = createBinauralNode(ctx);
          break;
        default:
          console.warn(`Sound ID ${id} not supported.`);
          return;
      }

      // Connect source to channel gain and play
      soundData.output.connect(channelGain);
      soundData.source.start(0);

      // Cache active sources & extra nodes to dispose later
      activeSources[id] = {
        source: soundData.source,
        extraNodes: soundData.extraNodes || [],
        channelGain: channelGain
      };
    } catch (e) {
      console.error(`Failed to play sound: ${id}`, e);
    }
  },

  // Stop playing a sound and clean up Web Audio nodes
  stop: (id) => {
    const active = activeSources[id];
    if (active) {
      try {
        active.source.stop();
        active.extraNodes.forEach(node => {
          try { node.stop(); } catch(e) {}
          node.disconnect();
        });
      } catch (e) {
        // Source node might not support standard stop()
      }
      
      if (active.channelGain) {
        active.channelGain.disconnect();
      }
      
      delete activeSources[id];
      delete gainNodes[id];
    }
  },

  // Stop all playing sounds
  stopAll: () => {
    Object.keys(activeSources).forEach(id => {
      audioManager.stop(id);
    });
  },

  // Set volume dynamic update
  setVolume: (id, volume) => {
    const gainNode = gainNodes[id];
    if (gainNode) {
      // Smooth parameter transition over 100ms
      const ctx = initAudio();
      gainNode.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    }
  }
};
