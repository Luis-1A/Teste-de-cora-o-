/**
 * Experiência de Aniversário de 18 Anos da Issamara
 * 24 de setembro de 2026
 * Preservando a identidade visual e arquitetura técnica do projeto original
 */

(function () {
  'use strict';

  // ==========================================
  // 1. TIMER & LIFECYCLE MANAGER
  // ==========================================
  class TimerManager {
    constructor() {
      this.timers = [];
      this.intervals = [];
      this.isPaused = false;
      this.pauseStartTime = 0;
    }

    setTimeout(callback, delay) {
      const timerObj = {
        callback,
        remaining: delay,
        startTime: Date.now(),
        id: null,
        cleared: false
      };

      if (!this.isPaused) {
        timerObj.id = window.setTimeout(() => {
          timerObj.cleared = true;
          this.removeTimer(timerObj);
          callback();
        }, delay);
      }

      this.timers.push(timerObj);
      return timerObj;
    }

    removeTimer(timerObj) {
      const idx = this.timers.indexOf(timerObj);
      if (idx !== -1) {
        this.timers.splice(idx, 1);
      }
    }

    setInterval(callback, interval) {
      const intervalObj = {
        callback,
        interval,
        id: null,
        cleared: false
      };

      if (!this.isPaused) {
        intervalObj.id = window.setInterval(callback, interval);
      }

      this.intervals.push(intervalObj);
      return intervalObj;
    }

    pauseAll() {
      if (this.isPaused) return;
      this.isPaused = true;
      const now = Date.now();

      // Pause timeouts
      this.timers.forEach(t => {
        if (!t.cleared && t.id) {
          window.clearTimeout(t.id);
          t.remaining -= (now - t.startTime);
          if (t.remaining < 0) t.remaining = 0;
          t.id = null;
        }
      });

      // Pause intervals
      this.intervals.forEach(i => {
        if (!i.cleared && i.id) {
          window.clearInterval(i.id);
          i.id = null;
        }
      });
    }

    resumeAll() {
      if (!this.isPaused) return;
      this.isPaused = false;

      // Resume timeouts
      this.timers.forEach(t => {
        if (!t.cleared && !t.id) {
          t.startTime = Date.now();
          t.id = window.setTimeout(() => {
            t.cleared = true;
            this.removeTimer(t);
            t.callback();
          }, t.remaining);
        }
      });

      // Resume intervals
      this.intervals.forEach(i => {
        if (!i.cleared && !i.id) {
          i.id = window.setInterval(i.callback, i.interval);
        }
      });
    }

    clearAll() {
      this.timers.forEach(t => {
        if (t.id) window.clearTimeout(t.id);
        t.cleared = true;
      });
      this.intervals.forEach(i => {
        if (i.id) window.clearInterval(i.id);
        i.cleared = true;
      });
      this.timers = [];
      this.intervals = [];
    }
  }

  // ==========================================
  // 1.5. VIEWPORT ROSE PETALS SYSTEM
  // ==========================================
  class ViewportPetalsSystem {
    constructor() {
      this.canvas = document.getElementById('global-viewport-petals-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'global-viewport-petals-canvas';
        this.canvas.className = 'global-viewport-petals-canvas';
        this.canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.petals = [];
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.isRunning = false;
      this.rafId = null;
      this.lastTime = performance.now();
      this.wind = 0;
      this.targetWind = 0;
      this.windChangeTimer = 0;

      // Paletas cromáticas de pétalas aveludadas de rosa (tons suaves e festivos)
      this.colorPalettes = [
        { light: '#ffffff', mid: '#ffb3c6', edge: '#ff758f' },
        { light: '#fff0f3', mid: '#ffccd5', edge: '#ff4d6d' },
        { light: '#fff5f7', mid: '#fecdd3', edge: '#fb7185' },
        { light: '#ffffff', mid: '#fed7e2', edge: '#f472b6' },
        { light: '#fff1f2', mid: '#ffe4e6', edge: '#f43f5e' }
      ];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Quantidade calibrada: leveza visual e performance 60fps
      const count = window.innerWidth <= 768 ? 24 : 40;
      this.petals = [];

      // Distribuição inicial por toda a altura do viewport para efeito acolhedor instantâneo
      for (let i = 0; i < count; i++) {
        this.petals.push(this.createPetal(true));
      }

      // Parada imediata de processamento quando a aba fica oculta (economiza bateria/CPU)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });

      this.start();
    }

    createPetal(isInitial = false) {
      const palette = this.colorPalettes[Math.floor(Math.random() * this.colorPalettes.length)];
      const sizeScale = Math.random() * 0.65 + 0.65;
      const baseW = (Math.random() * 6 + 10) * sizeScale;
      const baseH = (Math.random() * 8 + 14) * sizeScale;

      return {
        x: Math.random() * (this.width + 120) - 60,
        y: isInitial ? Math.random() * (this.height + 60) - 30 : -25 - Math.random() * 45,
        width: baseW,
        height: baseH,
        vy: Math.random() * 0.7 + 0.55,
        vx: (Math.random() - 0.5) * 0.35,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.02 + 0.012,
        swayDistance: Math.random() * 1.5 + 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.014,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: Math.random() * 0.025 + 0.015,
        alpha: Math.random() * 0.35 + 0.55,
        palette: palette,
        curl: Math.random() * 0.3 - 0.15
      };
    }

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * dpr);
      this.canvas.height = Math.floor(this.height * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }

    pause() {
      this.isRunning = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    resume() {
      if (!this.isRunning && !document.hidden) {
        this.start();
      }
    }

    loop(currentTime) {
      if (!this.isRunning) return;

      const dt = Math.min((currentTime - this.lastTime) / 16.67, 2.5);
      this.lastTime = currentTime;

      // Variação suave de brisa ambiente
      if (Math.random() < 0.012) {
        this.targetWind = (Math.random() - 0.45) * 0.75;
      }
      this.wind += (this.targetWind - this.wind) * 0.02;

      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];

        p.sway += p.swaySpeed * dt;
        p.rotation += p.rotationSpeed * dt;
        p.tilt += p.tiltSpeed * dt;

        p.y += p.vy * dt;
        p.x += (Math.sin(p.sway) * p.swayDistance + this.wind + p.vx) * dt;

        // Ao sair por baixo do viewport, ressurge no topo
        if (p.y > this.height + 35) {
          p.y = -25 - Math.random() * 40;
          p.x = Math.random() * (this.width + 120) - 60;
          p.sway = Math.random() * Math.PI * 2;
          p.rotation = Math.random() * Math.PI * 2;
        }
        if (p.x < -60) p.x = this.width + 40;
        if (p.x > this.width + 60) p.x = -40;

        this.drawPetal(p);
      }

      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    drawPetal(p) {
      const ctx = this.ctx;
      const tiltScale = Math.cos(p.tilt);
      if (Math.abs(tiltScale) < 0.06) return;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(tiltScale, 1);
      ctx.globalAlpha = p.alpha;

      const w = p.width;
      const h = p.height;
      const hw = w * 0.5;
      const hh = h * 0.5;

      // Desenho orgânico e curvo de pétala de rosa
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.bezierCurveTo(hw * 1.1, -hh * 0.7, hw * 1.05, hh * 0.6, 0, hh);
      ctx.bezierCurveTo(-hw * 1.05, hh * 0.6, -hw * 1.1, -hh * 0.7, 0, -hh);
      ctx.closePath();

      const grad = ctx.createRadialGradient(-hw * 0.15, -hh * 0.25, 1, 0, 0, hh * 1.1);
      grad.addColorStop(0, p.palette.light);
      grad.addColorStop(0.5, p.palette.mid);
      grad.addColorStop(1, p.palette.edge);

      ctx.fillStyle = grad;
      ctx.fill();

      // Nervura suave interna
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.75);
      ctx.quadraticCurveTo(p.curl * hw, 0, 0, hh * 0.7);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================
  // 2. AUDIO MANAGER (Instância Global Única com Ciclo de Vida Estrito)
  // ==========================================
  class AudioManager {
    constructor() {
      // Regra de Ouro: Uma única instância global de áudio durante toda a experiência
      if (AudioManager.instance) {
        return AudioManager.instance;
      }
      AudioManager.instance = this;

      this.audio = document.getElementById('background-music');
      if (!this.audio) {
        this.audio = document.querySelector('audio');
      }
      if (this.audio && (!this.audio.src || !this.audio.src.includes('monokrom.mp3'))) {
        this.audio.src = './music/monokrom.mp3';
      }
      if (this.audio) {
        this.audio.loop = true;
        this.audio.preload = 'auto';
      }

      this.isMuted = false;
      this.baseVolume = 0.7;
      this.currentVolume = 0.7;
      this.isPlaying = false;
      this.fadeInterval = null;
      this.hasFallbackListener = false;
      this.pausedByBackground = false;
      this.wasPlayingBeforeBackground = false;

      const savedVol = localStorage.getItem('issamara_bday_audio_vol');
      if (savedVol !== null) {
        this.baseVolume = parseFloat(savedVol);
        this.currentVolume = this.baseVolume;
      }
      const savedMute = localStorage.getItem('issamara_bday_audio_mute');
      if (savedMute === 'true') {
        this.isMuted = true;
      }

      if (this.audio) {
        this.audio.volume = this.isMuted ? 0 : this.currentVolume;
      }

      this.audioCtx = null;
      this.setupUserUnlock();
      this.setupLifecycleManagement();
    }

    /**
     * Gatilho oficial da experiência: inicia a música global 'music/monokrom.mp3'
     * e garante desbloqueio de contexto de áudio sem nunca recriar nem reiniciar.
     */
    startExperienceAudio() {
      if (document.hidden) return; // Nunca reproduzir com documento em segundo plano

      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!this.audio) {
        this.audio = document.getElementById('background-music');
      }
      if (!this.audio) return;

      // Assegura desmutado para que a música toque ao iniciar
      this.isMuted = false;
      this.audio.muted = false;
      this.pausedByBackground = false;
      if (this.baseVolume <= 0.05) this.baseVolume = 0.7;
      this.audio.volume = 0.08;

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.fadeTo(this.baseVolume || 0.7, 1800);
          this.updateUI();
        }).catch((err) => {
          console.warn('Gesto adicional necessário para autoplay:', err);
          this.attachFallbackGesture();
        });
      }
    }

    setupUserUnlock() {
      const unlockAudio = () => {
        const ctx = this.getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        if (!this.isPlaying && this.audio) {
          this.audio.muted = this.isMuted;
          const playPromise = this.audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              this.isPlaying = true;
              this.updateUI();
            }).catch(() => {
              this.attachFallbackGesture();
            });
          }
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('pointerdown', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };

      document.addEventListener('click', unlockAudio, { once: true, passive: true });
      document.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      document.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
      document.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    }

    attachFallbackGesture() {
      if (this.hasFallbackListener) return;
      this.hasFallbackListener = true;
      const retryPlay = () => {
        if (this.isPlaying) {
          document.removeEventListener('click', retryPlay, true);
          document.removeEventListener('touchstart', retryPlay, true);
          document.removeEventListener('pointerdown', retryPlay, true);
          document.removeEventListener('keydown', retryPlay, true);
          return;
        }
        if (this.audio) {
          this.audio.muted = this.isMuted;
          const p = this.audio.play();
          if (p !== undefined) {
            p.then(() => {
              this.isPlaying = true;
              this.fadeTo(this.baseVolume || 0.7, 1200);
              this.updateUI();
              document.removeEventListener('click', retryPlay, true);
              document.removeEventListener('touchstart', retryPlay, true);
              document.removeEventListener('pointerdown', retryPlay, true);
              document.removeEventListener('keydown', retryPlay, true);
            }).catch(() => {});
          }
        }
      };
      document.addEventListener('click', retryPlay, true);
      document.addEventListener('touchstart', retryPlay, true);
      document.addEventListener('pointerdown', retryPlay, true);
      document.addEventListener('keydown', retryPlay, true);
    }

    getAudioContext() {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          try {
            this.audioCtx = new AudioCtxClass();
          } catch (e) {
            console.warn('Web Audio API não suportada ou bloqueada:', e);
          }
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    }

    /**
     * Efeito sonoro discreto de 'brilho' (celestial shimmer / sparkle) via Web Audio API.
     * Sincronizado especificamente com o estado de revelação do elemento central na abertura.
     */
    playSparkleSound(intensity = 1.0) {
      if (this.isMuted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const t0 = ctx.currentTime + 0.015;
        const masterVol = Math.max(0.01, Math.min(1.0, this.currentVolume));
        const effectiveGain = 0.08 * intensity * masterVol;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(effectiveGain, t0);

        // Filtro passa-altas para manter as frequências cristalinas, etéreas e sem impacto no grave
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.setValueAtTime(800, t0);

        masterGain.connect(highPass);
        highPass.connect(ctx.destination);

        // Cascata de notas celestiais em arpeggio cristalino (Dó maior / Lá menor estelar)
        const chimeNotes = [
          { freq: 1046.50, delay: 0.00, dur: 0.65, vol: 0.75 }, // C6
          { freq: 1318.51, delay: 0.05, dur: 0.60, vol: 0.85 }, // E6
          { freq: 1567.98, delay: 0.11, dur: 0.58, vol: 0.80 }, // G6
          { freq: 1975.53, delay: 0.18, dur: 0.54, vol: 0.75 }, // B6
          { freq: 2349.32, delay: 0.26, dur: 0.50, vol: 0.70 }, // D7
          { freq: 3135.96, delay: 0.35, dur: 0.45, vol: 0.60 }  // G7
        ];

        chimeNotes.forEach(note => {
          const noteStart = t0 + note.delay;
          const osc = ctx.createOscillator();
          const oscOvertone = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, noteStart);

          // Sobretom suave (oitava superior com toque aveludado)
          oscOvertone.type = 'sine';
          oscOvertone.frequency.setValueAtTime(note.freq * 2, noteStart);

          noteGain.gain.setValueAtTime(0.0001, noteStart);
          noteGain.gain.linearRampToValueAtTime(note.vol, noteStart + 0.015);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.dur);

          osc.connect(noteGain);
          oscOvertone.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(noteStart);
          oscOvertone.start(noteStart);
          osc.stop(noteStart + note.dur + 0.04);
          oscOvertone.stop(noteStart + note.dur + 0.04);
        });

        // Toque etéreo de 'poeira de estrelas' (ruído sutil filtrado em alta frequência)
        const noiseDur = 0.42;
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDur), ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(4200, t0);
        noiseFilter.Q.setValueAtTime(3.2, t0);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.0001, t0);
        noiseGain.gain.linearRampToValueAtTime(0.22, t0 + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + noiseDur);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseSrc.start(t0 + 0.04);
        noiseSrc.stop(t0 + 0.04 + noiseDur);
      } catch (err) {
        console.warn('Erro ao reproduzir som de brilho:', err);
      }
    }

    /**
     * Efeito sonoro discreto de 'página virando' / capa de livro abrindo via Web Audio API.
     * Sincronizado especificamente com o momento exato em que a capa do livro se abre em 3D.
     */
    playPageTurnSound(intensity = 1.0) {
      if (this.isMuted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const t0 = ctx.currentTime + 0.01;
        const masterVol = Math.max(0.01, Math.min(1.0, this.currentVolume));
        const effectiveGain = 0.11 * intensity * masterVol;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(effectiveGain, t0);
        masterGain.connect(ctx.destination);

        // 1. Ruído filtrado com cor rosa/orgânica para o deslocamento físico de ar e papel
        const duration = 0.75;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2 + white * 0.08) * 0.35;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Filtro passa-faixa com envelope de varredura que sobe ao erguer a capa e desce ao repousar
        const bandPass = ctx.createBiquadFilter();
        bandPass.type = 'bandpass';
        bandPass.Q.setValueAtTime(1.8, t0);
        bandPass.frequency.setValueAtTime(520, t0);
        bandPass.frequency.exponentialRampToValueAtTime(1420, t0 + 0.18);
        bandPass.frequency.exponentialRampToValueAtTime(450, t0 + 0.68);

        const pageGain = ctx.createGain();
        pageGain.gain.setValueAtTime(0.0001, t0);
        pageGain.gain.linearRampToValueAtTime(0.85, t0 + 0.08);
        pageGain.gain.setValueAtTime(0.85, t0 + 0.18);
        pageGain.gain.exponentialRampToValueAtTime(0.20, t0 + 0.45);
        pageGain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

        noiseSource.connect(bandPass);
        bandPass.connect(pageGain);
        pageGain.connect(masterGain);

        // 2. Camada sutil de atrito fino de borda de página / pergaminho
        const frictionFilter = ctx.createBiquadFilter();
        frictionFilter.type = 'highpass';
        frictionFilter.frequency.setValueAtTime(2600, t0);

        const frictionGain = ctx.createGain();
        frictionGain.gain.setValueAtTime(0.0001, t0);
        frictionGain.gain.linearRampToValueAtTime(0.18, t0 + 0.06);
        frictionGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);

        noiseSource.connect(frictionFilter);
        frictionFilter.connect(frictionGain);
        frictionGain.connect(masterGain);

        // 3. Toque sutil de deslocamento de ar suave da capa em movimento
        const airOsc = ctx.createOscillator();
        airOsc.type = 'sine';
        airOsc.frequency.setValueAtTime(115, t0);
        airOsc.frequency.exponentialRampToValueAtTime(60, t0 + 0.32);

        const airGain = ctx.createGain();
        airGain.gain.setValueAtTime(0.0001, t0);
        airGain.gain.linearRampToValueAtTime(0.18, t0 + 0.05);
        airGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);

        airOsc.connect(airGain);
        airGain.connect(masterGain);

        noiseSource.start(t0);
        noiseSource.stop(t0 + duration);
        airOsc.start(t0);
        airOsc.stop(t0 + 0.36);
      } catch (err) {
        console.warn('Erro ao reproduzir som de página virando:', err);
      }
    }

    /**
     * Efeito sonoro orgânico de sopro de ar ao apagar a vela do bolo de aniversário.
     */
    playCandleBlowSound(intensity = 1.0) {
      if (this.isMuted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;
      try {
        const t0 = ctx.currentTime + 0.01;
        const masterVol = Math.max(0.01, Math.min(1.0, this.currentVolume));
        const effectiveGain = 0.26 * intensity * masterVol;

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(effectiveGain, t0);
        masterGain.connect(ctx.destination);

        const dur = 0.75;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.45;
        }
        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t0);
        filter.frequency.linearRampToValueAtTime(1300, t0 + 0.18);
        filter.frequency.exponentialRampToValueAtTime(160, t0 + dur);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, t0);
        gainNode.gain.linearRampToValueAtTime(0.95, t0 + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

        noiseSrc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        noiseSrc.start(t0);
        noiseSrc.stop(t0 + dur);
      } catch (e) {
        console.warn('Erro ao reproduzir som do sopro:', e);
      }
    }

    setupLifecycleManagement() {
      // 1. Mudança de Visibilidade: aba em segundo plano, tela bloqueada, minimização ou troca de aplicativo
      document.addEventListener('visibilitychange', () => {
        if (document.hidden || document.visibilityState === 'hidden') {
          this.handleBackgroundEntry('visibilitychange:hidden');
        } else if (document.visibilityState === 'visible') {
          this.handleForegroundReturn('visibilitychange:visible');
        }
      });

      // 2. pagehide: capturado com prioridade imediata ao sair da página ou fechar o navegador
      window.addEventListener('pagehide', (e) => {
        const isPersisted = !!(e && e.persisted);
        this.handlePageExit(isPersisted);
      }, { capture: true });

      // 3. beforeunload e unload: garantia de interrupção e limpeza imediata
      window.addEventListener('beforeunload', () => {
        this.handlePageExit(false);
      }, { capture: true });

      window.addEventListener('unload', () => {
        this.handlePageExit(false);
      }, { capture: true });

      // 4. freeze: Page Lifecycle API do Chrome para suspensão de abas
      document.addEventListener('freeze', () => {
        this.handleBackgroundEntry('freeze');
      });

      // 5. blur: apoio secundário na perda de foco da janela
      window.addEventListener('blur', () => {
        if (document.hidden) {
          this.handleBackgroundEntry('blur:hidden');
        }
      });
    }

    handleBackgroundEntry(source = '') {
      // Ao sair ou entrar em segundo plano, interrompe a reprodução imediatamente
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }

      if (this.isPlaying) {
        this.wasPlayingBeforeBackground = true;
      }
      this.pausedByBackground = true;

      if (this.audio) {
        try {
          this.audio.pause();
        } catch (e) {}
      }
      this.isPlaying = false;

      // Suspende AudioContext caso esteja ativo
      if (this.audioCtx && this.audioCtx.state === 'running') {
        try {
          this.audioCtx.suspend();
        } catch (e) {}
      }

      this.updateUI();
    }

    handleForegroundReturn(source = '') {
      // Não reproduzir sozinho ao retornar se não houver interação na página
      if (this.audio && !this.audio.paused) {
        try {
          this.audio.pause();
        } catch (e) {}
      }
      this.isPlaying = false;
      this.updateUI();
    }

    handlePageExit(persisted = false) {
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }

      if (this.audio) {
        try {
          this.audio.pause();
          if (!persisted) {
            this.audio.currentTime = 0;
          }
        } catch (e) {}
      }
      this.isPlaying = false;

      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        try {
          this.audioCtx.suspend();
        } catch (e) {}
      }
    }

    stopAndClean() {
      this.handlePageExit(false);
      this.updateUI();
    }

    play() {
      if (document.hidden) return; // Nunca reproduzir com aba oculta ou em segundo plano
      if (!this.audio) return;
      this.pausedByBackground = false;
      this.audio.muted = this.isMuted;
      this.audio.volume = this.isMuted ? 0 : this.currentVolume;
      const p = this.audio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isPlaying = true;
          this.updateUI();
        }).catch(() => {});
      }
    }

    pause() {
      if (!this.audio) return;
      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
      this.audio.pause();
      this.isPlaying = false;
      this.updateUI();
    }

    setVolume(val) {
      this.baseVolume = Math.max(0, Math.min(1, val));
      this.currentVolume = this.baseVolume;
      if (this.audio) {
        this.audio.volume = this.isMuted ? 0 : this.currentVolume;
      }
      localStorage.setItem('issamara_bday_audio_vol', this.baseVolume.toString());
      this.updateUI();
    }

    fadeTo(targetVol, duration = 1200) {
      if (!this.audio) return;
      if (this.fadeInterval) clearInterval(this.fadeInterval);
      const clamped = Math.max(0, Math.min(1, targetVol));
      const steps = 20;
      const stepTime = duration / steps;
      const volStep = (clamped - this.currentVolume) / steps;

      this.fadeInterval = setInterval(() => {
        let next = this.currentVolume + volStep;
        if ((volStep > 0 && next >= clamped) || (volStep < 0 && next <= clamped)) {
          next = clamped;
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        this.currentVolume = next;
        if (!this.isMuted) {
          this.audio.volume = this.currentVolume;
        }
        if (clamped === 0 && next === 0) {
          try {
            this.audio.pause();
            this.isPlaying = false;
            this.updateUI();
          } catch (e) {}
        }
      }, stepTime);
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.audio) {
        this.audio.muted = this.isMuted;
        this.audio.volume = this.isMuted ? 0 : this.currentVolume;
      }
      localStorage.setItem('issamara_bday_audio_mute', this.isMuted.toString());
      this.updateUI();
    }

    updateUI() {
      // Interface limpa e cinematográfica sem controles de áudio na tela
    }
  }

  // ==========================================
  // 3. PROGRESS MANAGER
  // ==========================================
  class ProgressManager {
    constructor() {
      this.storageKey = 'issamara_bday_progress_v2';
    }

    load() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            currentChapter: parsed.currentChapter || 1,
            completedChapters: parsed.completedChapters || [1],
            started: parsed.started || false,
            finished: parsed.finished || false
          };
        }
      } catch (e) {}

      return {
        currentChapter: 1,
        completedChapters: [1],
        started: false,
        finished: false
      };
    }

    save(currentChapter, completedChapters, started = true, finished = false) {
      try {
        const data = {
          currentChapter,
          completedChapters: Array.from(new Set(completedChapters)),
          started,
          finished
        };
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (e) {}
    }

    reset() {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {}
    }
  }

  // ==========================================
  // 3.5. SOUND EFFECTS (Web Audio API Synthesizer)
  // ==========================================
  class SoundEffects {
    constructor() {
      this.ctx = null;
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    /**
     * Synthesizes an ultra-realistic, soft paper rustling sound
     * Zero external MP3 dependency, zero latency, and whisper-soft (~0.065 volume)
     */
    playPageTurn() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const duration = 0.22;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Generate pink-tinted noise buffer
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.15;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Bandpass filter to simulate page sliding through air
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + duration);
        filter.Q.setValueAtTime(1.6, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseSource.start();
        noiseSource.stop(ctx.currentTime + duration + 0.02);
      } catch (e) {
        // Safe silent fallback
      }
    }

    /**
     * Synthesizes a delicate, whisper-soft breath sound for blowing out candles
     */
    playBreathOut() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const duration = 0.55;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.12;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + duration);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noiseSource.start();
        noiseSource.stop(ctx.currentTime + duration + 0.02);
      } catch (e) {
        // Safe fallback
      }
    }

    /**
     * Synthesizes a soft, warm celestial chime chord for constellation ignition
     */
    playChimeChord() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const startTime = ctx.currentTime + idx * 0.06;
          const duration = 1.2;

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.025 / (idx + 1), startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration + 0.05);
        });
      } catch (e) {
        // Safe fallback
      }
    }

    /**
     * Synthesizes mechanical camera shutter click and capacitor flash burst
     */
    playCameraClick() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;

        // 1. Shutter noise burst
        const bufferSize = Math.floor(ctx.sampleRate * 0.09);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2600, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);

        // 2. Mechanical click curtain release
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1900, t + 0.035);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.08);
        oscGain.gain.setValueAtTime(0.001, t);
        oscGain.gain.setValueAtTime(0.25, t + 0.035);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(t + 0.035);
        osc.stop(t + 0.1);
      } catch (e) {}
    }

    /**
     * Synthesizes realistic mechanical stepper motor of a Polaroid printing ejection
     */
    playPolaroidMotor() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const duration = 1.35;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, t);
        osc.frequency.linearRampToValueAtTime(235, t + 0.25);
        osc.frequency.linearRampToValueAtTime(205, t + duration - 0.2);
        osc.frequency.exponentialRampToValueAtTime(90, t + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(680, t);
        filter.Q.setValueAtTime(3.2, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.08);
        gain.gain.setValueAtTime(0.14, t + duration - 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration + 0.05);
      } catch (e) {}
    }

    /**
     * Synthesizes a comedic breath intake / gasp before the scream
     */
    playCatInhale() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const duration = 0.55;

        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.18;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, t);
        filter.frequency.exponentialRampToValueAtTime(1550, t + duration);
        filter.Q.setValueAtTime(2.4, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + duration - 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + duration + 0.02);
      } catch (e) {}
    }

    /**
     * Synthesizes the hilarious, dramatic, exaggerated cat scream ("AAAAAAAHHHHHHH!")
     * Rich vocal formants, pitch glides, dramatic vibrato tremor and comical resonance
     */
    playCatScream() {
      try {
        this.initContext();
        if (!this.ctx) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const duration = 2.8;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc3.type = 'triangle';

        // Comical upward glissando into screaming register with wobble
        osc1.frequency.setValueAtTime(540, t);
        osc1.frequency.exponentialRampToValueAtTime(840, t + 0.28);
        osc1.frequency.linearRampToValueAtTime(920, t + 1.2);
        osc1.frequency.exponentialRampToValueAtTime(480, t + duration);

        osc2.frequency.setValueAtTime(546, t);
        osc2.frequency.exponentialRampToValueAtTime(849, t + 0.28);
        osc2.frequency.linearRampToValueAtTime(928, t + 1.2);
        osc2.frequency.exponentialRampToValueAtTime(484, t + duration);

        osc3.frequency.setValueAtTime(270, t);
        osc3.frequency.exponentialRampToValueAtTime(420, t + 0.28);
        osc3.frequency.exponentialRampToValueAtTime(240, t + duration);

        // Tremor LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(9.0, t);
        lfoGain.gain.setValueAtTime(32, t);
        lfoGain.gain.linearRampToValueAtTime(50, t + 0.4);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        lfo.start(t);
        lfo.stop(t + duration);

        // Vocal Formants
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(840, t);
        f1.Q.setValueAtTime(4.2, t);

        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(1450, t);
        f2.Q.setValueAtTime(3.8, t);

        const noiseGen = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
        const nd = noiseBuffer.getChannelData(0);
        for (let i = 0; i < nd.length; i++) {
          nd[i] = (Math.random() * 2 - 1) * 0.28;
        }
        noiseGen.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2900, t);
        noiseFilter.Q.setValueAtTime(2.2, t);

        const screamGain = ctx.createGain();
        screamGain.gain.setValueAtTime(0.001, t);
        screamGain.gain.linearRampToValueAtTime(0.48, t + 0.15);
        screamGain.gain.setValueAtTime(0.45, t + 1.6);
        screamGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc1.connect(f1);
        osc2.connect(f2);
        osc3.connect(f1);
        noiseGen.connect(noiseFilter);

        f1.connect(screamGain);
        f2.connect(screamGain);
        noiseFilter.connect(screamGain);
        screamGain.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc3.start(t);
        noiseGen.start(t);

        osc1.stop(t + duration);
        osc2.stop(t + duration);
        osc3.stop(t + duration);
        noiseGen.stop(t + duration);
      } catch (e) {}
    }
  }

  // ==========================================
  // DIGITAL BOOK DATA (6 Complete Story Sections)
  // Preservação integral do conteúdo original
  // ==========================================
  const STORY_SECTIONS = [
    {
      id: 1,
      number: 1,
      title: "18 Anos",
      paragraphs: [
        "Feliz aniversário, Issamara. 🎂",
        "18 anos.",
        "É estranho pensar nisso. A gente passa tanto tempo esperando certas idades chegarem que, quando elas finalmente chegam, parece só mais um dia.",
        "Mas não é.",
        "É mais um ano que passou, mais um monte de coisas que aconteceram e, principalmente, mais um ano que você está aqui."
      ]
    },
    {
      id: 2,
      number: 2,
      title: "Pessoas & O Tempo",
      paragraphs: [
        "E isso me faz pensar numa coisa meio estranha: pessoas passam pela nossa vida o tempo todo.",
        "Algumas ficam, outras vão embora, algumas a gente lembra por muito tempo e outras simplesmente desaparecem da nossa cabeça.",
        "A verdade é que ninguém sabe exatamente o que vai acontecer amanhã. A vida é meio imprevisível assim.",
        "E talvez seja justamente por isso que algumas pessoas acabam sendo importantes."
      ]
    },
    {
      id: 3,
      number: 3,
      title: "Você Conseguiu",
      paragraphs: [
        "Eu nunca fui uma pessoa que se interessa muito pelas outras. Acho as pessoas interessantes, observo, converso, conheço... mas dificilmente alguém realmente consegue chamar a minha atenção a ponto de eu querer manter aquela pessoa por perto.",
        "Você conseguiu.",
        "E você conseguiu meu interesse/atenção.",
        "Não sei explicar exatamente em que momento aconteceu. Talvez tenha sido pelas nossas conversas, pelo seu jeito tranquilo, pela forma como você sempre pareceu ser uma pessoa diferente das outras.",
        "Talvez tenha sido simplesmente porque, em algum momento, eu percebi que gostava da sua companhia e que conversar com você fazia bem."
      ]
    },
    {
      id: 4,
      number: 4,
      title: "O Que Importa Hoje",
      paragraphs: [
        "E acho que isso diz bastante.",
        "Porque, mesmo com o tempo passando e a gente ficando mais distante, você continuou sendo uma pessoa que eu considero muito.",
        "Hoje eu não quero ficar falando sobre tudo que mudou, nem transformar seu aniversário numa retrospectiva dramática da nossa amizade. Hoje é seu aniversário. Seu dia.",
        "Então eu só quero te desejar coisas boas.",
        "Que você tenha saúde, paz, felicidade e pessoas que realmente façam bem para você. Que consiga realizar aquilo que deseja, que encontre oportunidades que façam sentido para a sua vida e que tenha coragem para seguir os caminhos que escolher."
      ]
    },
    {
      id: 5,
      number: 5,
      title: "Uma Nova Fase",
      paragraphs: [
        "Você está começando uma fase completamente nova agora.",
        "18 anos.",
        "E eu espero que você aproveite muito essa fase. Que erre, aprenda, descubra coisas novas, ria bastante, conheça lugares, pessoas e tenha histórias que realmente valham a pena lembrar.",
        "E, sinceramente, espero que a vida seja gentil com você.",
        "Porque você merece encontrar coisas boas pelo caminho."
      ]
    },
    {
      id: 6,
      number: 6,
      title: "Feliz Aniversário",
      paragraphs: [
        "Talvez a gente ainda volte a conversar como antes algum dia. Talvez a vida leve cada um para um lado completamente diferente. A gente nunca sabe.",
        "Mas, independente disso, eu fico feliz por ter te conhecido.",
        "Você foi uma daquelas pessoas que conseguiram passar da minha curiosidade e realmente ganhar um espaço na minha consideração. E isso não acontece com qualquer pessoa.",
        "Então, no meio de toda essa conversa estranha sobre tempo, vida e pessoas...",
        "feliz aniversário.",
        "Espero que seus 18 anos sejam muito bons.",
        "Que Deus abençoe muito a sua vida, seus planos, suas escolhas e tudo aquilo que ainda está por vir.",
        "E que, quando você olhar para esse aniversário daqui a alguns anos, consiga pensar:",
        "“Foi um dia bom.”",
        "Feliz 18 anos, Issamara. 🎉🎂"
      ],
      closing: "Com carinho,\nLuis Fernando Santos"
    }
  ];

  const BOOK_PAGES = STORY_SECTIONS;
  window.BOOK_PAGES = STORY_SECTIONS;

  // ==========================================
  // SISTEMA DE PAGINAÇÃO DINÂMICA DO LIVRO
  // Regra: Zero rolagem, medição precisa no DOM e divisão automática
  // ==========================================
  class BookPaginationEngine {
    /**
     * Mede com precisão matemática no DOM a área física útil da folha
     * e distribui automaticamente os textos sem corte de palavras ou rolagem.
     *
     * @param {HTMLElement} container - O elemento pai onde as folhas residem
     * @param {Array} sections - Seções completas da história
     * @returns {Array} Array de páginas computadas com contagem dinâmica
     */
    static calculatePages(container, sections) {
      // 1. Cria folha temporária para medições no navegador
      const measureBox = document.createElement('div');
      measureBox.className = 'book-page';
      measureBox.style.cssText = 'visibility: hidden !important; position: absolute !important; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none !important; z-index: -9999;';
      measureBox.innerHTML = `
        <div class="book-page-content">
          <div class="book-page-header">
            <h4 class="book-page-title">Medição</h4>
            <span class="book-page-number">0 / 0</span>
          </div>
          <div class="book-page-body" id="measure-body-target"></div>
          <div class="book-page-footer">
            <button class="book-btn-prev">Voltar</button>
            <button class="book-btn-next">Continuar</button>
          </div>
        </div>
      `;
      container.appendChild(measureBox);

      const targetBody = measureBox.querySelector('#measure-body-target');

      // Mede a altura física real disponível para o corpo de texto na folha
      let maxUsefulHeight = targetBody.clientHeight;
      if (!maxUsefulHeight || maxUsefulHeight < 140) {
        maxUsefulHeight = Math.max(280, container.clientHeight - 92);
      }

      // Função de teste de ajuste na folha
      const doesFit = (items) => {
        targetBody.innerHTML = '';
        items.forEach(it => {
          const el = document.createElement('p');
          if (it.type === 'quote') el.className = 'book-page-quote';
          el.innerText = it.text;
          targetBody.appendChild(el);
        });
        return targetBody.scrollHeight <= (maxUsefulHeight + 2);
      };

      const pages = [];

      sections.forEach((sec) => {
        let currentItems = [];
        let isContinuation = false;
        const baseTitle = sec.title;

        const flushCurrentPage = () => {
          if (currentItems.length > 0) {
            pages.push({
              sectionId: sec.id,
              title: isContinuation ? `${baseTitle} (cont.)` : baseTitle,
              items: [...currentItems]
            });
            currentItems = [];
            isContinuation = true;
          }
        };

        sec.paragraphs.forEach((pText) => {
          const testItem = { type: 'p', text: pText };

          // Testa se o parágrafo inteiro cabe na folha atual
          if (doesFit([...currentItems, testItem])) {
            currentItems.push(testItem);
          } else {
            if (currentItems.length > 0) {
              // Se já temos conteúdo na página atual, verifica se cabe numa página nova limpa
              if (doesFit([testItem])) {
                flushCurrentPage();
                currentItems.push(testItem);
              } else {
                // Parágrafo é longo: divide por palavras sem nunca cortar palavras ao meio
                const words = pText.split(' ');
                let fittingWords = [];
                let remainingWords = [];

                for (let w = 0; w < words.length; w++) {
                  const candidate = words.slice(0, w + 1).join(' ');
                  if (doesFit([...currentItems, { type: 'p', text: candidate }])) {
                    fittingWords = words.slice(0, w + 1);
                  } else {
                    remainingWords = words.slice(w);
                    break;
                  }
                }

                if (fittingWords.length >= 3) {
                  currentItems.push({ type: 'p', text: fittingWords.join(' ') });
                  flushCurrentPage();

                  let remText = remainingWords.join(' ');
                  while (remText.length > 0) {
                    const remWords = remText.split(' ');
                    let subFit = [];
                    let subRest = [];

                    for (let rw = 0; rw < remWords.length; rw++) {
                      const cand = remWords.slice(0, rw + 1).join(' ');
                      if (doesFit([...currentItems, { type: 'p', text: cand }])) {
                        subFit = remWords.slice(0, rw + 1);
                      } else {
                        subRest = remWords.slice(rw);
                        break;
                      }
                    }

                    if (subFit.length > 0) {
                      currentItems.push({ type: 'p', text: subFit.join(' ') });
                      if (subRest.length > 0) {
                        flushCurrentPage();
                        remText = subRest.join(' ');
                      } else {
                        remText = '';
                      }
                    } else {
                      flushCurrentPage();
                      currentItems.push({ type: 'p', text: remText });
                      remText = '';
                    }
                  }
                } else {
                  flushCurrentPage();
                  currentItems.push(testItem);
                }
              }
            } else {
              // Folha vazia: distribui palavras
              const words = pText.split(' ');
              let fittingWords = [];
              let remainingWords = [];

              for (let w = 0; w < words.length; w++) {
                const candidate = words.slice(0, w + 1).join(' ');
                if (doesFit([{ type: 'p', text: candidate }])) {
                  fittingWords = words.slice(0, w + 1);
                } else {
                  remainingWords = words.slice(w);
                  break;
                }
              }
              currentItems.push({ type: 'p', text: fittingWords.join(' ') });
              flushCurrentPage();
              if (remainingWords.length > 0) {
                currentItems.push({ type: 'p', text: remainingWords.join(' ') });
              }
            }
          }
        });

        // Citação final de fechamento da seção
        if (sec.closing) {
          const quoteItem = { type: 'quote', text: sec.closing };
          if (doesFit([...currentItems, quoteItem])) {
            currentItems.push(quoteItem);
          } else {
            flushCurrentPage();
            currentItems.push(quoteItem);
          }
        }

        // Conclui a folha da seção
        flushCurrentPage();
      });

      // Remove a folha de medição
      if (measureBox.parentNode) {
        measureBox.parentNode.removeChild(measureBox);
      }

      // Numeração dinâmica e marcação da última página
      pages.forEach((p, idx) => {
        p.pageIndex = idx;
        p.pageNumber = idx + 1;
        p.totalPages = pages.length;
        p.isLast = (idx === pages.length - 1);
      });

      return pages;
    }
  }

  // ==========================================
  // DIGITAL BOOK CONTROLLER
  // Folha de caderno autêntica, sem scroll, virada física em 3D
  // ==========================================
  class DigitalBookController {
    constructor(mountElement, sys, onComplete) {
      this.mount = mountElement;
      this.sys = sys;
      this.onComplete = onComplete;
      this.currentPageIndex = 0;
      this.state = 'IDLE'; // 'IDLE' | 'READING' | 'READY' | 'TURNING'
      this.isTurningPage = false;
      this.skipRequested = false;
      this.activeTypingTimeouts = [];
      this.soundEffects = sys.soundEffects;
      this.pages = [];
      this.totalPages = 0;
      this.resizeObserver = null;

      this.init();
    }

    init() {
      this.renderFramework();
      this.bindGestures();
      this.recalculateAndDisplay(0);
      this.setupResizeObserver();
    }

    renderFramework() {
      this.stageWrapper = document.createElement('div');
      this.stageWrapper.className = 'book-stage';
      this.stageWrapper.innerHTML = `
        <div class="book-viewport" id="book-viewport">
          <div class="book-pages-wrapper" id="book-pages-wrapper"></div>
        </div>
        <div class="book-controls-bar">
          <span class="book-gesture-hint">
            <i class="fas fa-book-open mr-1 text-danger"></i> Toque na direita para avançar ou deslize a folha
          </span>
          <button id="btn-book-pdf" class="btn btn-outline-dark btn-sm shadow-sm" style="font-size: 12px; border-radius: 20px; padding: 3px 12px;">
            <i class="fas fa-file-pdf text-danger mr-1"></i> Baixar em PDF
          </button>
        </div>
      `;
      this.mount.appendChild(this.stageWrapper);

      this.pagesWrapper = this.stageWrapper.querySelector('#book-pages-wrapper');
      this.viewport = this.stageWrapper.querySelector('#book-viewport');

      const btnPdf = this.stageWrapper.querySelector('#btn-book-pdf');
      if (btnPdf) {
        btnPdf.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sys.openPdfModal();
        });
      }
    }

    setupResizeObserver() {
      if (window.ResizeObserver && this.viewport) {
        let lastWidth = this.viewport.clientWidth;
        let lastHeight = this.viewport.clientHeight;
        let resizeTimer = null;

        this.resizeObserver = new ResizeObserver(() => {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (!this.viewport) return;
            const newWidth = this.viewport.clientWidth;
            const newHeight = this.viewport.clientHeight;

            if (Math.abs(newWidth - lastWidth) > 18 || Math.abs(newHeight - lastHeight) > 18) {
              lastWidth = newWidth;
              lastHeight = newHeight;
              const ratio = this.totalPages > 1 ? this.currentPageIndex / (this.totalPages - 1) : 0;
              this.recalculateAndDisplay(ratio);
            }
          }, 220);
        });

        this.resizeObserver.observe(this.viewport);
      }
    }

    recalculateAndDisplay(targetRatio = 0) {
      this.pages = BookPaginationEngine.calculatePages(this.pagesWrapper, STORY_SECTIONS);
      this.totalPages = this.pages.length;

      let targetIndex = Math.round(targetRatio * (this.totalPages - 1));
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= this.totalPages) targetIndex = this.totalPages - 1;

      this.displayPage(targetIndex);
    }

    bindGestures() {
      let startX = 0;
      let startY = 0;
      let startTime = 0;

      this.handleTouchStart = (e) => {
        if (e.touches && e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }
      };

      this.handleTouchEnd = (e) => {
        if (this.isTurningPage) return;
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;
        const duration = Date.now() - startTime;

        if (duration < 650 && Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
          if (deltaX < 0) {
            // Arrastou para a esquerda -> avança folha
            this.handleAdvance();
          } else {
            // Arrastou para a direita -> volta folha
            this.handleBack();
          }
        }
      };

      if (this.viewport) {
        this.viewport.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.viewport.addEventListener('touchend', this.handleTouchEnd, { passive: true });
      }
    }

    destroy() {
      this.clearAllTyping();
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.viewport) {
        this.viewport.removeEventListener('touchstart', this.handleTouchStart);
        this.viewport.removeEventListener('touchend', this.handleTouchEnd);
      }
    }

    clearAllTyping() {
      this.activeTypingTimeouts.forEach(t => clearTimeout(t));
      this.activeTypingTimeouts = [];
    }

    /**
     * Constrói o HTML de uma folha de caderno autêntica
     */
    createPageElement(pageIndex) {
      const page = this.pages[pageIndex] || this.pages[0];
      const pageEl = document.createElement('div');
      pageEl.className = 'book-page';
      pageEl.id = `book-page-${page.pageNumber}`;
      pageEl.style.zIndex = '10';

      const continueLabel = page.isLast ? 'virar a última página →' : 'Toque para continuar →';

      pageEl.innerHTML = `
        <!-- Furos da encadernação no lado esquerdo -->
        <div class="book-binder-holes" aria-hidden="true">
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
          <span class="binder-hole"></span>
        </div>

        <!-- Margem tradicional vertical vermelha/rosa fina -->
        <div class="book-margin-line" aria-hidden="true"></div>

        <!-- Zonas de toque laterais -->
        <div class="book-touch-zone-left" title="Voltar página"></div>
        <div class="book-touch-zone-right" title="Avançar página"></div>

        <!-- Sombra dinâmica de dobra da folha -->
        <div class="page-leaf-shadow" aria-hidden="true"></div>

        <!-- Conteúdo da folha sobre as linhas de caderno -->
        <div class="book-page-content" id="page-content-${page.pageNumber}">
          <div class="book-page-header">
            <h4 class="book-page-title">${page.title}</h4>
            <span class="book-page-number">${page.pageNumber} / ${this.totalPages}</span>
          </div>
          <div class="book-page-body" id="page-body-${page.pageNumber}"></div>
          <div class="book-page-footer">
            <button class="book-btn-prev" id="btn-page-prev-${page.pageNumber}" style="${page.pageNumber === 1 ? 'visibility:hidden;' : ''}">
              <i class="fas fa-chevron-left mr-1"></i> Anterior
            </button>
            <button class="book-btn-next" id="btn-page-next-${page.pageNumber}">
              <span>${continueLabel}</span>
            </button>
          </div>
        </div>
      `;

      // Eventos dos botões e áreas de toque
      const btnNext = pageEl.querySelector(`#btn-page-next-${page.pageNumber}`);
      const btnPrev = pageEl.querySelector(`#btn-page-prev-${page.pageNumber}`);
      const zoneLeft = pageEl.querySelector('.book-touch-zone-left');
      const zoneRight = pageEl.querySelector('.book-touch-zone-right');
      const pageContent = pageEl.querySelector(`#page-content-${page.pageNumber}`);

      if (btnNext) {
        btnNext.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAdvance();
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleBack();
        });
      }

      if (zoneRight) {
        zoneRight.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAdvance();
        });
      }

      if (zoneLeft) {
        zoneLeft.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.currentPageIndex > 0) {
            this.handleBack();
          }
        });
      }

      if (pageContent) {
        pageContent.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          if (this.state === 'READING') {
            this.skipCurrentText();
          }
        });
      }

      return pageEl;
    }

    displayPage(pageIndex) {
      this.clearAllTyping();
      this.skipRequested = false;
      this.currentPageIndex = pageIndex;
      this.state = 'READING';

      const pageEl = this.createPageElement(pageIndex);
      this.pagesWrapper.innerHTML = '';
      this.pagesWrapper.appendChild(pageEl);

      this.activePageEl = pageEl;
      this.startTypingPage(pageIndex, pageEl);
    }

    startTypingPage(pageIndex, pageEl) {
      const page = this.pages[pageIndex];
      if (!page) return;

      const bodyEl = pageEl.querySelector(`#page-body-${page.pageNumber}`);
      const btnNext = pageEl.querySelector(`#btn-page-next-${page.pageNumber}`);
      if (!bodyEl) return;

      bodyEl.innerHTML = '';
      const items = [...page.items];
      let itemIdx = 0;

      const renderItem = () => {
        if (this.skipRequested) {
          this.finalizeTextInstantly(page, bodyEl, btnNext);
          return;
        }

        if (itemIdx < items.length) {
          const it = items[itemIdx];
          const el = document.createElement('p');
          if (it.type === 'quote') {
            el.className = 'book-page-quote animate__animated animate__fadeIn';
          } else {
            el.className = 'animate__animated animate__fadeIn';
          }
          el.innerText = it.text;
          bodyEl.appendChild(el);
          itemIdx++;

          const delay = it.type === 'quote' ? 780 : 640;
          const timer = setTimeout(renderItem, delay);
          this.activeTypingTimeouts.push(timer);
        } else {
          this.state = 'READY';
          if (btnNext) {
            btnNext.classList.add('btn-ready');
          }
        }
      };

      renderItem();
    }

    skipCurrentText() {
      if (this.state !== 'READING') return;
      this.skipRequested = true;
      this.clearAllTyping();

      const page = this.pages[this.currentPageIndex];
      const pageEl = this.activePageEl;
      if (!page || !pageEl) return;

      const bodyEl = pageEl.querySelector(`#page-body-${page.pageNumber}`);
      const btnNext = pageEl.querySelector(`#btn-page-next-${page.pageNumber}`);

      this.finalizeTextInstantly(page, bodyEl, btnNext);
    }

    finalizeTextInstantly(page, bodyEl, btnNext) {
      if (!bodyEl) return;
      let html = '';
      page.items.forEach(it => {
        if (it.type === 'quote') {
          html += `<p class="book-page-quote animate__animated animate__fadeIn">${it.text}</p>`;
        } else {
          html += `<p class="animate__animated animate__fadeIn">${it.text}</p>`;
        }
      });
      bodyEl.innerHTML = html;

      this.state = 'READY';
      if (btnNext) {
        btnNext.classList.add('btn-ready');
      }
    }

    handleAdvance() {
      if (this.isTurningPage) return;

      if (this.state === 'READING') {
        this.skipCurrentText();
        return;
      }

      if (this.state === 'READY') {
        this.turnPageForward();
      }
    }

    handleBack() {
      if (this.isTurningPage || this.currentPageIndex <= 0) return;
      this.turnPageBackward();
    }

    /**
     * Animação realista de virada física de folha em 3D
     */
    turnPageForward() {
      if (this.isTurningPage) return;
      this.isTurningPage = true;
      this.state = 'TURNING';

      const currentPageEl = this.activePageEl;
      const nextIndex = this.currentPageIndex + 1;

      // Reproduz som sutil de papel virando via Web Audio API
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playPageTurnSound(1.0);
      } else if (this.soundEffects) {
        this.soundEffects.playPageTurn();
      }

      if (nextIndex < this.totalPages) {
        // Pré-cria a próxima folha por baixo
        const nextPageEl = this.createPageElement(nextIndex);
        nextPageEl.style.zIndex = '5';
        this.pagesWrapper.appendChild(nextPageEl);

        // Dispara animação física de virada em 3D
        currentPageEl.classList.add('page-physical-animating', 'page-physical-turn-forward');

        const onTurnEnd = () => {
          currentPageEl.removeEventListener('animationend', onTurnEnd);
          if (currentPageEl.parentNode) {
            currentPageEl.parentNode.removeChild(currentPageEl);
          }
          nextPageEl.style.zIndex = '10';
          this.activePageEl = nextPageEl;
          this.currentPageIndex = nextIndex;
          this.isTurningPage = false;
          this.state = 'READING';
          this.startTypingPage(nextIndex, nextPageEl);
        };

        currentPageEl.addEventListener('animationend', onTurnEnd, { once: true });
        setTimeout(() => {
          if (this.isTurningPage && this.currentPageIndex !== nextIndex) {
            onTurnEnd();
          }
        }, 620);

      } else {
        // Virando a última folha -> Conclusão para o Capítulo 20
        currentPageEl.classList.add('page-physical-animating', 'page-physical-turn-forward');

        const onFinalTurnEnd = () => {
          currentPageEl.removeEventListener('animationend', onFinalTurnEnd);
          this.isTurningPage = false;
          if (typeof this.onComplete === 'function') {
            this.onComplete();
          }
        };

        currentPageEl.addEventListener('animationend', onFinalTurnEnd, { once: true });
        setTimeout(() => {
          if (this.isTurningPage) {
            onFinalTurnEnd();
          }
        }, 620);
      }
    }

    /**
     * Animação de retorno físico da folha em 3D
     */
    turnPageBackward() {
      if (this.isTurningPage || this.currentPageIndex <= 0) return;
      this.isTurningPage = true;
      this.state = 'TURNING';

      const currentPageEl = this.activePageEl;
      const prevIndex = this.currentPageIndex - 1;

      // Reproduz som sutil de papel virando para trás via Web Audio API
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playPageTurnSound(1.0);
      } else if (this.soundEffects) {
        this.soundEffects.playPageTurn();
      }

      // Pré-cria folha anterior no topo com animação de desdobramento
      const prevPageEl = this.createPageElement(prevIndex);
      prevPageEl.style.zIndex = '30';
      prevPageEl.classList.add('page-physical-animating', 'page-physical-turn-backward');
      this.pagesWrapper.appendChild(prevPageEl);

      const page = this.pages[prevIndex];
      const bodyEl = prevPageEl.querySelector(`#page-body-${page.pageNumber}`);
      const btnNext = prevPageEl.querySelector(`#btn-page-next-${page.pageNumber}`);
      this.finalizeTextInstantly(page, bodyEl, btnNext);

      const onTurnBackEnd = () => {
        prevPageEl.removeEventListener('animationend', onTurnBackEnd);
        prevPageEl.classList.remove('page-physical-animating', 'page-physical-turn-backward');
        if (currentPageEl && currentPageEl.parentNode) {
          currentPageEl.parentNode.removeChild(currentPageEl);
        }
        prevPageEl.style.zIndex = '10';
        this.activePageEl = prevPageEl;
        this.currentPageIndex = prevIndex;
        this.isTurningPage = false;
        this.state = 'READY';
      };

      prevPageEl.addEventListener('animationend', onTurnBackEnd, { once: true });
      setTimeout(() => {
        if (this.isTurningPage) {
          onTurnBackEnd();
        }
      }, 620);
    }
  }

  // ==========================================
  // 4. CHAPTER DEFINITIONS
  // ==========================================
  const CHAPTERS = [
    // Cap 01
    {
      id: 1,
      title: "Tem alguma coisa acontecendo...",
      audioLevel: 0.6,
      render: (stage, sys) => {
        const saved = sys.progressManager.load();
        const hasSavedProgress = saved.started && saved.currentChapter > 1;

        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';

        let resumeHtml = '';
        if (hasSavedProgress) {
          resumeHtml = `
            <div class="alert alert-light border mt-3 mb-3 p-2 rounded">
              <small class="text-muted d-block mb-2">Você parou no <strong>Capítulo ${saved.currentChapter}</strong></small>
              <div class="d-flex justify-content-center gap-2">
                <button id="btn-quick-resume" class="btn btn-sm btn-primary mr-2">
                  <i class="fas fa-play mr-1"></i> Continuar de onde parou
                </button>
                <button id="btn-quick-restart" class="btn btn-sm btn-outline-danger">
                  <i class="fas fa-redo mr-1"></i> Recomeçar
                </button>
              </div>
            </div>
          `;
        }

        container.innerHTML = `
          <div class="mb-3">
            <i class="fas fa-sparkles fa-2x text-warning animate__animated animate__pulse animate__infinite"></i>
          </div>
          <p id="line1" class="lead-text animate__animated animate__fadeIn">Tem alguma coisa acontecendo...</p>
          <p id="line2" class="sub-text d-none animate__animated animate__fadeIn">E, por algum motivo, isso tem o seu nome.</p>
          <div id="name-box" class="d-none animate__animated animate__zoomIn my-3">
            <span class="bday-name">ISSAMARA</span>
          </div>
          ${resumeHtml}
          <div id="btn-box" class="mt-4 ${hasSavedProgress ? '' : 'd-none animate__animated animate__fadeInUp'}">
            <button id="btn-entrar" class="btn btn-primary btn-lg px-5 shadow">
              <i class="fas fa-star mr-2"></i> ENTRAR
            </button>
          </div>
        `;

        stage.appendChild(container);

        if (hasSavedProgress) {
          document.getElementById('name-box').classList.remove('d-none');
          document.getElementById('line2').classList.remove('d-none');
          document.getElementById('btn-quick-resume').addEventListener('click', () => {
            sys.audioManager.play();
            sys.goToChapter(saved.currentChapter);
          });
          document.getElementById('btn-quick-restart').addEventListener('click', () => {
            sys.openRestartModal();
          });
        } else {
          sys.timer.setTimeout(() => {
            const l2 = document.getElementById('line2');
            if (l2) l2.classList.remove('d-none');
          }, 1400);

          sys.timer.setTimeout(() => {
            const nb = document.getElementById('name-box');
            if (nb) nb.classList.remove('d-none');
          }, 2800);

          sys.timer.setTimeout(() => {
            const bb = document.getElementById('btn-box');
            if (bb) bb.classList.remove('d-none');
          }, 4000);
        }

        const btnEntrar = document.getElementById('btn-entrar');
        if (btnEntrar) {
          btnEntrar.addEventListener('click', () => {
            sys.audioManager.play();
            sys.nextChapter();
          });
        }
      }
    },

    // Cap 02
    {
      id: 2,
      title: "24 de Setembro",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <h5 id="p2_line1" class="text-muted animate__animated animate__fadeIn">24 de setembro.</h5>
            <p id="p2_line2" class="lead-text d-none animate__animated animate__fadeIn mt-3">Um dia normal para muita gente.</p>
            <p id="p2_line3" class="font-italic text-secondary d-none animate__animated animate__fadeIn mt-2">Mas não hoje.</p>
            <div id="p2_line4" class="d-none animate__animated animate__zoomIn mt-4">
              <h3 class="bday-title text-danger font-weight-bold">Hoje é o seu dia.</h3>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p2_line2');
          if (el) el.classList.remove('d-none');
        }, 1300);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p2_line3');
          if (el) el.classList.remove('d-none');
        }, 2800);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p2_line4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 4200);
      }
    },

    // Cap 03
    {
      id: 3,
      title: "18 Anos",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <div class="display-18 animate__animated animate__bounceIn">18</div>
            <h4 id="p3_line1" class="font-weight-bold mt-2 animate__animated animate__fadeIn">Dezoito anos.</h4>
            <p id="p3_line2" class="lead-text d-none animate__animated animate__fadeIn mt-3">
              Uma idade nova, um ciclo novo e um monte de coisa boa pela frente.
            </p>
            <div id="p3_line3" class="d-none animate__animated animate__heartBeat mt-4">
              <span class="badge badge-pill badge-danger px-4 py-2" style="font-size: 20px;">
                Feliz 18! 🎉
              </span>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p3_line2');
          if (el) el.classList.remove('d-none');
        }, 1500);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p3_line3');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 3200);
      }
    },

    // Cap 04
    {
      id: 4,
      title: "Hoje é dia de comemorar",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <p id="p4_1" class="lead-text animate__animated animate__fadeIn">Hoje não é dia de pensar demais.</p>
            <p id="p4_2" class="lead-text d-none animate__animated animate__fadeIn text-danger font-weight-bold">É dia de comemorar.</p>
            <p id="p4_3" class="sub-text d-none animate__animated animate__fadeIn">Então aproveita.</p>
            <div id="p4_4" class="d-none animate__animated animate__zoomIn mt-4">
              <h3 class="bday-title">O dia é seu. 🎂</h3>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p4_2');
          if (el) el.classList.remove('d-none');
        }, 1400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p4_3');
          if (el) el.classList.remove('d-none');
        }, 2700);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p4_4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 4000);
      }
    },

    // Cap 05
    {
      id: 5,
      title: "Primeiro Desejo",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <span class="badge badge-info px-3 py-1 mb-3">Desejo 1 de 5</span>
            <h4 class="font-weight-bold mb-3 animate__animated animate__fadeIn">Primeiro desejo:</h4>
            <div id="p5_msg" class="d-none animate__animated animate__fadeInUp">
              <p class="lead-text text-dark" style="font-size: 22px;">
                que nunca falte paz nos seus dias. 🕊️
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p5_msg');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 1500);
      }
    },

    // Cap 06
    {
      id: 6,
      title: "Segundo Desejo",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <span class="badge badge-info px-3 py-1 mb-3">Desejo 2 de 5</span>
            <p id="p6_1" class="lead-text animate__animated animate__fadeIn">
              Que nunca faltem motivos para você sorrir. 😊
            </p>
            <p id="p6_2" class="sub-text d-none animate__animated animate__fadeIn mt-3 text-muted">
              Dos grandes, mas principalmente daqueles pequenos que aparecem do nada.
            </p>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p6_2');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 1800);
      }
    },

    // Cap 07
    {
      id: 7,
      title: "Terceiro Desejo",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <span class="badge badge-info px-3 py-1 mb-3">Desejo 3 de 5</span>
            <p id="p7_1" class="lead-text animate__animated animate__fadeInLeft">Que seus planos deem certo.</p>
            <p id="p7_2" class="lead-text d-none animate__animated animate__fadeInRight mt-2">Que seus esforços valham a pena.</p>
            <div id="p7_3" class="d-none animate__animated animate__fadeInUp mt-3">
              <p class="font-weight-bold text-primary" style="font-size: 20px;">
                E que você consiga chegar onde quiser chegar. 🚀
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p7_2');
          if (el) el.classList.remove('d-none');
        }, 1500);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p7_3');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 3000);
      }
    },

    // Cap 08
    {
      id: 8,
      title: "Quarto Desejo",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <span class="badge badge-info px-3 py-1 mb-3">Desejo 4 de 5</span>
            <div class="my-2">
              <i class="fas fa-hands-helping fa-2x text-warning mb-2 animate__animated animate__pulse"></i>
            </div>
            <p class="lead-text animate__animated animate__fadeIn mt-2" style="font-size: 21px;">
              Que você esteja sempre perto de pessoas que realmente querem ver você bem. ✨
            </p>
          </div>
        `;
        stage.appendChild(container);
        sys.timer.setTimeout(() => sys.showTapPrompt(), 2000);
      }
    },

    // Cap 09
    {
      id: 9,
      title: "Quinto Desejo",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <span class="badge badge-info px-3 py-1 mb-3">Desejo 5 de 5</span>
            <p id="p9_1" class="lead-text animate__animated animate__fadeIn">
              E que esse novo ciclo te surpreenda.
            </p>
            <div id="p9_2" class="d-none animate__animated animate__zoomIn mt-3">
              <p class="font-weight-bold text-danger" style="font-size: 22px;">
                De preferência, das melhores maneiras possíveis. ✨
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p9_2');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 1800);
      }
    },

    // Cap 10
    {
      id: 10,
      title: "Só uma coisa...",
      audioLevel: 0.55,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <h5 id="p10_1" class="text-muted font-italic animate__animated animate__fadeIn">Só uma coisa...</h5>
            <p id="p10_2" class="sub-text d-none animate__animated animate__fadeIn mt-3">
              A gente acabou ficando um pouco distante com o tempo.
            </p>
            <p id="p10_3" class="lead-text d-none animate__animated animate__fadeIn mt-2 text-dark">
              E, sendo sincero, às vezes eu sinto falta de quando a gente conversava mais.
            </p>
            <p id="p10_4" class="sub-text d-none animate__animated animate__fadeIn mt-2 text-secondary">
              Mas isso é só uma saudade.
            </p>
            <div id="p10_5" class="d-none animate__animated animate__fadeIn mt-3">
              <p class="font-weight-bold text-primary" style="font-size: 19px;">
                O mais importante hoje é te desejar um aniversário incrível.
              </p>
            </div>
            <p id="p10_6" class="text-muted font-italic d-none animate__animated animate__fadeIn mt-3">
              Agora chega de sentimentalismo. 😂
            </p>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p10_2');
          if (el) el.classList.remove('d-none');
        }, 1500);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p10_3');
          if (el) el.classList.remove('d-none');
        }, 3400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p10_4');
          if (el) el.classList.remove('d-none');
        }, 5200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p10_5');
          if (el) el.classList.remove('d-none');
        }, 6800);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p10_6');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 8400);
      }
    },

    // Cap 11 - O Tempo e Você
    {
      id: 11,
      title: "O Tempo e Você",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <div class="chapter-flower-emblem mb-3 animate__animated animate__zoomIn">
              <span style="font-size: 42px; display: inline-block; filter: drop-shadow(0 4px 12px rgba(255, 105, 180, 0.4));">🌸</span>
            </div>
            <p id="p11_1" class="lead-text font-weight-bold animate__animated animate__fadeIn" style="font-size: 21px; color: #ad1457;">
              Dezoito anos não são apenas números em um calendário.
            </p>
            <p id="p11_2" class="sub-text d-none animate__animated animate__fadeIn mt-3 text-dark">
              São histórias vividas, aprendizados silenciosos, sorrisos compartilhados e cada detalhe que construiu quem você é hoje.
            </p>
            <p id="p11_3" class="lead-text d-none animate__animated animate__fadeIn mt-3" style="color: #c2185b;">
              Cada ano foi como uma pétala que encontrou o seu lugar para brotar e se firmar.
            </p>
            <p id="p11_4" class="font-italic d-none animate__animated animate__fadeIn mt-3 text-secondary" style="font-size: 17px;">
              E ver você chegar aos 18 é ver essa flor em sua forma mais luminosa e especial. ✨
            </p>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_2');
          if (el) el.classList.remove('d-none');
        }, 1500);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_3');
          if (el) el.classList.remove('d-none');
        }, 3400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 5200);
      }
    },

    // Cap 12
    {
      id: 12,
      title: "Amizade",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <p id="p12_1" class="lead-text animate__animated animate__fadeIn">A vida muda.</p>
            <p id="p12_2" class="lead-text d-none animate__animated animate__fadeIn mt-2">As pessoas mudam.</p>
            <p id="p12_3" class="lead-text d-none animate__animated animate__fadeIn mt-2">Os caminhos também.</p>
            <div id="p12_4" class="d-none animate__animated animate__fadeInUp mt-4">
              <p class="font-weight-bold text-dark" style="font-size: 21px;">
                Mas algumas amizades continuam tendo um lugar especial na memória. 💛
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p12_2');
          if (el) el.classList.remove('d-none');
        }, 1200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p12_3');
          if (el) el.classList.remove('d-none');
        }, 2400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p12_4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 3800);
      }
    },

    // Cap 13
    {
      id: 13,
      title: "Daqui pra frente",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <p id="p13_1" class="lead-text font-weight-bold animate__animated animate__fadeIn">
              Daqui pra frente ainda tem muita coisa para acontecer.
            </p>
            <div class="mt-3">
              <p id="p13_2" class="sub-text d-none animate__animated animate__fadeIn">📍 Novos lugares.</p>
              <p id="p13_3" class="sub-text d-none animate__animated animate__fadeIn">👥 Novas pessoas.</p>
              <p id="p13_4" class="sub-text d-none animate__animated animate__fadeIn">📖 Novas histórias.</p>
            </div>
            <div id="p13_5" class="d-none animate__animated animate__zoomIn mt-4">
              <p class="font-weight-bold text-danger" style="font-size: 20px;">
                E, principalmente, muitos motivos para comemorar! 🎉
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p13_2');
          if (el) el.classList.remove('d-none');
        }, 1200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p13_3');
          if (el) el.classList.remove('d-none');
        }, 2200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p13_4');
          if (el) el.classList.remove('d-none');
        }, 3200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p13_5');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 4400);
      }
    },

    // Cap 14
    {
      id: 14,
      title: "Torcendo por você",
      audioLevel: 0.65,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <div class="mb-3">
              <i class="fas fa-award fa-2x text-warning animate__animated animate__pulse"></i>
            </div>
            <p id="p14_1" class="lead-text animate__animated animate__fadeIn">
              Mesmo de longe, eu espero que você consiga tudo aquilo que deseja.
            </p>
            <div id="p14_2" class="d-none animate__animated animate__fadeInUp mt-3">
              <p class="font-weight-bold text-primary" style="font-size: 21px;">
                E vou continuar torcendo por você. ⭐
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p14_2');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 1800);
      }
    },

    // Cap 15
    {
      id: 15,
      title: "Isso aqui é um presente",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <div id="gift-box-el" class="gift-box-anim animate__animated animate__heartBeat animate__infinite">
              <i class="fas fa-gift"></i>
            </div>
            <p id="p15_1" class="lead-text animate__animated animate__fadeIn">
              Eu poderia simplesmente ter mandado “feliz aniversário”.
            </p>
            <p id="p15_2" class="sub-text d-none animate__animated animate__fadeIn mt-2">
              Mas achei que seria mais divertido fazer tudo isso aqui.
            </p>
            <div id="p15_3" class="d-none animate__animated animate__fadeInUp mt-3">
              <p class="font-weight-bold text-danger" style="font-size: 20px;">
                Então... aproveita. 😂🎁
              </p>
            </div>
          </div>
        `;
        stage.appendChild(container);

        const gift = document.getElementById('gift-box-el');
        if (gift) {
          gift.addEventListener('click', () => {
            gift.classList.remove('animate__heartBeat');
            gift.classList.add('animate__tada');
            if (window.confetti) {
              window.confetti({
                particleCount: 30,
                spread: 70,
                origin: { y: 0.6 }
              });
            }
          });
        }

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p15_2');
          if (el) el.classList.remove('d-none');
        }, 1600);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p15_3');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 3200);
      }
    },

    // Cap 16
    {
      id: 16,
      title: "Está chegando...",
      audioLevel: 0.8,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <p id="p16_1" class="text-muted font-italic animate__animated animate__fadeIn">Tá...</p>
            <p id="p16_2" class="lead-text d-none animate__animated animate__fadeIn mt-2">Acho que já falei demais.</p>
            <p id="p16_3" class="sub-text d-none animate__animated animate__fadeIn mt-2">Agora vamos para a parte importante.</p>
            <div id="p16_4" class="d-none animate__animated animate__zoomIn mt-4">
              <h2 class="font-weight-bold text-danger display-4" style="font-size: 40px; letter-spacing: 2px;">
                PREPARADA? 👀
              </h2>
            </div>
          </div>
        `;
        stage.appendChild(container);

        // Music swells up
        sys.audioManager.fadeTo(0.85, 2000);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p16_2');
          if (el) el.classList.remove('d-none');
        }, 1000);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p16_3');
          if (el) el.classList.remove('d-none');
        }, 2200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p16_4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 3600);
      }
    },

    // Cap 17 - Revelação Especial: FELIZ ANIVERSÁRIO & FOTO DE HAPPY DAY
    {
      id: 17,
      title: "Feliz Aniversário! (Foto de Happy Day 🎉)",
      audioLevel: 1.0,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'chapter-stage animate__animated animate__fadeIn text-center w-100';
        container.innerHTML = `
          <div id="c17_step1" class="kotak animate__animated animate__zoomIn">
            <div class="display-18">18</div>
          </div>
          <div id="c17_step2" class="kotak d-none animate__animated animate__bounceIn">
            <h2 class="display-4 font-weight-bold text-danger">18 ANOS</h2>
          </div>
          <div id="c17_step3" class="kotak d-none animate__animated animate__zoomIn">
            <h1 class="bday-title text-primary" style="font-size: 42px;">FELIZ ANIVERSÁRIO</h1>
          </div>
          <div id="c17_step4" class="kotak d-none animate__animated animate__tada">
            <div class="happy-day-photo-frame mb-3">
              <img src="./img/hbd1.png" onerror="this.onerror=null; this.src='./img/hbd.png';" class="img happy-day-img" alt="Foto de Happy Day - Parabéns Issamara">
            </div>
            <div class="bday-name display-4" style="font-size: 44px;">ISSAMARA 🎉</div>
            <div class="c17-axolotl-cheer animate__animated animate__fadeInUp mt-2 mb-2">
              <span style="font-size: 22px;">🪷</span>
              <span style="font-size: 15px; color: #ad1457; font-weight: 700;">Parabéns pelos seus 18 anos, Issamara!</span>
              <span style="font-size: 22px;">🎉</span>
            </div>
            <p class="lead-text mt-2 text-dark">Que seu dia e seus 18 anos sejam repletos de sorrisos, conquistas e felicidade!</p>
            <div class="mt-3 d-flex justify-content-center align-items-center flex-wrap" style="gap: 12px;">
              <button class="btn btn-primary rounded-pill px-4 py-2 font-weight-bold shadow" id="btn-c17-to-video" style="background: linear-gradient(135deg, #e91e63, #ff4081); border: none; font-size: 15px;">
                <i class="fas fa-birthday-cake mr-1"></i> Ir para o Bolo & Assoprar a Vela 🎂
              </button>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.audioManager.fadeTo(1.0, 1000);

        // Sequence of reveals: 18 -> 18 ANOS -> FELIZ ANIVERSÁRIO -> FOTO DE HAPPY DAY
        sys.timer.setTimeout(() => {
          const s1 = document.getElementById('c17_step1');
          const s2 = document.getElementById('c17_step2');
          if (s1) s1.classList.add('d-none');
          if (s2) s2.classList.remove('d-none');
          if (window.confetti) {
            window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
          }
        }, 1400);

        sys.timer.setTimeout(() => {
          const s2 = document.getElementById('c17_step2');
          const s3 = document.getElementById('c17_step3');
          if (s2) s2.classList.add('d-none');
          if (s3) s3.classList.remove('d-none');
          if (window.confetti) {
            window.confetti({ particleCount: 70, spread: 90, origin: { y: 0.5 } });
          }
        }, 2800);

        sys.timer.setTimeout(() => {
          const s3 = document.getElementById('c17_step3');
          const s4 = document.getElementById('c17_step4');
          if (s3) s3.classList.add('d-none');
          if (s4) s4.classList.remove('d-none');

          const btnToVideo = container.querySelector('#btn-c17-to-video');
          if (btnToVideo) {
            btnToVideo.addEventListener('click', (e) => {
              e.stopPropagation();
              sys.nextChapter();
            });
          }

          // Grand celebratory fireworks / confetti cannons from both sides
          if (window.confetti) {
            const end = Date.now() + 2500;
            const colors = ['#ff5e7e', '#ffd166', '#06d6a0', '#118ab2', '#ff9a9e'];
            (function frame() {
              window.confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: colors
              });
              window.confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: colors
              });
              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            })();
          }

          sys.showTapPrompt();
        }, 4400);
      }
    },

    // Cap 18 - Animação do Vídeo: Assopre a Vela & Axolote Cantor
    {
      id: 18,
      title: "A festa começa (Assopre a Vela! 🎂)",
      audioLevel: 0.9,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'chapter-stage animate__animated animate__fadeIn text-center w-100';
        stage.appendChild(container);

        sys.hideTapPrompt();

        // Inicializa a Animação Completa do Vídeo
        sys.activeAnimController = new BirthdayVideoAnimController(container, sys);
        sys.activeAnimController.render();
      }
    },

    // Cap 19 - O Livro de Memórias (6-Page Digital Book)
    {
      id: 19,
      title: "O Livro de Memórias",
      audioLevel: 0.5,
      render: (stage, sys) => {
        // Lower volume gently for reading the heartfelt digital book
        sys.audioManager.fadeTo(0.5, 1500);
        // Hide generic bottom tap prompt, the book has its own page-by-page continue indicator
        sys.hideTapPrompt();

        // Launch 6-Page Digital Book Controller
        sys.activeBookController = new DigitalBookController(stage, sys, () => {
          // When 6th page is turned, proceed smoothly to Chapter 20
          sys.nextChapter();
        });
      }
    },

    // Cap 20 - O Grande Encerramento (Cena Final Definitiva - 30 Segundos Contínuos)
    {
      id: 20,
      title: "🌸 E Agora? — O Grande Encerramento",
      audioLevel: 0.70,
      render: (stage, sys) => {
        sys.hideTapPrompt();
        sys.activeFinaleController = new EAgoraFinaleController(stage, sys);
      }
    }
  ];

  // ==========================================================================
  // 4.3. BIRTHDAY VIDEO ANIMATION CONTROLLER (VELA & AXOLOTE CANTOR)
  // ==========================================================================
  // CAPÍTULO 18: BOLO DE ANIVERSÁRIO & PEDIDO DOS 18 ANOS (Visual Limpo e Serena Celebração)
  // 1. Contagem regressiva e bolo interativo (blow the candle in 4, 3, 2, 1)
  // 2. Sopro de ar, vela apagada e chuva de confetes festivos
  // 3. Revelação serena do desejo realizado e transição para o Livro de Memórias
  // ==========================================================================
  class BirthdayVideoAnimController {
    constructor(container, sys) {
      this.container = container;
      this.sys = sys;
      this.isDestroyed = false;
      this.countdownTimer = null;
      this.currentCount = 4;
      this.isBlown = false;
      this.timeouts = [];
    }

    destroy() {
      this.isDestroyed = true;
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      this.timeouts.forEach(t => clearTimeout(t));
      this.timeouts = [];
    }

    addTimeout(fn, delay) {
      const t = setTimeout(() => {
        if (!this.isDestroyed) fn();
      }, delay);
      this.timeouts.push(t);
      return t;
    }

    render() {
      this.container.innerHTML = `
        <div class="bday-anim-card animate__animated animate__zoomIn" id="bday-anim-card">
          <!-- 1. CENA DO BOLO & CONTAGEM REGRESSIVA -->
          <div class="cake-scene-container" id="cake-scene-container">
            <div class="cake-header-lead">blow the candle in...</div>
            <div class="cake-countdown-box">
              <span class="cake-countdown-digit" id="cake-countdown-digit">4</span>
            </div>

            <div class="cake-svg-wrapper" id="cake-svg-wrapper" title="Toque para apagar a vela!">
              ${this.getCakeSvg()}
              <div class="cake-wind-effect" id="cake-wind-effect">💨</div>
            </div>

            <button class="btn-blow-candle" id="btn-blow-candle">
              <i class="fas fa-wind"></i> Assopre a vela
            </button>
            <p class="text-muted mt-2" style="font-size: 13px; color: #526f84 !important;">
              (Faça um pedido para os seus 18 anos! ✨)
            </p>
          </div>

          <!-- 2. REVELAÇÃO DO PEDIDO REALIZADO & CELEBRAÇÃO LIMPA -->
          <div class="cake-wish-granted d-none" id="cake-wish-granted">
            <div class="wish-icon mb-2">✨🎂✨</div>
            <h3 class="wish-title">Pedido Feito!</h3>
            <p class="wish-text">
              Que cada sonho e desejo guardado no seu coração se torne realidade neste novo ciclo de 18 anos.
            </p>
            <div class="mt-4 d-flex justify-content-center align-items-center flex-wrap" style="gap: 12px;">
              <button class="btn-wish-replay" id="btn-cake-replay">
                <i class="fas fa-redo mr-1"></i> Assoprar novamente
              </button>
              <button class="btn-wish-continue" id="btn-cake-continue">
                Continuar para o Livro de Memórias <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      this.bindEvents();
      this.startCountdown();
    }

    bindEvents() {
      const btnBlow = this.container.querySelector('#btn-blow-candle');
      const cakeWrapper = this.container.querySelector('#cake-svg-wrapper');
      const btnReplay = this.container.querySelector('#btn-cake-replay');
      const btnContinue = this.container.querySelector('#btn-cake-continue');

      if (btnBlow) {
        btnBlow.addEventListener('click', () => this.blowCandle());
      }
      if (cakeWrapper) {
        cakeWrapper.addEventListener('click', () => this.blowCandle());
      }
      if (btnReplay) {
        btnReplay.addEventListener('click', () => this.replayAll());
      }
      if (btnContinue) {
        btnContinue.addEventListener('click', () => {
          if (this.sys && typeof this.sys.nextChapter === 'function') {
            this.sys.nextChapter();
          }
        });
      }
    }

    startCountdown() {
      this.currentCount = 4;
      const digitEl = this.container.querySelector('#cake-countdown-digit');
      if (digitEl) digitEl.textContent = '4';

      if (this.countdownTimer) clearInterval(this.countdownTimer);

      this.countdownTimer = setInterval(() => {
        if (this.isDestroyed || this.isBlown) {
          clearInterval(this.countdownTimer);
          return;
        }

        this.currentCount--;
        const digit = this.container.querySelector('#cake-countdown-digit');
        if (digit) {
          digit.textContent = this.currentCount > 0 ? this.currentCount : '0';
          digit.style.animation = 'none';
          digit.offsetHeight; // trigger reflow
          digit.style.animation = '';
        }

        if (this.currentCount <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.blowCandle();
        }
      }, 1000);
    }

    blowCandle() {
      if (this.isBlown || this.isDestroyed) return;
      this.isBlown = true;
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }

      const windEl = this.container.querySelector('#cake-wind-effect');
      const flameEl = this.container.querySelector('#cake-flame-group');
      const smokeEl = this.container.querySelector('#cake-smoke-group');
      const wishGranted = this.container.querySelector('#cake-wish-granted');
      const btnBlow = this.container.querySelector('#btn-blow-candle');

      if (btnBlow) btnBlow.disabled = true;

      // 1. Som suave de sopro de ar
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playCandleBlowSound(1.0);
      }

      // 2. Animação de vento e extinção da chama com fumaça
      if (windEl) windEl.classList.add('wind-active');
      if (flameEl) flameEl.classList.add('flame-blown');
      if (smokeEl) smokeEl.classList.add('smoke-active');

      // Chuva festiva comemorativa de confetes
      if (window.confetti) {
        window.confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#ff4081', '#ffd54f', '#ffffff', '#e040fb', '#80d8ff']
        });
      }

      // 3. Revelação da celebração limpa sem elementos cômicos
      this.addTimeout(() => {
        if (btnBlow) btnBlow.style.display = 'none';
        const leadEl = this.container.querySelector('.cake-header-lead');
        if (leadEl) leadEl.textContent = 'Vela assoprada! ✨';
        const countBox = this.container.querySelector('.cake-countdown-box');
        if (countBox) countBox.style.display = 'none';
        if (wishGranted) wishGranted.classList.remove('d-none');
      }, 1100);
    }

    replayAll() {
      this.destroy();
      this.isDestroyed = false;
      this.isBlown = false;
      this.currentCount = 4;
      this.timeouts = [];
      this.render();
    }

    getCakeSvg() {
      return `
        <svg viewBox="0 0 320 320" class="cake-svg-el" id="cake-svg">
          <defs>
            <linearGradient id="cakePlateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#d4e3ed"/>
            </linearGradient>
            <linearGradient id="cakeDripGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffb3c6"/>
              <stop offset="100%" stop-color="#ff8da7"/>
            </linearGradient>
            <linearGradient id="cakeBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fff8f0"/>
              <stop offset="100%" stop-color="#fceddb"/>
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#ff5722"/>
              <stop offset="45%" stop-color="#ff9800"/>
              <stop offset="85%" stop-color="#ffeb3b"/>
              <stop offset="100%" stop-color="#ffffff"/>
            </linearGradient>
            <pattern id="candleStripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="10" height="20" fill="#ff4081"/>
              <rect x="10" width="10" height="20" fill="#ffffff"/>
            </pattern>
          </defs>
          
          <!-- Prato do bolo -->
          <ellipse cx="160" cy="285" rx="140" ry="22" fill="url(#cakePlateGrad)" stroke="#2b455b" stroke-width="3.5"/>
          <ellipse cx="160" cy="282" rx="125" ry="16" fill="#f0f7fb" opacity="0.6"/>

          <!-- Camada Inferior (Tier 2) -->
          <rect x="52" y="195" width="216" height="80" rx="14" fill="url(#cakeBaseGrad)" stroke="#2b455b" stroke-width="3.5"/>
          <!-- Cobertura Rosa Ondulada Inferior -->
          <path d="M 52 195 L 268 195 C 268 205 264 218 252 218 C 242 218 238 206 230 206 C 220 206 216 226 202 226 C 190 226 186 210 176 210 C 166 210 162 232 148 232 C 136 232 130 212 120 212 C 110 212 104 228 92 228 C 82 228 78 208 68 208 C 58 208 52 215 52 215 Z" fill="url(#cakeDripGrad)" stroke="#2b455b" stroke-width="3.5"/>

          <!-- Camada Superior (Tier 1) -->
          <rect x="88" y="120" width="144" height="76" rx="12" fill="url(#cakeBaseGrad)" stroke="#2b455b" stroke-width="3.5"/>
          <!-- Cobertura Rosa Ondulada Superior -->
          <path d="M 88 120 L 232 120 C 232 130 228 140 218 140 C 208 140 204 128 196 128 C 188 128 184 148 172 148 C 162 148 158 132 148 132 C 138 132 134 146 122 146 C 112 146 108 130 98 130 C 92 130 88 135 88 135 Z" fill="url(#cakeDripGrad)" stroke="#2b455b" stroke-width="3.5"/>

          <!-- Puffs de Chantilly no Topo -->
          <circle cx="106" cy="116" r="11" fill="#ffffff" stroke="#2b455b" stroke-width="3"/>
          <circle cx="138" cy="114" r="11" fill="#ffffff" stroke="#2b455b" stroke-width="3"/>
          <circle cx="182" cy="114" r="11" fill="#ffffff" stroke="#2b455b" stroke-width="3"/>
          <circle cx="214" cy="116" r="11" fill="#ffffff" stroke="#2b455b" stroke-width="3"/>

          <!-- Confeitos fofos coloridos -->
          <circle cx="115" cy="165" r="3.5" fill="#ff4081"/>
          <circle cx="145" cy="172" r="3.5" fill="#4fc3f7"/>
          <circle cx="185" cy="168" r="3.5" fill="#ffd54f"/>
          <circle cx="205" cy="175" r="3.5" fill="#66bb6a"/>
          <circle cx="75" cy="245" r="4" fill="#ffd54f"/>
          <circle cx="110" cy="255" r="4" fill="#ff4081"/>
          <circle cx="160" cy="250" r="4" fill="#4fc3f7"/>
          <circle cx="210" cy="256" r="4" fill="#ab47bc"/>
          <circle cx="245" cy="248" r="4" fill="#ffa726"/>

          <!-- Vela Listrada -->
          <rect x="153" y="58" width="14" height="60" rx="4" fill="url(#candleStripes)" stroke="#2b455b" stroke-width="3"/>
          <!-- Pavio -->
          <line x1="160" y1="58" x2="160" y2="44" stroke="#2b455b" stroke-width="3.5" stroke-linecap="round"/>

          <!-- Chama Viva com Brilho -->
          <g id="cake-flame-group" class="cake-flame">
            <path d="M 160 14 C 145 28 147 43 160 47 C 173 43 175 28 160 14 Z" fill="url(#flameGrad)" stroke="#ff6f00" stroke-width="1.5"/>
            <ellipse cx="160" cy="38" rx="4" ry="7" fill="#ffffff" opacity="0.8"/>
          </g>

          <!-- Fumaça de sopro -->
          <g id="cake-smoke-group" class="cake-smoke-group">
            <path d="M 160 42 Q 152 30 162 20 Q 172 10 160 0" fill="none" stroke="#90a4ae" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 2"/>
            <path d="M 164 42 Q 175 32 168 22" fill="none" stroke="#b0bec5" stroke-width="2.5" stroke-linecap="round"/>
          </g>
        </svg>
      `;
    }
  }

  // ==========================================================================
  // ==========================================================================
  // 4.4. 🌸 CAPÍTULO FINAL — “E AGORA?” (O Grande Encerramento Visual)
  // Fluxo completo executado com rigor poético e estético:
  // 1. Transição da tela anterior (luz diminui, linha luminosa permanece e cruza)
  // 2. Retorno da linha do tempo: 2008 ... 2026 com destaque
  // 3. 24 • 09 • 2026 -> 24 de setembro -> 18 anos
  // 4. A linha tenta avançar e para (sem 2027/2028: "Chegamos até aqui. O resto ainda não foi escrito.")
  // 5. Pausa contemplativa
  // 6. Linha se desfaz em partículas de luz
  // 7. Partículas sobem organicamente formando um céu suave
  // 8. Transformação em estrelas cintilantes (fundo claro, rosa, branco, azul suave)
  // 9. Estrelas começam a se conectar por uma linha fina
  // 10. A própria linha desenha a flor (caule, folhas, pétalas)
  // 11. A flor ganha vida (luz percorre o caule, centro brilha com movimento suave)
  // 12. Frase 1: "Algumas coisas a gente não consegue prever."
  // 13. Frase 2: "Só consegue viver."
  // 14. Mudança de atmosfera e música crescente
  // 15. Explosão visual nascendo do centro da flor
  // 16. Surgimento: FELIZ -> ANIVERSÁRIO -> ISSAMARA
  // 17. Grande celebração com camadas de profundidade e harmonia
  // 18. Movimento suave de câmera (paralaxe)
  // 19. Som orquestrado em cada fase
  // 20. Desaceleração suave da celebração
  // 21. A flor permanece serena no centro
  // 22. Mensagem final: "Que os próximos anos sejam tão bonitos quanto os que ainda estão por vir." -> "Feliz 18 anos. ❤️"
  // 23. Assinatura animada: Luis -> Criatura -> Luis -> Criatura -> Luis
  // 24. Última pausa contemplativa
  // 25. Encerramento visual: flor e estrelas diminuem até restar uma estrela que se apaga
  // 26. "Fim."
  // 27. Créditos elegantes e integrados
  // 28. "Espero poder te ver novamente."
  // 29. Encerramento do sistema & guardar experiência
  // 30. Baixar os textos em PDF (organizado conforme os 6 tópicos)
  // 31. Estado final para reconexões futuras
  // ==========================================================================
  class EAgoraFinaleController {
    constructor(container, experienceSystem) {
      this.container = container;
      this.sys = experienceSystem;
      this.isDestroyed = false;
      this.timeouts = [];
      this.animFrame = null;
      this.particles = [];
      this.constellations = [];
      this.shockwaves = [];
      this.fallingPetals = [];
      this.pollenGrains = [];
      this.showConstellations = false;
      this.fallingPetalsActive = false;
      this.pollenActive = false;
      this.resizeHandler = null;

      this.init();
    }

    init() {
      if (!this.container) return;
      this.container.innerHTML = '';

      document.body.classList.add('eagora-fullscreen-active');

      // Cria a estrutura visual completa do capítulo final
      this.stage = document.createElement('div');
      this.stage.className = 'eagora-stage';
      this.stage.id = 'eagora-stage';
      this.stage.innerHTML = `
        <!-- Camada de Transição Suave da Tela Anterior -->
        <div class="eagora-transition-curtain" id="eagora-curtain">
          <div class="eagora-living-line" id="eagora-living-line"></div>
        </div>

        <!-- Canvas de Partículas Estelares e Poeira Cósmica Clara -->
        <canvas class="eagora-canvas" id="eagora-canvas"></canvas>

        <!-- Container da Linha do Tempo Reencontrada -->
        <div class="eagora-timeline-wrap" id="eagora-timeline-wrap">
          <div class="eagora-track-container">
            <div class="eagora-track-path" id="eagora-track-path">
              <div class="eagora-track-fill" id="eagora-track-fill"></div>
              <div class="eagora-head-dot" id="eagora-head-dot"></div>
            </div>
            
            <div class="eagora-years-row" id="eagora-years-row">
              <span class="eagora-year-marker year-2008" id="marker-2008">2008</span>
              <span class="eagora-year-dot dot-mid" style="left: 20%;"></span>
              <span class="eagora-year-dot dot-mid" style="left: 40%;"></span>
              <span class="eagora-year-dot dot-mid" style="left: 60%;"></span>
              <span class="eagora-year-dot dot-mid" style="left: 80%;"></span>
              <span class="eagora-year-marker year-2026" id="marker-2026">2026</span>
            </div>
          </div>

          <!-- Revelação Sequencial da Chegada em 24 de Setembro -->
          <div class="eagora-milestone-box" id="eagora-milestone-box">
            <div class="eagora-date-capsule" id="eagora-date-capsule">24 • 09 • 2026</div>
            <div class="eagora-date-expanded" id="eagora-date-expanded">24 de setembro</div>
            <div class="eagora-age-celebrated" id="eagora-age-celebrated">18 anos</div>
            <div class="eagora-unwritten-hint" id="eagora-unwritten-hint">Chegamos até aqui. O resto ainda não foi escrito.</div>
          </div>
        </div>

        <!-- O Desenho da Flor pelas Estrelas (SVG Botânico Ricamente Detalhado e Completo em 360°) -->
        <div class="eagora-flower-wrap" id="eagora-flower-wrap" role="button" tabindex="0" aria-label="Flor viva de encerramento — toque para interagir">
          <svg class="eagora-flower-svg" id="eagora-flower-svg" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="flowerGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <!-- Gradiente do Caule -->
              <linearGradient id="eagoraStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#33691e" />
                <stop offset="45%" stop-color="#558b2f" />
                <stop offset="85%" stop-color="#689f38" />
                <stop offset="100%" stop-color="#8bc34a" />
              </linearGradient>

              <!-- Gradiente das Folhas Botânicas -->
              <linearGradient id="eagoraLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#2e7d32" />
                <stop offset="50%" stop-color="#4caf50" />
                <stop offset="100%" stop-color="#81c784" />
              </linearGradient>

              <!-- Gradiente Pétalas de Fundo (Camada Externa 360°) -->
              <linearGradient id="eagoraPetalOuterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#ad1457" />
                <stop offset="35%" stop-color="#c2185b" />
                <stop offset="75%" stop-color="#e91e63" />
                <stop offset="100%" stop-color="#f8bbd0" />
              </linearGradient>

              <!-- Gradiente Pétalas Intermediárias (Volume e Vivacidade) -->
              <linearGradient id="eagoraPetalMidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#c2185b" />
                <stop offset="40%" stop-color="#d81b60" />
                <stop offset="80%" stop-color="#ec407a" />
                <stop offset="100%" stop-color="#fce4ec" />
              </linearGradient>

              <!-- Gradiente Pétalas Frontais / Internas -->
              <linearGradient id="eagoraPetalInnerGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#d81b60" />
                <stop offset="45%" stop-color="#f06292" />
                <stop offset="85%" stop-color="#ff80ab" />
                <stop offset="100%" stop-color="#ffffff" />
              </linearGradient>

              <!-- Gradiente do Centro & Pólen Radiante -->
              <radialGradient id="eagoraCenterGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="25%" stop-color="#fff59d" />
                <stop offset="65%" stop-color="#ffca28" />
                <stop offset="100%" stop-color="#f57c00" />
              </radialGradient>

              <!-- Aura Radiante ao redor da Flor -->
              <radialGradient id="eagoraFlowerAura" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(255, 220, 235, 0.9)" />
                <stop offset="45%" stop-color="rgba(255, 182, 205, 0.45)" />
                <stop offset="75%" stop-color="rgba(255, 230, 180, 0.2)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
              </radialGradient>
            </defs>

            <!-- Halo Radiante de Fundo que Pulsa com Vida -->
            <circle id="flower-halo" cx="200" cy="205" r="105" fill="url(#eagoraFlowerAura)" class="flower-radiance"/>

            <!-- 1. Caule Orgânico em Curva Natural -->
            <path id="flower-path-stem" class="flower-draw-line stem-line" pathLength="100"
                  d="M 200 455 C 196 385 204 310 200 208" 
                  fill="none" stroke="url(#eagoraStemGrad)" stroke-width="4.8" stroke-linecap="round"/>

            <!-- 2. Folha Esquerda & Nervuras -->
            <g id="flower-leaf1-group" class="flower-leaf-item">
              <path id="flower-path-leaf1" class="flower-draw-line leaf-line" pathLength="100"
                    d="M 198 355 C 150 360 120 325 128 290 C 160 295 188 325 198 355 Z" 
                    fill="none" stroke="#388e3c" stroke-width="2.5" stroke-linejoin="round"/>
              <path id="flower-leaf1-vein" class="flower-draw-line vein-line" pathLength="100"
                    d="M 198 355 C 165 330 142 305 128 290" 
                    fill="none" stroke="#a5d6a7" stroke-width="1.6" stroke-linecap="round"/>
              <path class="flower-draw-line vein-line" pathLength="100" d="M 180 342 Q 170 334 162 334" fill="none" stroke="#c8e6c9" stroke-width="1.2"/>
              <path class="flower-draw-line vein-line" pathLength="100" d="M 160 326 Q 152 318 144 319" fill="none" stroke="#c8e6c9" stroke-width="1.2"/>
            </g>

            <!-- 3. Folha Direita & Nervuras -->
            <g id="flower-leaf2-group" class="flower-leaf-item">
              <path id="flower-path-leaf2" class="flower-draw-line leaf-line" pathLength="100"
                    d="M 201 305 C 248 310 278 275 270 242 C 240 248 212 278 201 305 Z" 
                    fill="none" stroke="#388e3c" stroke-width="2.5" stroke-linejoin="round"/>
              <path id="flower-leaf2-vein" class="flower-draw-line vein-line" pathLength="100"
                    d="M 201 305 C 234 282 255 258 270 242" 
                    fill="none" stroke="#a5d6a7" stroke-width="1.6" stroke-linecap="round"/>
              <path class="flower-draw-line vein-line" pathLength="100" d="M 220 292 Q 228 284 236 284" fill="none" stroke="#c8e6c9" stroke-width="1.2"/>
              <path class="flower-draw-line vein-line" pathLength="100" d="M 240 276 Q 248 268 256 269" fill="none" stroke="#c8e6c9" stroke-width="1.2"/>
            </g>

            <!-- 4. Sépalas do Cálice Floral na Base -->
            <g id="flower-sepals-group">
              <path class="flower-draw-line sepal-line flower-sepal-item" id="flower-sepal-base" pathLength="100"
                    d="M 191 210 C 193 218 207 218 209 210 Z" fill="none" stroke="#33691e" stroke-width="2.5"/>
              <path id="flower-sepal-1" class="flower-draw-line sepal-line flower-sepal-item" pathLength="100" 
                    d="M 194 210 C 182 216 172 228 174 234 C 182 228 192 218 196 210 Z" 
                    fill="none" stroke="#558b2f" stroke-width="2.2"/>
              <path id="flower-sepal-2" class="flower-draw-line sepal-line flower-sepal-item" pathLength="100" 
                    d="M 206 210 C 218 216 228 228 226 234 C 218 228 208 218 204 210 Z" 
                    fill="none" stroke="#558b2f" stroke-width="2.2"/>
              <path id="flower-sepal-3" class="flower-draw-line sepal-line flower-sepal-item" pathLength="100" 
                    d="M 198 212 C 192 222 188 236 190 240 C 195 234 198 224 200 212 Z" 
                    fill="none" stroke="#558b2f" stroke-width="2"/>
              <path id="flower-sepal-4" class="flower-draw-line sepal-line flower-sepal-item" pathLength="100" 
                    d="M 202 212 C 208 222 212 236 210 240 C 205 234 202 224 200 212 Z" 
                    fill="none" stroke="#558b2f" stroke-width="2"/>
            </g>

            <!-- 5. Camada 1: Pétalas de Fundo (6 Pétalas Radiais Completas - 360° de Profundidade) -->
            <g id="flower-outer-petals-group">
              <path id="flower-outer-petal-1" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(0 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
              <path id="flower-outer-petal-2" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(60 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
              <path id="flower-outer-petal-3" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(120 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
              <path id="flower-outer-petal-4" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(180 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
              <path id="flower-outer-petal-5" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(240 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
              <path id="flower-outer-petal-6" class="flower-draw-line outer-petal-line flower-outer-petal" pathLength="100"
                    d="M 200 205 C 160 155 155 98 200 82 C 245 98 240 155 200 205 Z"
                    transform="rotate(300 200 205)" fill="none" stroke="#ad1457" stroke-width="2.8"/>
            </g>

            <!-- 6. Camada 2: Pétalas Intermediárias Intercaladas (6 Pétalas de Volume e Vivacidade) -->
            <g id="flower-mid-petals-group">
              <path id="flower-mid-petal-1" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(30 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
              <path id="flower-mid-petal-2" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(90 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
              <path id="flower-mid-petal-3" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(150 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
              <path id="flower-mid-petal-4" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(210 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
              <path id="flower-mid-petal-5" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(270 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
              <path id="flower-mid-petal-6" class="flower-draw-line mid-petal-line flower-mid-petal" pathLength="100"
                    d="M 200 205 C 166 160 162 115 200 100 C 238 115 234 160 200 205 Z"
                    transform="rotate(330 200 205)" fill="none" stroke="#c2185b" stroke-width="2.6"/>
            </g>

            <!-- 7. Camada 3: Pétalas Frontais / Coração Floral (6 Pétalas Delicadas & Aveludadas) -->
            <g id="flower-petals-group" class="flower-petals-group">
              <path id="flower-petal-1" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(15 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
              <path id="flower-petal-2" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(75 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
              <path id="flower-petal-3" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(135 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
              <path id="flower-petal-4" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(195 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
              <path id="flower-petal-5" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(255 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
              <path id="flower-petal-6" class="flower-draw-line petal-line inner-petal-line flower-inner-petal" pathLength="100"
                    d="M 200 205 C 172 170 170 134 200 122 C 230 134 228 170 200 205 Z"
                    transform="rotate(315 200 205)" fill="none" stroke="#d81b60" stroke-width="2.8"/>
            </g>

            <!-- 8. Nervuras Florais Delicadas de Luz Interna -->
            <g id="flower-veins-group">
              <path id="flower-vein-1" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(15 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
              <path id="flower-vein-2" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(75 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
              <path id="flower-vein-3" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(135 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
              <path id="flower-vein-4" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(195 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
              <path id="flower-vein-5" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(255 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
              <path id="flower-vein-6" class="flower-draw-line vein-line flower-vein-item" pathLength="100"
                    d="M 200 205 L 200 125" transform="rotate(315 200 205)" fill="none" stroke="#ffffff" stroke-width="1.5"/>
            </g>

            <!-- 9. Coroa de 12 Estames Dourados Radiantes com Pérolas de Luz -->
            <g id="flower-stamens-group">
              <g class="flower-stamen"><line x1="200" y1="205" x2="200" y2="175" stroke="#ffd54f" stroke-width="2"/><circle cx="200" cy="173" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="215" y2="179" stroke="#ffd54f" stroke-width="2"/><circle cx="216" cy="177" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="226" y2="190" stroke="#ffd54f" stroke-width="2"/><circle cx="228" cy="189" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="230" y2="205" stroke="#ffd54f" stroke-width="2"/><circle cx="232" cy="205" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="226" y2="220" stroke="#ffd54f" stroke-width="2"/><circle cx="228" cy="221" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="215" y2="231" stroke="#ffd54f" stroke-width="2"/><circle cx="216" cy="233" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="200" y2="235" stroke="#ffd54f" stroke-width="2"/><circle cx="200" cy="237" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="185" y2="231" stroke="#ffd54f" stroke-width="2"/><circle cx="184" cy="233" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="174" y2="220" stroke="#ffd54f" stroke-width="2"/><circle cx="172" cy="221" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="170" y2="205" stroke="#ffd54f" stroke-width="2"/><circle cx="168" cy="205" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="174" y2="190" stroke="#ffd54f" stroke-width="2"/><circle cx="172" cy="189" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
              <g class="flower-stamen"><line x1="200" y1="205" x2="185" y2="179" stroke="#ffd54f" stroke-width="2"/><circle cx="184" cy="177" r="3.2" fill="#fff59d" filter="url(#flowerGlow)"/></g>
            </g>

            <!-- 10. Centro Luminoso com Pulso de Vida e Coração Radiante -->
            <circle id="flower-core-glow" cx="200" cy="205" r="34" fill="none" 
                    stroke="#ffeb3b" stroke-width="2.5" opacity="0.7"/>
            <circle id="flower-core" cx="200" cy="205" r="21" fill="url(#eagoraCenterGrad)" 
                    stroke="#ffffff" stroke-width="2.8" filter="url(#flowerGlow)"/>

            <!-- Pistilos Centrais em Micro-Pérolas Douradas -->
            <g id="flower-center-pistils" class="flower-center-pistils">
              <circle cx="200" cy="199" r="2" fill="#ffe082"/>
              <circle cx="206" cy="202" r="2" fill="#ffe082"/>
              <circle cx="205" cy="209" r="2" fill="#ffe082"/>
              <circle cx="195" cy="209" r="2" fill="#ffe082"/>
              <circle cx="194" cy="202" r="2" fill="#ffe082"/>
              <circle cx="200" cy="205" r="2.5" fill="#ffffff"/>
            </g>
          </svg>
        </div>

        <!-- As Frases Contemplativas Elegantes -->
        <div class="eagora-contemplation-wrap" id="eagora-contemplation-wrap">
          <p class="eagora-phrase phrase-one" id="eagora-phrase-one">
            “Algumas coisas a gente não consegue prever.”
          </p>
          <p class="eagora-phrase phrase-two" id="eagora-phrase-two">
            “Só consegue viver.”
          </p>
        </div>

        <!-- Grande Celebração Visual: FELIZ ANIVERSÁRIO ISSAMARA -->
        <div class="eagora-celebration-title-wrap" id="eagora-celebration-title-wrap">
          <div class="eagora-word-feliz" id="eagora-word-feliz">FELIZ</div>
          <div class="eagora-word-bday" id="eagora-word-bday">ANIVERSÁRIO</div>
          <div class="eagora-word-name" id="eagora-word-name">
            <span class="name-halo-glow"></span>
            ISSAMARA
          </div>
        </div>

        <!-- Mensagem Final & Assinatura Interativa (Brincadeira Visual) -->
        <div class="eagora-farewell-wrap" id="eagora-farewell-wrap">
          <p class="eagora-farewell-p1" id="eagora-farewell-p1">
            “Que os próximos anos sejam tão bonitos quanto os que ainda estão por vir.”
          </p>
          <p class="eagora-farewell-p2" id="eagora-farewell-p2">
            Feliz 18 anos. ❤️
          </p>
          <div class="eagora-signature-box" id="eagora-signature-box">
            <span class="eagora-sig-label">Com carinho,</span>
            <span class="eagora-sig-name" id="eagora-sig-name">Luis</span>
          </div>
        </div>

        <!-- A Pequena Estrela Solitária do Fechamento -->
        <div class="eagora-lone-star" id="eagora-lone-star">✦</div>

        <!-- O Discreto "Fim." -->
        <div class="eagora-simple-end" id="eagora-simple-end">Fim.</div>

        <!-- Painel Único Aprovado de Créditos & Encerramento Suave -->
        <div class="eagora-credits-screen" id="eagora-credits-screen">
          <div class="credits-approved-card" id="credits-approved-card">
            <div class="eagora-credits-icon" style="font-size: 32px; margin-bottom: 10px;">🌸</div>
            <p class="eagora-credits-lead" style="font-size: 15.5px; line-height: 1.6; color: #3b0f2a; margin: 0 0 14px; font-weight: 500;">
              Uma pequena experiência feita com grande carinho, especialmente para Issamara.
            </p>
            <div class="eagora-credits-author" style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #7b4055; margin-bottom: 14px;">
              <strong style="color: #c2185b; font-size: 15.5px;">Criado por Luis Fernando Santos</strong>
              <span>8 de setembro</span>
            </div>
            <blockquote class="eagora-credits-dedication" style="font-family: 'Handlee', 'Quicksand', cursive; font-size: 16.5px; color: #ad1457; line-height: 1.55; margin: 0 0 14px; padding: 0 10px; font-style: italic;">
              “Dando meu melhor pra uma pessoa que merece tudo de bom que esse mundo tem.”
            </blockquote>
            <p class="eagora-credits-final-wish" id="eagora-credits-final-wish" style="font-size: 14.5px; font-weight: 600; color: #880e4f; margin: 0 0 20px; font-style: italic;">
              “Espero poder te ver novamente.”
            </p>

            <!-- Ações Conclusivas Aprovadas -->
            <div class="eagora-actions-row" style="margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;">
              <button class="eagora-btn btn-pdf" id="btn-eagora-pdf" style="width: 100%; max-width: 320px; font-weight: 700; font-size: 15px; padding: 13px 24px; background: linear-gradient(135deg, #e91e63, #c2185b); color: #fff; border: none; border-radius: 50px; box-shadow: 0 6px 20px rgba(233, 30, 99, 0.35); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                <i class="fas fa-file-pdf"></i> Baixar a Carta em PDF
              </button>
              <div style="display: flex; gap: 10px; justify-content: center; width: 100%; flex-wrap: wrap;">
                <button class="eagora-btn btn-read-letter" id="btn-eagora-read-letter" style="border: 1px solid rgba(233, 30, 99, 0.45); background: rgba(255, 255, 255, 0.95); color: #c2185b; border-radius: 50px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fas fa-envelope-open-text"></i> Ler Carta na Tela ✍️
                </button>
                <button class="eagora-btn btn-restart" id="btn-eagora-restart" style="border: 1px solid rgba(150, 150, 150, 0.3); background: rgba(255, 255, 255, 0.95); color: #666; border-radius: 50px; padding: 8px 18px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fas fa-redo"></i> Recomeçar
                </button>
              </div>
            </div>
          </div>

          <!-- NOVO ENCERRAMENTO SUAVE (Etapas 8, 9, 10) -->
          <div class="final-closing-section" id="final-closing-section">
            <p class="closing-phrase" id="closing-phrase-1">Bom, terminamos por aqui.</p>
            <p class="closing-phrase closing-p2" id="closing-phrase-2">Mas o dia continua sendo uma maravilha. 🌸</p>
          </div>
        </div>
      `;

      this.container.appendChild(this.stage);

      // Elementos do DOM
      this.curtain = this.stage.querySelector('#eagora-curtain');
      this.livingLine = this.stage.querySelector('#eagora-living-line');
      this.canvas = this.stage.querySelector('#eagora-canvas');
      this.timelineWrap = this.stage.querySelector('#eagora-timeline-wrap');
      this.trackFill = this.stage.querySelector('#eagora-track-fill');
      this.headDot = this.stage.querySelector('#eagora-head-dot');
      this.marker2008 = this.stage.querySelector('#marker-2008');
      this.marker2026 = this.stage.querySelector('#marker-2026');
      this.milestoneBox = this.stage.querySelector('#eagora-milestone-box');
      this.dateCapsule = this.stage.querySelector('#eagora-date-capsule');
      this.dateExpanded = this.stage.querySelector('#eagora-date-expanded');
      this.ageCelebrated = this.stage.querySelector('#eagora-age-celebrated');
      this.unwrittenHint = this.stage.querySelector('#eagora-unwritten-hint');
      this.flowerWrap = this.stage.querySelector('#eagora-flower-wrap');
      this.flowerSvg = this.stage.querySelector('#eagora-flower-svg');
      this.phraseOne = this.stage.querySelector('#eagora-phrase-one');
      this.phraseTwo = this.stage.querySelector('#eagora-phrase-two');
      this.celebrationTitleWrap = this.stage.querySelector('#eagora-celebration-title-wrap');
      this.wordFeliz = this.stage.querySelector('#eagora-word-feliz');
      this.wordBday = this.stage.querySelector('#eagora-word-bday');
      this.wordName = this.stage.querySelector('#eagora-word-name');
      this.farewellWrap = this.stage.querySelector('#eagora-farewell-wrap');
      this.farewellP1 = this.stage.querySelector('#eagora-farewell-p1');
      this.farewellP2 = this.stage.querySelector('#eagora-farewell-p2');
      this.sigName = this.stage.querySelector('#eagora-sig-name');
      this.loneStar = this.stage.querySelector('#eagora-lone-star');
      this.simpleEnd = this.stage.querySelector('#eagora-simple-end');
      this.creditsScreen = this.stage.querySelector('#eagora-credits-screen');
      this.creditsCard = this.stage.querySelector('#credits-approved-card');
      this.finalClosingSection = this.stage.querySelector('#final-closing-section');
      this.closingPhrase1 = this.stage.querySelector('#closing-phrase-1');
      this.closingPhrase2 = this.stage.querySelector('#closing-phrase-2');

      // Interatividade: Toque ou clique na flor viva do encerramento
      if (this.flowerWrap) {
        const handleFlowerTap = (e) => {
          e.stopPropagation();
          this.flowerWrap.classList.remove('flower-click-pulse');
          void this.flowerWrap.offsetWidth; // Reflow
          this.flowerWrap.classList.add('flower-click-pulse');

          if (this.sys && this.sys.audioManager && typeof this.sys.audioManager.playChime === 'function') {
            this.sys.audioManager.playChime();
          }

          // Spawna partículas de luz douradas e rosadas ao interagir
          if (this.particles && this.particles.length < 240) {
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            for (let k = 0; k < 28; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 1.2 + Math.random() * 3.8;
              this.particles.push({
                x: centerX + (Math.random() - 0.5) * 40,
                y: centerY + (Math.random() - 0.5) * 40,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 0.8,
                size: 2.0 + Math.random() * 3.0,
                alpha: 0.95,
                decay: 0.012 + Math.random() * 0.015,
                hue: Math.random() > 0.4 ? (330 + Math.random() * 30) : (45 + Math.random() * 25),
                glow: true
              });
            }
          }
        };

        this.flowerWrap.addEventListener('click', handleFlowerTap);
        this.flowerWrap.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlowerTap(e);
          }
        });
      }

      // Inicializa Canvas do Céu Estelar com Constelações e Partículas 3D
      this.initCanvas();

      // Configura Ações dos Botões Finais
      this.bindActions();

      // Executa a Linha do Tempo dos 31 Passos
      this.runSequence();
    }

    initCanvas() {
      if (!this.canvas) return;
      const ctx = this.canvas.getContext('2d');
      const resize = () => {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      };
      resize();
      this.resizeHandler = resize;
      window.addEventListener('resize', this.resizeHandler);

      // Gera 85 estrelas e partículas de poeira cósmica em múltiplos planos
      const count = 85;
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * (this.canvas.width || 800),
          y: Math.random() * (this.canvas.height || 600),
          size: Math.random() * 2.4 + 0.8,
          alpha: Math.random() * 0.5 + 0.2,
          speedY: -(Math.random() * 0.35 + 0.08),
          speedX: (Math.random() - 0.5) * 0.25,
          twinkleSpeed: Math.random() * 0.03 + 0.015,
          isStar: Math.random() > 0.60,
          starPoints: Math.random() > 0.5 ? 4 : 6,
          hue: Math.random() > 0.4 ? 'rose' : 'gold'
        });
      }

      // Pontos de constelação estelar conectados
      this.constellations = [
        { x: 0.5, y: 0.45 },
        { x: 0.48, y: 0.32 },
        { x: 0.55, y: 0.36 },
        { x: 0.44, y: 0.40 },
        { x: 0.52, y: 0.52 },
        { x: 0.50, y: 0.60 }
      ];

      const loop = () => {
        if (this.isDestroyed || !ctx) return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Linhas de Constelação Estelar (quando ativadas)
        if (this.showConstellations) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 182, 193, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          for (let i = 0; i < this.constellations.length - 1; i++) {
            const p1 = this.constellations[i];
            const p2 = this.constellations[i + 1];
            ctx.moveTo(p1.x * w, p1.y * h);
            ctx.lineTo(p2.x * w, p2.y * h);
          }
          ctx.stroke();
          ctx.setLineDash([]);
          // Pontos cintilantes da constelação
          this.constellations.forEach(pt => {
            ctx.fillStyle = 'rgba(255, 235, 240, 0.9)';
            ctx.beginPath();
            ctx.arc(pt.x * w, pt.y * h, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.6)';
            ctx.beginPath();
            ctx.arc(pt.x * w, pt.y * h, 7, 0, Math.PI * 2);
            ctx.stroke();
          });
          ctx.restore();
        }

        // 2. Ondas de Choque Circulares Expansivas (Shockwaves)
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
          const sw = this.shockwaves[i];
          sw.radius += sw.speed;
          sw.alpha -= sw.decay;
          if (sw.alpha <= 0) {
            this.shockwaves.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 182, 193, ${sw.alpha})`;
          ctx.lineWidth = sw.width;
          ctx.stroke();
          // Halo interno suave
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 235, 200, ${sw.alpha * 0.7})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // 3. Chuva Cósmica de Estrelas & Poeira
        this.particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;

          p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.012;
          const clampedAlpha = Math.max(0.12, Math.min(0.90, p.alpha));

          const colorRgb = p.hue === 'gold' ? '255, 215, 130' : '255, 182, 205';

          if (p.isStar) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.fillStyle = `rgba(${colorRgb}, ${clampedAlpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Brilho em cruz estrelada cintilante
            ctx.strokeStyle = `rgba(255, 255, 255, ${clampedAlpha * 0.85})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            const arm = p.size * (p.starPoints === 6 ? 3.2 : 2.6);
            ctx.moveTo(-arm, 0); ctx.lineTo(arm, 0);
            ctx.moveTo(0, -arm); ctx.lineTo(0, arm);
            ctx.stroke();
            ctx.restore();
          } else {
            ctx.fillStyle = `rgba(${colorRgb}, ${clampedAlpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 4. Pétalas Flutuantes em 3D (durante clímax e fase serena)
        if (this.fallingPetalsActive) {
          if (this.fallingPetals.length < 24 && Math.random() < 0.15) {
            this.fallingPetals.push({
              x: Math.random() * w,
              y: -20,
              size: Math.random() * 12 + 10,
              speedY: Math.random() * 1.5 + 0.8,
              speedX: Math.sin(Date.now()) * 0.6,
              rotation: Math.random() * 360,
              rotSpeed: (Math.random() - 0.5) * 2,
              osc: Math.random() * Math.PI * 2,
              color: Math.random() > 0.3 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(255, 220, 230, 0.85)'
            });
          }

          for (let i = this.fallingPetals.length - 1; i >= 0; i--) {
            const pet = this.fallingPetals[i];
            pet.y += pet.speedY;
            pet.osc += 0.03;
            pet.x += Math.sin(pet.osc) * 1.2;
            pet.rotation += pet.rotSpeed;

            if (pet.y > h + 30) {
              this.fallingPetals.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.translate(pet.x, pet.y);
            ctx.rotate((pet.rotation * Math.PI) / 180);
            ctx.fillStyle = pet.color;
            ctx.beginPath();
            // Forma orgânica de pétala de cerejeira/rosa
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(pet.size * 0.5, -pet.size * 0.8, pet.size, -pet.size * 0.3, pet.size * 0.6, pet.size * 0.6);
            ctx.bezierCurveTo(pet.size * 0.2, pet.size * 0.9, -pet.size * 0.2, pet.size * 0.7, 0, 0);
            ctx.fill();
            ctx.restore();
          }
        }

        // 5. Pólen Dourado Fluido (emanando do núcleo floral)
        if (this.pollenActive) {
          if (this.pollenGrains.length < 35 && Math.random() < 0.3) {
            this.pollenGrains.push({
              x: w * 0.5 + (Math.random() - 0.5) * 40,
              y: h * 0.44 + (Math.random() - 0.5) * 30,
              size: Math.random() * 2.5 + 1.2,
              speedY: -(Math.random() * 0.8 + 0.2),
              speedX: (Math.random() - 0.5) * 0.9,
              alpha: 0.9,
              decay: 0.008
            });
          }

          for (let i = this.pollenGrains.length - 1; i >= 0; i--) {
            const pol = this.pollenGrains[i];
            pol.y += pol.speedY;
            pol.x += pol.speedX;
            pol.alpha -= pol.decay;
            if (pol.alpha <= 0) {
              this.pollenGrains.splice(i, 1);
              continue;
            }
            ctx.save();
            ctx.fillStyle = `rgba(255, 235, 100, ${pol.alpha})`;
            ctx.beginPath();
            ctx.arc(pol.x, pol.y, pol.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        this.animFrame = requestAnimationFrame(loop);
      };
      this.animFrame = requestAnimationFrame(loop);
    }

    triggerShockwave(x, y) {
      this.shockwaves.push({
        x: x || window.innerWidth * 0.5,
        y: y || window.innerHeight * 0.44,
        radius: 10,
        speed: 12,
        width: 6,
        alpha: 0.85,
        decay: 0.016
      });
      this.shockwaves.push({
        x: x || window.innerWidth * 0.5,
        y: y || window.innerHeight * 0.44,
        radius: 5,
        speed: 8,
        width: 3,
        alpha: 0.7,
        decay: 0.014
      });
    }

    addTimeout(fn, delayMs) {
      const id = setTimeout(() => {
        if (!this.isDestroyed) fn();
      }, delayMs);
      this.timeouts.push(id);
      return id;
    }

    bindActions() {
      const btnPdf = this.stage.querySelector('#btn-eagora-pdf');
      const btnReadLetter = this.stage.querySelector('#btn-eagora-read-letter');
      const btnSave = this.stage.querySelector('#btn-eagora-save');
      const btnClose = this.stage.querySelector('#btn-eagora-close');
      const btnRestart = this.stage.querySelector('#btn-eagora-restart');
      const saveModal = this.stage.querySelector('#eagora-save-modal');
      const btnCloseSave = this.stage.querySelector('#btn-close-save-modal');

      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          this.downloadAllTextsPdf();
        });
      }

      if (btnReadLetter) {
        btnReadLetter.addEventListener('click', () => {
          if (this.sys && typeof this.sys.openPdfModal === 'function') {
            this.sys.openPdfModal();
          }
        });
      }

      if (btnSave && saveModal) {
        btnSave.addEventListener('click', () => {
          saveModal.classList.remove('d-none');
        });
      }

      if (btnCloseSave && saveModal) {
        btnCloseSave.addEventListener('click', () => {
          saveModal.classList.add('d-none');
        });
      }

      if (btnClose) {
        btnClose.addEventListener('click', () => {
          // Marca no dispositivo como concluída localmente
          localStorage.setItem('issamara_exp_concluded', 'true');
          this.showFinalConcludedState();
        });
      }

      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          localStorage.removeItem('issamara_exp_concluded');
          if (this.sys && typeof this.sys.restartExperience === 'function') {
            this.sys.restartExperience();
          } else {
            window.location.reload();
          }
        });
      }
    }

    showFinalConcludedState() {
      if (!this.stage) return;
      this.stage.innerHTML = `
        <div class="eagora-concluded-screen">
          <div class="eagora-concluded-card">
            <div class="eagora-concluded-icon">🌸✨</div>
            <h3>Essa experiência já foi concluída.</h3>
            <p>
              As memórias dos 18 anos de Issamara estão guardadas com carinho.
            </p>
            <div class="eagora-concluded-actions">
              <button class="eagora-btn btn-restart" id="btn-concluded-restart">
                <i class="fa-solid fa-rotate-left"></i> Recomeçar Experiência
              </button>
              <button class="eagora-btn btn-pdf" id="btn-concluded-pdf">
                <i class="fa-solid fa-file-pdf"></i> Baixar os Textos em PDF
              </button>
            </div>
          </div>
        </div>
      `;

      const btnRestart = this.stage.querySelector('#btn-concluded-restart');
      const btnPdf = this.stage.querySelector('#btn-concluded-pdf');
      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          localStorage.removeItem('issamara_exp_concluded');
          if (this.sys && typeof this.sys.restartExperience === 'function') {
            this.sys.restartExperience();
          } else {
            window.location.reload();
          }
        });
      }
      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          this.downloadAllTextsPdf();
        });
      }
    }

    /**
     * Passo 30: Gera o documento PDF completo, elegante e harmônico
     * Organização: 1. título; 2. capítulos; 3. frases; 4. carta de aniversário; 5. mensagem final; 6. créditos.
     */
    downloadAllTextsPdf() {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = 'padding: 30px; font-family: "Quicksand", sans-serif; color: #2d1822; background: #fffafb; max-width: 780px; margin: 0 auto;';

      pdfContainer.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #ffccd7; padding-bottom: 18px; margin-bottom: 24px;">
          <h1 style="color: #d81b60; margin: 0 0 6px; font-size: 26px;">Issamara • 18 Anos</h1>
          <div style="font-size: 14px; color: #7a4052; letter-spacing: 2px;">24 DE SETEMBRO DE 2026 • REGISTRO COMPLETO DA EXPERIÊNCIA</div>
        </div>

        <!-- 1. TÍTULO E INTRODUÇÃO -->
        <div style="margin-bottom: 22px;">
          <h3 style="color: #c2185b; font-size: 17px; margin-bottom: 6px;">1. Título & Abertura</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #444;">
            Uma jornada de celebração e memórias passando de 2008 até a chegada dos tão esperados 18 anos em 24 de setembro de 2026.
          </p>
        </div>

        <!-- 2. CAPÍTULOS DA EXPERIÊNCIA -->
        <div style="margin-bottom: 22px;">
          <h3 style="color: #c2185b; font-size: 17px; margin-bottom: 6px;">2. Capítulos da Jornada</h3>
          <ul style="font-size: 13.5px; line-height: 1.6; color: #555; padding-left: 20px;">
            <li>Prólogo: A Linha do Tempo e o Caminho até 2026</li>
            <li>Capítulos Interativos: As pequenas lembranças, os detalhes e as cores que marcaram a história</li>
            <li>O Livro Digital de Memórias (6 Seções)</li>
            <li>Capítulo Final: “E Agora?” — A celebração dos 18 anos</li>
          </ul>
        </div>

        <!-- 3. AS FRASES CONTEMPLATIVAS -->
        <div style="margin-bottom: 24px; padding: 14px 18px; background: rgba(255, 235, 240, 0.6); border-left: 4px solid #ff4071; border-radius: 8px;">
          <h3 style="color: #c2185b; font-size: 16px; margin: 0 0 8px;">3. Frases Contemplativas</h3>
          <p style="font-style: italic; margin: 0 0 6px; font-size: 15px;">“Algumas coisas a gente não consegue prever.”</p>
          <p style="font-style: italic; margin: 0; font-size: 16px; font-weight: 700; color: #d81b60;">“Só consegue viver.”</p>
        </div>

        <!-- 4. CARTA DE ANIVERSÁRIO (O TEXTO DO LIVRO NA ÍNTEGRA) -->
        <div style="margin-bottom: 26px;">
          <h3 style="color: #c2185b; font-size: 17px; margin-bottom: 12px;">4. Carta de Aniversário para Issamara</h3>
          <div style="font-size: 14px; line-height: 1.7; color: #333; white-space: pre-line; background: #ffffff; padding: 18px; border-radius: 12px; border: 1px solid #ffd6e0;">
Feliz aniversário, Issamara. 🎂

18 anos.

É estranho pensar nisso. A gente passa tanto tempo esperando certas idades chegarem que, quando elas finalmente chegam, parece só mais um dia. Mas não é. É mais um ano que passou, mais um monte de coisas que aconteceram e, principalmente, mais um ano que você está aqui.

E isso me faz pensar numa coisa meio estranha: pessoas passam pela nossa vida o tempo todo. Algumas ficam, outras vão embora, algumas a gente lembra por muito tempo e outras simplesmente desaparecem da nossa cabeça. A verdade é que ninguém sabe exatamente o que vai acontecer amanhã. A vida é meio imprevisível assim.

E talvez seja justamente por isso que algumas pessoas acabam sendo importantes.

Eu nunca fui uma pessoa que se interessa muito pelas outras. Acho as pessoas interessantes, observo, converso, conheço... mas dificilmente alguém realmente consegue chamar a minha atenção a ponto de eu querer manter aquela pessoa por perto.

Você conseguiu.

E você conseguiu meu interesse/atenção.

Não sei explicar exatamente em que momento aconteceu. Talvez tenha sido pelas nossas conversas, pelo seu jeito tranquilo, pela forma como você sempre pareceu ser uma pessoa diferente das outras. Talvez tenha sido simplesmente porque, em algum momento, eu percebi que gostava da sua companhia e que conversar com você fazia bem.

E acho que isso diz bastante.

Porque, mesmo com o tempo passando e a gente ficando mais distante, você continuou sendo uma pessoa que eu considero muito.

Hoje eu não quero ficar falando sobre tudo que mudou, nem transformar seu aniversário numa retrospectiva dramática da nossa amizade. Hoje é seu aniversário. Seu dia.

Então eu só quero te desejar coisas boas.

Que você tenha saúde, paz, felicidade e pessoas que realmente façam bem para você. Que consiga realizar aquilo que deseja, que encontre oportunidades que façam sentido para a sua vida e que tenha coragem para seguir os caminhos que escolher.

Você está começando uma fase completamente nova agora.

18 anos.

E eu espero que você aproveite muito essa fase. Que erre, aprenda, descubra coisas novas, ria bastante, conheça lugares, pessoas e tenha histórias que realmente valham a pena lembrar.

E, sinceramente, espero que a vida seja gentil com você.

Porque você merece encontrar coisas boas pelo caminho.

Talvez a gente ainda volte a conversar como antes algum dia. Talvez a vida leve cada um para um lado completamente diferente. A gente nunca sabe.

Mas, independente disso, eu fico feliz por ter te conhecido.

Você foi uma daquelas pessoas que conseguiram passar da minha curiosidade e realmente ganhar um espaço na minha consideração. E isso não acontece com qualquer pessoa.

Então, no meio de toda essa conversa estranha sobre tempo, vida e pessoas...

feliz aniversário.

Espero que seus 18 anos sejam muito bons.

Que Deus abençoe muito a sua vida, seus planos, suas escolhas e tudo aquilo que ainda está por vir.

E que, quando você olhar para esse aniversário daqui a alguns anos, consiga pensar:

“Foi um dia bom.”

Feliz 18 anos, Issamara. 🎉🎂

Com carinho,
Luis Fernando Santos
          </div>
        </div>

        <!-- 5. MENSAGEM FINAL -->
        <div style="margin-bottom: 24px; padding: 16px; background: rgba(255, 240, 245, 0.8); border-radius: 12px; text-align: center;">
          <h3 style="color: #c2185b; font-size: 16px; margin: 0 0 6px;">5. Mensagem Final</h3>
          <p style="font-size: 15px; margin: 0 0 8px; font-style: italic;">
            “Que os próximos anos sejam tão bonitos quanto os que ainda estão por vir.”
          </p>
          <div style="font-size: 17px; font-weight: 700; color: #d81b60;">Feliz 18 anos. ❤️</div>
        </div>

        <!-- 6. CRÉDITOS & DEDICATÓRIA -->
        <div style="border-top: 1.5px solid #ffccd7; padding-top: 16px; text-align: center; font-size: 13px; color: #666;">
          <p style="margin: 0 0 4px;"><strong>Uma pequena experiência feita com grande carinho, especialmente para Issamara.</strong></p>
          <p style="margin: 0 0 8px;">Criado por Luis Fernando Santos • 8 de setembro</p>
          <p style="font-style: italic; color: #d81b60; margin: 0 0 8px;">“Dando meu melhor pra uma pessoa que merece tudo de bom que esse mundo tem.”</p>
          <p style="font-size: 14px; font-weight: 600; color: #880e4f; margin: 0;">“Espero poder te ver novamente.”</p>
        </div>
      `;

      document.body.appendChild(pdfContainer);

      if (window.html2pdf) {
        const opt = {
          margin: 8,
          filename: 'Issamara_18_Anos_Textos_Completos.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().set(opt).from(pdfContainer).save().then(() => {
          if (pdfContainer.parentNode) pdfContainer.parentNode.removeChild(pdfContainer);
        }).catch(() => {
          window.print();
          if (pdfContainer.parentNode) pdfContainer.parentNode.removeChild(pdfContainer);
        });
      } else {
        window.print();
        if (pdfContainer.parentNode) pdfContainer.parentNode.removeChild(pdfContainer);
      }
    }

    /**
     * Executa com fidelidade e sincronismo os passos 1 a 28
     */
    runSequence() {
      // Ajuste suave do áudio ambiente para o prólogo contemplativo
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.28, 1400);
      }

      // ========================================================
      // 1. ENTRADA NO CAPÍTULO (Transição orgânica da tela anterior)
      // A luminosidade diminui suavemente, a linha luminosa surge e cruza a tela
      // ========================================================
      this.addTimeout(() => {
        if (this.curtain) {
          this.curtain.classList.add('curtain-fade');
        }
        if (this.livingLine) {
          this.livingLine.classList.add('line-moving');
        }
        // Som ambiente sutil de harpa
        if (this.sys && this.sys.soundEffects && this.sys.soundEffects.playChimeChord) {
          this.sys.soundEffects.playChimeChord();
        }
      }, 400);

      // ========================================================
      // 2. RETORNO DA LINHA DO TEMPO (2008 ... 2026)
      // ========================================================
      this.addTimeout(() => {
        if (this.timelineWrap) {
          this.timelineWrap.classList.add('timeline-visible');
        }
        if (this.trackFill) {
          this.trackFill.classList.add('fill-animating');
        }
        if (this.headDot) {
          this.headDot.classList.add('dot-animating');
        }
        if (this.marker2008) {
          this.marker2008.classList.add('marker-visible');
        }
      }, 1400);

      // ========================================================
      // 3. CHEGADA EM 24 DE SETEMBRO
      // Linha chega -> 2026 -> 24 de setembro -> 18 anos
      // ========================================================
      this.addTimeout(() => {
        if (this.marker2026) {
          this.marker2026.classList.add('marker-visible', 'marker-glowing');
        }
      }, 3400);

      this.addTimeout(() => {
        if (this.milestoneBox) {
          this.milestoneBox.classList.add('milestone-visible');
        }
        if (this.dateCapsule) {
          this.dateCapsule.classList.add('capsule-visible');
        }
      }, 4200);

      this.addTimeout(() => {
        if (this.dateExpanded) {
          this.dateExpanded.classList.add('expanded-visible');
        }
      }, 4900);

      this.addTimeout(() => {
        if (this.ageCelebrated) {
          this.ageCelebrated.classList.add('age-visible');
        }
      }, 5600);

      // ========================================================
      // 4. A LINHA PARA (Sem 2027/2028: "Chegamos até aqui...")
      // ========================================================
      this.addTimeout(() => {
        if (this.unwrittenHint) {
          this.unwrittenHint.classList.add('hint-visible');
        }
      }, 6400);

      // ========================================================
      // 6. A LINHA COMEÇA A DESAPARECER (Linha -> Partículas Estelares)
      // ========================================================
      this.addTimeout(() => {
        if (this.timelineWrap) {
          this.timelineWrap.classList.add('timeline-dissolving');
        }
      }, 9200);

      // ========================================================
      // 7 & 8. AS PARTÍCULAS SOBEM E TRANSFORMAM-SE EM CONSTELAÇÕES
      // ========================================================
      this.addTimeout(() => {
        if (this.timelineWrap) {
          this.timelineWrap.style.display = 'none';
        }
        this.showConstellations = true;
      }, 10400);

      // ========================================================
      // 9 & 10. O DESENHO BOTÂNICO DA FLOR PELAS ESTRELAS
      // Caule -> Folhas & Nervuras -> Sépalas -> Pétalas Externas (6) -> Médias (6) -> Frontais (6) & Nervuras -> Estames (12) -> Centro
      // ========================================================
      this.addTimeout(() => {
        this.showConstellations = false;
        if (this.flowerWrap) {
          this.flowerWrap.classList.add('flower-wrap-visible');
        }

        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.fadeTo(0.40, 2000);
        }
      }, 11400);

      // Desenho: Caule Orgânico (Passo 10.1)
      this.addTimeout(() => {
        const stem = this.stage.querySelector('#flower-path-stem');
        if (stem) stem.classList.add('line-drawn');
      }, 11800);

      // Folhas Botânicas e Nervuras de Luz (Passo 10.2)
      this.addTimeout(() => {
        const l1 = this.stage.querySelector('#flower-path-leaf1');
        const v1 = this.stage.querySelector('#flower-leaf1-vein');
        const l2 = this.stage.querySelector('#flower-path-leaf2');
        const v2 = this.stage.querySelector('#flower-leaf2-vein');
        const otherVeins = this.stage.querySelectorAll('#flower-leaf1-group .vein-line, #flower-leaf2-group .vein-line');
        if (l1) l1.classList.add('line-drawn');
        if (v1) v1.classList.add('line-drawn');
        setTimeout(() => {
          if (l2) l2.classList.add('line-drawn');
          if (v2) v2.classList.add('line-drawn');
          otherVeins.forEach(v => v.classList.add('line-drawn'));
        }, 300);
      }, 12500);

      // Cálice Floral & Sépalas (Passo 10.3)
      this.addTimeout(() => {
        const sepals = this.stage.querySelectorAll('.flower-sepal-item, #flower-sepals-group .flower-draw-line');
        sepals.forEach((s, idx) => {
          setTimeout(() => s.classList.add('line-drawn'), idx * 75);
        });
      }, 13400);

      // Camada 1: Pétalas de Fundo (6 Pétalas Radiais em 360°) (Passo 10.4)
      this.addTimeout(() => {
        const outerPetals = this.stage.querySelectorAll('.flower-outer-petal');
        outerPetals.forEach((op, idx) => {
          setTimeout(() => {
            op.classList.add('line-drawn');
          }, idx * 100);
        });
      }, 14100);

      // Camada 2: Pétalas Intermediárias Intercaladas (6 Pétalas de Volume) (Passo 10.5)
      this.addTimeout(() => {
        const midPetals = this.stage.querySelectorAll('.flower-mid-petal');
        midPetals.forEach((mp, idx) => {
          setTimeout(() => {
            mp.classList.add('line-drawn');
          }, idx * 100);
        });
      }, 14900);

      // Camada 3: Pétalas Frontais / Coração Floral e Nervuras Luminosas (Passo 10.6)
      this.addTimeout(() => {
        const innerPetals = this.stage.querySelectorAll('.flower-inner-petal');
        const veins = this.stage.querySelectorAll('.flower-vein-item');
        innerPetals.forEach((pet, idx) => {
          setTimeout(() => {
            pet.classList.add('line-drawn');
          }, idx * 95);
        });
        veins.forEach((vein, idx) => {
          setTimeout(() => {
            vein.classList.add('line-drawn');
          }, idx * 80);
        });
      }, 15700);

      // Coroa de 12 Estames Dourados Radiantes (Passo 10.7)
      this.addTimeout(() => {
        const stamens = this.stage.querySelectorAll('.flower-stamen');
        stamens.forEach((st, idx) => {
          setTimeout(() => {
            st.classList.add('stamen-drawn');
          }, idx * 45);
        });
      }, 16700);

      // ========================================================
      // 11. A FLOR GANHA VIDA (Halo se expande, centro pulsa radiante, 100% desenhada)
      // ========================================================
      this.addTimeout(() => {
        if (this.flowerWrap) {
          this.flowerWrap.classList.add('flower-alive-glowing');
        }
        // Assegura que absolutamente todas as linhas e pétalas fiquem totalmente desenhadas
        const allDrawLines = this.stage.querySelectorAll('.flower-draw-line');
        allDrawLines.forEach(el => el.classList.add('line-drawn'));
        const allStamens = this.stage.querySelectorAll('.flower-stamen');
        allStamens.forEach(st => st.classList.add('stamen-drawn'));

        this.pollenActive = true;
      }, 17600);

      // ========================================================
      // 12. PRIMEIRA FRASE: “Algumas coisas a gente não consegue prever.”
      // ========================================================
      this.addTimeout(() => {
        if (this.phraseOne) {
          this.phraseOne.classList.add('phrase-visible');
        }
      }, 19200);

      // ========================================================
      // 13. SEGUNDA FRASE: “Só consegue viver.”
      // ========================================================
      this.addTimeout(() => {
        if (this.phraseOne) {
          this.phraseOne.classList.remove('phrase-visible');
          this.phraseOne.classList.add('phrase-exit');
        }
      }, 22200);

      this.addTimeout(() => {
        if (this.phraseTwo) {
          this.phraseTwo.classList.add('phrase-visible', 'phrase-glowing');
        }
      }, 23000);

      // ========================================================
      // 14 & 15. A PRIMEIRA EXPLOSÃO VISUAL, ONDAS DE CHOQUE E PÉTALAS
      // ========================================================
      this.addTimeout(() => {
        if (this.phraseTwo) {
          this.phraseTwo.classList.remove('phrase-visible');
          this.phraseTwo.classList.add('phrase-exit');
        }

        // Música cresce gradualmente para comemoração
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.fadeTo(0.85, 2000);
        }

        // Explosão de luzes no centro da flor
        if (this.flowerWrap) {
          this.flowerWrap.classList.add('flower-bursting');
        }

        // Ondas de choque no canvas + chuva suave de pétalas
        this.triggerShockwave();
        this.fallingPetalsActive = true;
        this.fireCelebrationBursts();
      }, 25800);

      // ========================================================
      // 16. SURGIMENTO DO TEXTO PRINCIPAL:
      // FELIZ -> ANIVERSÁRIO -> ISSAMARA
      // ========================================================
      this.addTimeout(() => {
        if (this.celebrationTitleWrap) {
          this.celebrationTitleWrap.classList.add('wrap-visible');
        }
        if (this.wordFeliz) {
          this.wordFeliz.classList.add('word-visible');
        }
      }, 26600);

      this.addTimeout(() => {
        if (this.wordBday) {
          this.wordBday.classList.add('word-visible');
        }
      }, 27400);

      this.addTimeout(() => {
        if (this.wordName) {
          this.wordName.classList.add('name-grand-entrance');
        }
        // Explosão adicional com choque cósmico
        this.triggerShockwave();
        this.fireGrandSalvo();
      }, 28300);

      // ========================================================
      // 17 & 18. GRANDE CELEBRAÇÃO (Pico harmônico, profundidade e paralaxe)
      // ========================================================
      this.addTimeout(() => {
        this.fireGrandSalvo();
      }, 30800);

      // ========================================================
      // 20. A COMEMORAÇÃO DESACELERA SUAVEMENTE
      // 21. A FLOR CONTINUA SOZINHA NO CENTRO
      // ========================================================
      this.addTimeout(() => {
        if (this.celebrationTitleWrap) {
          this.celebrationTitleWrap.classList.remove('wrap-visible');
          this.celebrationTitleWrap.classList.add('wrap-fade-out');
        }
        if (this.flowerWrap) {
          this.flowerWrap.classList.remove('flower-bursting');
          this.flowerWrap.classList.add('flower-serene');
        }
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.fadeTo(0.40, 2500);
        }
      }, 33800);

      // ========================================================
      // 22. MENSAGEM FINAL
      // “Que os próximos anos sejam tão bonitos...” -> “Feliz 18 anos. ❤️”
      // ========================================================
      this.addTimeout(() => {
        if (this.farewellWrap) {
          this.farewellWrap.classList.add('farewell-visible');
        }
        if (this.farewellP1) {
          this.farewellP1.classList.add('p-visible');
        }
      }, 36200);

      this.addTimeout(() => {
        if (this.farewellP2) {
          this.farewellP2.classList.add('p-visible', 'p-heart-glow');
        }
      }, 38600);

      // ========================================================
      // 23. ASSINATURA COM A BRINCADEIRA VISUAL:
      // Luis -> Criatura -> Luis -> Criatura -> Luis
      // ========================================================
      this.addTimeout(() => {
        const box = this.stage.querySelector('#eagora-signature-box');
        if (box) box.classList.add('sig-visible');
        this.animateSignaturePlay();
      }, 40500);

      // ========================================================
      // 24. ÚLTIMA PAUSA CONTEMPLATIVA
      // 25. ENCERRAMENTO VISUAL: Flor perde luminosidade, resta 1 estrela
      // ========================================================
      this.addTimeout(() => {
        if (this.flowerWrap) {
          this.flowerWrap.classList.add('flower-fade-dim');
        }
        if (this.farewellWrap) {
          this.farewellWrap.classList.add('farewell-fade-out');
        }
      }, 47200);

      this.addTimeout(() => {
        if (this.loneStar) {
          this.loneStar.classList.add('star-visible');
        }
      }, 49500);

      this.addTimeout(() => {
        if (this.loneStar) {
          this.loneStar.classList.remove('star-visible');
          this.loneStar.classList.add('star-fade');
        }
      }, 51500);

      // ========================================================
      // 26. “Fim.”
      // ========================================================
      this.addTimeout(() => {
        if (this.simpleEnd) {
          this.simpleEnd.classList.add('end-visible');
        }
      }, 52500);

      this.addTimeout(() => {
        if (this.simpleEnd) {
          this.simpleEnd.classList.remove('end-visible');
          this.simpleEnd.classList.add('end-fade');
        }
      }, 55000);

      // ========================================================
      // 27 & 28. CRÉDITOS ÚNICOS APROVADOS & “Espero poder te ver novamente.”
      // ========================================================
      this.addTimeout(() => {
        if (this.creditsScreen) {
          this.creditsScreen.classList.add('credits-visible');
        }
      }, 56200);

      // ========================================================
      // 29 & 30. NOVO ENCERRAMENTO SUAVE
      // ========================================================
      // Frase 1: "Bom, terminamos por aqui." + Pétalas suaves caindo
      this.addTimeout(() => {
        if (this.finalClosingSection) {
          this.finalClosingSection.classList.add('closing-visible');
        }
        if (this.closingPhrase1) {
          this.closingPhrase1.classList.add('phrase-visible');
        }
        this.fallingPetalsActive = true;
        this.pollenActive = true;
      }, 60000);

      // Frase 2 (após pausa suave): "Mas o dia continua sendo uma maravilha. 🌸"
      this.addTimeout(() => {
        if (this.closingPhrase2) {
          this.closingPhrase2.classList.add('phrase-visible');
        }
      }, 63200);
    }

    triggerCreditsNow() {
      if (this.creditsScreen) {
        this.creditsScreen.classList.add('credits-visible');
      }
      if (this.finalClosingSection) {
        this.finalClosingSection.classList.add('closing-visible');
      }
      if (this.closingPhrase1) {
        this.closingPhrase1.classList.add('phrase-visible');
      }
      if (this.closingPhrase2) {
        this.closingPhrase2.classList.add('phrase-visible');
      }
      this.fallingPetalsActive = true;
      this.pollenActive = true;
    }

    /**
     * Passo 23: Brincadeira visual tipográfica suave e afetuosa
     * Luis -> Criatura -> Luis -> Criatura -> Luis
     */
    animateSignaturePlay() {
      if (!this.sigName) return;

      const sequence = [
        { text: 'Luis', delay: 1000 },
        { text: 'Criatura', delay: 1800 },
        { text: 'Luis', delay: 2600 },
        { text: 'Criatura', delay: 3400 },
        { text: 'Luis', delay: 4200 }
      ];

      sequence.forEach((step) => {
        this.addTimeout(() => {
          if (!this.sigName) return;
          this.sigName.classList.add('sig-transitioning');
          setTimeout(() => {
            if (this.sigName) {
              this.sigName.textContent = step.text;
              this.sigName.classList.remove('sig-transitioning');
            }
          }, 240);
        }, step.delay);
      });
    }

    fireCelebrationBursts() {
      if (!window.confetti) return;
      window.confetti({
        particleCount: 40,
        spread: 65,
        origin: { x: 0.5, y: 0.44 },
        colors: ['#ff758c', '#ffccd7', '#ffeb3b', '#ffffff', '#a8e6cf']
      });
    }

    fireGrandSalvo() {
      if (!window.confetti) return;
      window.confetti({
        particleCount: 50,
        angle: 60,
        spread: 75,
        origin: { x: 0.1, y: 0.55 },
        colors: ['#ff758c', '#ffccd7', '#ffb6c1', '#ffd166', '#ffffff']
      });
      window.confetti({
        particleCount: 50,
        angle: 120,
        spread: 75,
        origin: { x: 0.9, y: 0.55 },
        colors: ['#ff758c', '#ffccd7', '#ffb6c1', '#ffd166', '#ffffff']
      });
    }

    destroy() {
      this.isDestroyed = true;
      document.body.classList.remove('eagora-fullscreen-active');

      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }

      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
        this.animFrame = null;
      }
      this.timeouts.forEach(t => clearTimeout(t));
      this.timeouts = [];
      if (this.stage && this.stage.parentNode) {
        this.stage.parentNode.removeChild(this.stage);
      }
    }
  }

  // Compatibilidade com referências existentes
  window.EAgoraFinaleController = EAgoraFinaleController;
  const DefinitiveFinaleController = EAgoraFinaleController;

    // ==========================================================================
  // 4.5. CINEMATIC ENTRY CONTROLLER (Prólogo Cinematográfico: 2008 a 2026)
  // ==========================================================================
  class CinematicEntryController {
    constructor(experienceSystem) {
      this.sys = experienceSystem;

      // Elementos do DOM - Contêineres Principais
      this.entryEl = document.getElementById('cinematic-entry');
      this.cameraEl = document.getElementById('cinematic-camera');
      this.bgEl = document.getElementById('cinematic-bg');
      this.canvasEl = document.getElementById('cinematic-canvas');
      this.startPromptBtn = document.getElementById('cinematic-start-prompt');
      this.fallingPetal = document.getElementById('cinematic-falling-petal');

      // Elementos do Palco Botânico (SVG)
      this.plantStage = document.getElementById('cinematic-plant-stage');
      this.botanicalSvg = document.getElementById('botanical-svg');
      this.seedGroup = document.getElementById('plant-seed-group');
      this.rootsGroup = document.getElementById('plant-roots');
      this.stem = document.getElementById('plant-stem');
      this.budGroup = document.getElementById('plant-bud-group');
      this.flowerGroup = document.getElementById('plant-flower-group');
      this.leaves = {
        2009: document.getElementById('leaf-2009'),
        2010: document.getElementById('leaf-2010'),
        2011: document.getElementById('leaf-2011'),
        2012: document.getElementById('leaf-2012'),
        2013: document.getElementById('leaf-2013'),
        2014: document.getElementById('leaf-2014'),
        2015: document.getElementById('leaf-2015'),
        2016: document.getElementById('leaf-2016')
      };

      // Elementos da Crônica Temporal
      this.chronoDateCard = document.getElementById('chrono-date-card');
      this.chronoDay = document.getElementById('chrono-day');
      this.chronoMonth = document.getElementById('chrono-month');
      this.chronoYear = document.getElementById('chrono-year');
      this.chronoAgeBadge = document.getElementById('chrono-age-badge');
      this.chronoFlowBadge = document.getElementById('chrono-flow-badge');
      this.chronoDetailBadge = document.getElementById('chrono-detail-badge');

      // Elementos do Clímax e Revelação Dividida em Etapas (Flor Protagonista)
      this.skyLeadWrap = document.getElementById('chrono-sky-lead-wrap');
      this.skyLeadText = document.getElementById('chrono-sky-lead-text');
      this.revelationBelow = document.getElementById('chrono-revelation-below');
      this.milestone18Num = document.getElementById('milestone-18-num');
      this.milestone18Label = document.getElementById('milestone-18-label');
      this.heroNameWrap = document.getElementById('chrono-hero-name');
      this.heroDateWrap = document.getElementById('chrono-hero-date-wrap');
      this.heroSubWrap = document.getElementById('chrono-hero-sub-wrap');

      // Estado e Motor de Timeline
      this.isCompleted = false;
      this.isTransitioning = false;
      this.currentState = 'INIT';
      this.startTime = 0;
      this.animationFrameId = null;
      this.activeTimers = [];
      this.executedEventIndices = new Set();

      // Canvas e Partículas Orgânicas (60 FPS)
      this.canvasCtx = null;
      this.canvasParticles = [];
      this.canvasWidth = 0;
      this.canvasHeight = 0;

      // Definição da Linha do Tempo Cinematográfica Sincronizada (2008 a 2026)
      this.timelineEvents = [
        // CENA 1 — O COMEÇO (Nascimento em 24 de Setembro de 2008)
        { time: 0, state: 'SCENE_1_START', action: () => this.scene1Start() },
        { time: 1500, state: 'SCENE_1_SEED', action: () => this.scene1Seed() },
        { time: 3200, state: 'SCENE_1_DAY', action: () => this.scene1Day() },
        { time: 4600, state: 'SCENE_1_MONTH', action: () => this.scene1Month() },
        { time: 6000, state: 'SCENE_1_YEAR', action: () => this.scene1Year() },
        { time: 7400, state: 'SCENE_1_ROOTS', action: () => this.scene1Roots() },
        { time: 8600, state: 'SCENE_1_SPROUT', action: () => this.scene1Sprout() },

        // CENA 2 — O PRIMEIRO ANO (Meses de 2008 até a virada de 2009)
        { time: 9800, state: 'SCENE_2_OCT', action: () => this.scene2Month('outubro de 2008', 328) },
        { time: 11000, state: 'SCENE_2_NOV', action: () => this.scene2Month('novembro de 2008', 316) },
        { time: 12200, state: 'SCENE_2_DEC', action: () => this.scene2Month('dezembro de 2008', 304) },

        // CENA 3 — 2009: O ANO VIRA COM PRESENÇA, 1 ANO, PRIMEIRA FOLHA
        { time: 13600, state: 'SCENE_3_2009', action: () => this.scene3Year2009() },

        // CENA 4 — A INFÂNCIA E O CRESCIMENTO (2010 A 2016, 2 A 8 ANOS)
        { time: 15400, state: 'SCENE_4_2010', action: () => this.scene4Year(2010, 2, 256, 2010) },
        { time: 17200, state: 'SCENE_4_2011', action: () => this.scene4Year(2011, 3, 224, 2011) },
        { time: 19000, state: 'SCENE_4_2012', action: () => this.scene4Year(2012, 4, 192, 2012) },
        { time: 20800, state: 'SCENE_4_2013', action: () => this.scene4Year(2013, 5, 156, 2013) },
        { time: 22600, state: 'SCENE_4_2014', action: () => this.scene4Year(2014, 6, 120, 2014) },
        { time: 24400, state: 'SCENE_4_2015', action: () => this.scene4Year(2015, 7, 80, 2015) },
        { time: 26200, state: 'SCENE_4_2016', action: () => this.scene4Year(2016, 8, 40, 2016) },

        // CENA 5 — A TRANSFORMAÇÃO (2017 A 2023): O BOTÃO DE FLOR
        { time: 28200, state: 'SCENE_5_2017', action: () => this.scene5BudForms() },
        { time: 30000, state: 'SCENE_5_2018', action: () => this.scene5Year(2018, 10) },
        { time: 31400, state: 'SCENE_5_2023', action: () => this.scene5BudSwells() },

        // CENA 6 — APROXIMAÇÃO (2024 E 2025): DESACELERAÇÃO E ABERTURA SUAVE
        { time: 33200, state: 'SCENE_6_2024', action: () => this.scene6Year2024() },
        { time: 35200, state: 'SCENE_7_2025', action: () => this.scene7Year2025() },

        // CENA 7 — O DESABROCHAR COMPLETO (2026: 18 ANOS)
        { time: 37400, state: 'SCENE_8_2026_START', action: () => this.scene8Start2026() },
        // Passagem compassada dos meses de 2026
        { time: 38000, state: 'SCENE_8_M_JAN', action: () => this.scene8MonthTick('JANEIRO') },
        { time: 38400, state: 'SCENE_8_M_FEB', action: () => this.scene8MonthTick('FEVEREIRO') },
        { time: 38800, state: 'SCENE_8_M_MAR', action: () => this.scene8MonthTick('MARÇO') },
        { time: 39200, state: 'SCENE_8_M_APR', action: () => this.scene8MonthTick('ABRIL') },
        { time: 39600, state: 'SCENE_8_M_MAY', action: () => this.scene8MonthTick('MAIO') },
        { time: 40000, state: 'SCENE_8_M_JUN', action: () => this.scene8MonthTick('JUNHO') },
        { time: 40400, state: 'SCENE_8_M_JUL', action: () => this.scene8MonthTick('JULHO') },
        { time: 40800, state: 'SCENE_8_M_AUG', action: () => this.scene8MonthTick('AGOSTO') },
        { time: 41300, state: 'SCENE_8_M_SEP', action: () => this.scene8MonthTick('SETEMBRO') },
        // Avanço dos dias até 24 de Setembro
        { time: 41900, state: 'SCENE_8_D_01', action: () => this.scene8DayTick('01') },
        { time: 42200, state: 'SCENE_8_D_05', action: () => this.scene8DayTick('05') },
        { time: 42500, state: 'SCENE_8_D_10', action: () => this.scene8DayTick('10') },
        { time: 42800, state: 'SCENE_8_D_15', action: () => this.scene8DayTick('15') },
        { time: 43100, state: 'SCENE_8_D_20', action: () => this.scene8DayTick('20') },
        { time: 43400, state: 'SCENE_8_D_21', action: () => this.scene8DayTick('21') },
        { time: 43700, state: 'SCENE_8_D_22', action: () => this.scene8DayTick('22') },
        { time: 44000, state: 'SCENE_8_D_23', action: () => this.scene8DayTick('23') },

        // 🌸 ETAPA ①: 44400ms — A flor termina de abrir em 24/09/2026 e FICA SOZINHA no gramado por 1.8s
        // Sem textos, sem interferências, a flor respira em seu cenário amplo
        { time: 44400, state: 'SCENE_FLOWER_ALONE', action: () => this.sceneFlowerAlone() },

        // ✨ ETAPA ②: 46200ms (1.8s depois) — Frase no céu (acima da flor)
        // "E depois de todos esses anos..." surge com suavidade
        { time: 46200, state: 'SCENE_SKY_LEAD_IN', action: () => this.sceneSkyLeadIn() },
        // Permanece por 1.5s e depois desaparece suavemente criando expectativa
        { time: 47700, state: 'SCENE_SKY_LEAD_OUT', action: () => this.sceneSkyLeadOut() },

        // 🌸 ETAPA ③: 48400ms — Câmera se eleva suavemente; entra "18" e "ANOS" abaixo da flor
        { time: 48400, state: 'SCENE_18_NUM', action: () => this.scene18Num() },
        { time: 48800, state: 'SCENE_18_ANOS', action: () => this.scene18Anos() },

        // 🌸 ETAPA ④: 50800ms (2.0s depois) — "ISSAMARA" surge abaixo de 18 ANOS
        { time: 50800, state: 'SCENE_NAME_ISSAMARA', action: () => this.sceneNameIssamara() },

        // 🌸 ETAPA ⑤: 51900ms (1.1s depois) — Data "24 DE SETEMBRO DE 2026"
        { time: 51900, state: 'SCENE_DATE_BELOW', action: () => this.sceneDateBelow() },

        // 🌸 ETAPA ⑥: 53000ms (1.1s depois) — Frase final poética "18 anos de uma história."
        { time: 53000, state: 'SCENE_SUB_STORY', action: () => this.sceneSubStory() },

        // 🌸 ETAPA ⑦: 55200ms (2.2s de contemplação tranquila) — Câmera começa a se afastar um pouco mais
        { time: 55200, state: 'SCENE_CAMERA_RETREAT', action: () => this.sceneCameraRetreat() },

        // 🌸 ETAPAS ⑧ & ⑨ & ⑩: 56500ms — Pétala se solta da flor, passa em frente à câmera e abre o livro
        { time: 56500, state: 'SCENE_TRANSITION_BOOK', action: () => this.transitionToBook(false) }
      ];

      this.init();
    }

    init() {
      if (!this.entryEl) return;

      // Respeito à preferência de movimento reduzido
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        this.finishCinematicSequence(true);
        return;
      }

      // 1. Inicializa o sistema de partículas ambientais do canvas
      this.initCanvasParticleSystem();

      // 2. Prepara o palco em estado inicial (solo limpo e semente pronta)
      this.resetPlantToInitialState();

      // 3. Vincula eventos de controles (áudio, pular e interação por toque)
      this.bindControls();

      // 4. Inicia a animação cinematográfica IMEDIATAMENTE e SUAVEMENTE ao entrar no site!
      this.startSequence();
    }

    resetPlantToInitialState() {
      // Caule recolhido no solo
      if (this.stem) {
        this.stem.style.strokeDashoffset = '360';
      }
      // Folhas recolhidas
      if (this.leaves) {
        Object.values(this.leaves).forEach(leaf => {
          if (leaf) {
            leaf.classList.remove('leaf-visible');
            leaf.style.opacity = '0';
            leaf.style.transform = 'scale(0)';
          }
        });
      }
      // Botão fechado oculto
      if (this.budGroup) {
        this.budGroup.classList.remove('bud-visible', 'bud-swelling');
        this.budGroup.style.opacity = '0';
        this.budGroup.style.transform = 'scale(0)';
      }
      // Flor desabrochada oculta
      if (this.flowerGroup) {
        this.flowerGroup.classList.remove('flower-visible', 'flower-opening', 'flower-full-bloom', 'flower-celebrating');
        this.flowerGroup.style.opacity = '0';
        this.flowerGroup.style.transform = 'scale(0.2)';
      }
      // Raízes ocultas
      if (this.rootsGroup) {
        this.rootsGroup.classList.remove('roots-visible');
        const strands = this.rootsGroup.querySelectorAll('.root-strand');
        strands.forEach(s => { s.style.strokeDashoffset = '80'; });
      }
      // Semente no centro pronta
      if (this.seedGroup) {
        this.seedGroup.classList.remove('seed-visible', 'seed-sprouted');
        this.seedGroup.style.opacity = '0';
        this.seedGroup.style.transform = 'scale(0.2)';
      }
      // Reset dos textos e badges da cronologia
      if (this.chronoDay) this.chronoDay.classList.remove('day-visible');
      if (this.chronoMonth) this.chronoMonth.classList.remove('month-visible');
      if (this.chronoYear) this.chronoYear.classList.remove('year-visible', 'year-tick-bump');
      if (this.chronoAgeBadge) this.chronoAgeBadge.classList.remove('age-visible');
      if (this.chronoFlowBadge) this.chronoFlowBadge.classList.remove('flow-visible');
      if (this.chronoDetailBadge) this.chronoDetailBadge.classList.remove('detail-visible');
      if (this.chronoDateCard) this.chronoDateCard.classList.remove('card-faded');
      if (this.cameraEl) this.cameraEl.classList.remove('camera-elevate', 'camera-retreat');
      if (this.skyLeadText) this.skyLeadText.classList.remove('lead-visible', 'lead-fade-out');
      if (this.revelationBelow) this.revelationBelow.classList.remove('revelation-visible');
      if (this.milestone18Num) this.milestone18Num.classList.remove('visible');
      if (this.milestone18Label) this.milestone18Label.classList.remove('visible');
      if (this.heroNameWrap) this.heroNameWrap.classList.remove('name-visible');
      if (this.heroDateWrap) this.heroDateWrap.classList.remove('date-visible');
      if (this.heroSubWrap) this.heroSubWrap.classList.remove('sub-visible');
      if (this.startPromptBtn) this.startPromptBtn.classList.remove('prompt-visible');
    }

    bindControls() {
      // Botão "Toque para começar a jornada" (após a revelação final de 18 anos)
      if (this.startPromptBtn) {
        this.startPromptBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.transitionToBook(false);
        });
      }

      // =========================================================================
      // Efeito de Brilho Pulsante (Glow) e Aumento de Intensidade ao Manter Clique
      // =========================================================================
      let isHolding = false;
      let holdStartTime = 0;
      let holdRafId = null;
      let lastParticleTime = 0;
      let maxChargeTriggered = false;
      let holdCompleted = false;

      const startPlantHold = (e) => {
        // Ignora botão direito ou toques múltiplos secundários
        if (e.button && e.button !== 0) return;
        if (isHolding) return;

        isHolding = true;
        holdCompleted = false;
        holdStartTime = performance.now();
        lastParticleTime = holdStartTime;
        maxChargeTriggered = false;

        if (this.plantStage) {
          this.plantStage.classList.add('plant-holding');
        }
        if (this.botanicalSvg) {
          this.botanicalSvg.classList.add('plant-holding');
        }

        // Toca tom introdutório sutil se o áudio ainda não foi desbloqueado
        if (this.sys && this.sys.audioManager && !this.sys.audioManager.isPlaying) {
          this.sys.audioManager.startExperienceAudio();
        }

        const updateHoldGlow = () => {
          if (!isHolding) return;

          const now = performance.now();
          const elapsed = now - holdStartTime;
          // Progressão de intensidade suave que atinge o ápice em ~1.3s
          const rawProgress = Math.min(1, elapsed / 1300);
          const intensity = Math.pow(rawProgress, 0.85);

          if (this.plantStage) {
            this.plantStage.style.setProperty('--plant-glow-scale', (1.0 + intensity * 0.38).toFixed(3));
            this.plantStage.style.setProperty('--plant-glow-blur-add', `${(intensity * 24).toFixed(1)}px`);
            this.plantStage.style.setProperty('--plant-glow-opacity', (0.68 + intensity * 0.32).toFixed(3));
          }

          // Atingiu carga máxima durante o clique mantido
          if (rawProgress >= 1.0 && !maxChargeTriggered) {
            maxChargeTriggered = true;
            if (this.sys && this.sys.soundEffects && typeof this.sys.soundEffects.playChimeChord === 'function') {
              this.sys.soundEffects.playChimeChord();
            }
          }

          // Emissão suave de microfagulhas de luz enquanto mantido
          if (elapsed > 250 && (now - lastParticleTime) > 130) {
            lastParticleTime = now;
            if (window.confetti && this.botanicalSvg) {
              try {
                const rect = this.botanicalSvg.getBoundingClientRect();
                const originX = ((rect.left + rect.width / 2) / window.innerWidth) || 0.5;
                const originY = ((rect.top + rect.height * 0.42) / window.innerHeight) || 0.5;
                window.confetti({
                  particleCount: 2,
                  spread: 42,
                  startVelocity: 6 + intensity * 7,
                  origin: { x: originX, y: originY },
                  colors: ['#ffffff', '#ffd54f', '#ff80ab', '#ff4081'],
                  ticks: 45,
                  gravity: 0.5,
                  scalar: 0.6 + intensity * 0.3
                });
              } catch (err) {}
            }
          }

          holdRafId = requestAnimationFrame(updateHoldGlow);
        };

        holdRafId = requestAnimationFrame(updateHoldGlow);
      };

      const endPlantHold = (e) => {
        if (!isHolding) return;
        isHolding = false;

        if (holdRafId) {
          cancelAnimationFrame(holdRafId);
          holdRafId = null;
        }

        const elapsed = performance.now() - holdStartTime;

        if (this.plantStage) {
          this.plantStage.classList.remove('plant-holding');
          this.plantStage.style.removeProperty('--plant-glow-scale');
          this.plantStage.style.removeProperty('--plant-glow-blur-add');
          this.plantStage.style.removeProperty('--plant-glow-opacity');
        }
        if (this.botanicalSvg) {
          this.botanicalSvg.classList.remove('plant-holding');
        }

        // Se o usuário manteve o clique pressionado por mais de 300ms, consideramos uma liberação de carga
        if (elapsed >= 300) {
          holdCompleted = true;
          setTimeout(() => { holdCompleted = false; }, 250);

          if (this.sys && this.sys.soundEffects && typeof this.sys.soundEffects.playChimeChord === 'function') {
            this.sys.soundEffects.playChimeChord();
          }

          if (window.confetti && this.botanicalSvg) {
            try {
              const rect = this.botanicalSvg.getBoundingClientRect();
              const originX = ((rect.left + rect.width / 2) / window.innerWidth) || 0.5;
              const originY = ((rect.top + rect.height * 0.42) / window.innerHeight) || 0.5;
              const burstCount = Math.min(32, Math.floor(14 + (elapsed / 80)));
              window.confetti({
                particleCount: burstCount,
                spread: 75,
                startVelocity: 16,
                origin: { x: originX, y: originY },
                colors: ['#ff80ab', '#ffb6c1', '#ffd54f', '#ffffff', '#a5d6a7'],
                ticks: 80,
                gravity: 0.6,
                scalar: 0.85
              });
            } catch (err) {}
          }
        }
      };

      // Ouvinte no SVG botânico (#botanical-svg) para crescer ou ampliar ao clicar ou ao manter pressionado
      if (this.botanicalSvg) {
        this.botanicalSvg._hasPlantClickListener = true;
        this.botanicalSvg.addEventListener('pointerdown', startPlantHold);
        window.addEventListener('pointerup', endPlantHold);
        window.addEventListener('pointercancel', endPlantHold);

        // Fallbacks para desktop e mobile
        this.botanicalSvg.addEventListener('mousedown', startPlantHold);
        window.addEventListener('mouseup', endPlantHold);
        this.botanicalSvg.addEventListener('touchstart', startPlantHold, { passive: true });
        window.addEventListener('touchend', endPlantHold, { passive: true });
        window.addEventListener('touchcancel', endPlantHold, { passive: true });

        this.botanicalSvg.addEventListener('click', (e) => {
          e.stopPropagation();
          if (holdCompleted) return;
          this.pulseBotanicalPlant();
        });
        this.botanicalSvg.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this.pulseBotanicalPlant();
          }
        });
      }

      // Toque em qualquer ponto da tela
      if (this.entryEl) {
        this.entryEl.addEventListener('click', (e) => {
          if (e.target.closest('#botanical-svg')) return;

          // Se áudio estiver bloqueado pelo navegador até o primeiro gesto, desbloqueia suavemente
          if (this.sys && this.sys.audioManager && !this.sys.audioManager.isPlaying) {
            this.sys.audioManager.startExperienceAudio();
          }

          // Se a flor já desabrochou e revelou os textos, permite avançar para o livro por toque
          if (this.currentState.startsWith('SCENE_18_') ||
              this.currentState === 'SCENE_NAME_ISSAMARA' ||
              this.currentState === 'SCENE_DATE_BELOW' ||
              this.currentState === 'SCENE_SUB_STORY' ||
              this.currentState === 'SCENE_CAMERA_RETREAT' ||
              this.currentState === 'SCENE_TRANSITION_BOOK') {
            this.transitionToBook(false);
          }
        });
      }

      window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
      window.addEventListener('orientationchange', () => this.resizeCanvas(), { passive: true });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
      }
    }

    /**
     * Faz a planta botânica crescer ou ampliar temporariamente com animação orgânica e reflexos luminosos
     */
    pulseBotanicalPlant() {
      if (!this.botanicalSvg) return;

      // Reinicia a animação para permitir toques consecutivos
      this.botanicalSvg.classList.remove('plant-grow-active');
      void this.botanicalSvg.offsetWidth;
      this.botanicalSvg.classList.add('plant-grow-active');

      // Toca efeito sonoro suave se disponível
      if (this.sys && this.sys.soundEffects && typeof this.sys.soundEffects.playChimeChord === 'function') {
        this.sys.soundEffects.playChimeChord();
      }

      // Dispara confetes delicados e pétalas leves a partir do coração da flor
      if (window.confetti) {
        try {
          const rect = this.botanicalSvg.getBoundingClientRect();
          const originX = ((rect.left + rect.width / 2) / window.innerWidth) || 0.5;
          const originY = ((rect.top + rect.height * 0.42) / window.innerHeight) || 0.5;
          window.confetti({
            particleCount: 16,
            spread: 60,
            startVelocity: 14,
            origin: { x: originX, y: originY },
            colors: ['#ff80ab', '#ffb6c1', '#ffd54f', '#ffffff', '#a5d6a7'],
            ticks: 70,
            gravity: 0.65,
            scalar: 0.8
          });
        } catch (err) {}
      }

      if (this.plantGrowTimer) {
        clearTimeout(this.plantGrowTimer);
      }
      this.plantGrowTimer = setTimeout(() => {
        if (this.botanicalSvg) {
          this.botanicalSvg.classList.remove('plant-grow-active');
        }
        this.plantGrowTimer = null;
      }, 1200);
    }

    updateAudioBtnUI() {
      // Sem controles de áudio na tela na experiência cinematográfica
    }

    initCanvasParticleSystem() {
      if (!this.canvasEl) return;
      this.canvasCtx = this.canvasEl.getContext('2d');
      this.resizeCanvas();

      const particleCount = window.innerWidth <= 768 ? 22 : 40;
      this.canvasParticles = [];
      for (let i = 0; i < particleCount; i++) {
        this.canvasParticles.push({
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight,
          radius: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.45 + 0.15,
          speedX: (Math.random() - 0.5) * 0.28,
          speedY: -Math.random() * 0.42 - 0.1,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: (Math.random() - 0.5) * 0.012,
          color: Math.random() > 0.4 ? '248, 187, 208' : '233, 30, 99'
        });
      }
    }

    resizeCanvas() {
      if (!this.canvasEl) return;
      const rect = this.cameraEl ? this.cameraEl.getBoundingClientRect() : null;
      this.canvasWidth = rect && rect.width > 0 ? Math.round(rect.width) : (window.innerWidth || document.documentElement.clientWidth);
      this.canvasHeight = rect && rect.height > 0 ? Math.round(rect.height) : (window.innerHeight || document.documentElement.clientHeight);
      this.canvasEl.width = this.canvasWidth;
      this.canvasEl.height = this.canvasHeight;
    }

    renderCanvasParticles(state, elapsedMs) {
      if (!this.canvasCtx || this.isCompleted) return;
      const ctx = this.canvasCtx;
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      const centerX = this.canvasWidth / 2;
      const centerY = this.canvasHeight / 2;
      const isBloom = state.startsWith('SCENE_8_') || state.startsWith('SCENE_18_') || state.startsWith('SCENE_FLOWER_') || state.startsWith('SCENE_SKY_') || state.startsWith('SCENE_NAME_') || state.startsWith('SCENE_DATE_') || state.startsWith('SCENE_SUB_') || state.startsWith('SCENE_CAMERA_') || state === 'PROMPT_READY';
      const burst = isBloom ? 0.65 : 0;

      for (let i = 0; i < this.canvasParticles.length; i++) {
        const p = this.canvasParticles[i];

        if (burst > 0) {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.x += (dx / dist) * (burst * (p.radius + 0.6));
          p.y += (dy / dist) * (burst * (p.radius + 0.6)) - 0.2;
        } else {
          p.x += p.speedX;
          p.y += p.speedY;
          p.angle += p.angularSpeed;
          p.x += Math.cos(p.angle) * 0.22;
        }

        if (p.x < -15) p.x = this.canvasWidth + 15;
        if (p.x > this.canvasWidth + 15) p.x = -15;
        if (p.y < -15) p.y = this.canvasHeight + 15;
        if (p.y > this.canvasHeight + 15) p.y = -15;

        const pulse = Math.sin((elapsedMs * 0.0018) + i) * 0.2;
        const currentAlpha = Math.max(0.06, Math.min(0.85, p.alpha + pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
    }

    startSequence() {
      if (this.isCompleted) return;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.executedEventIndices.clear();
      this.startTime = performance.now();

      // Inicia música de abertura imediatamente com monokrom.mp3
      if (this.sys && this.sys.audioManager) {
        try {
          this.sys.audioManager.startExperienceAudio();
          this.updateAudioBtnUI();
        } catch (e) {}
      }

      // Loop de execução sincronizada da linha do tempo
      const tick = (now) => {
        if (this.isCompleted) return;
        const elapsed = now - this.startTime;

        for (let i = 0; i < this.timelineEvents.length; i++) {
          const ev = this.timelineEvents[i];
          if (elapsed >= ev.time && !this.executedEventIndices.has(i)) {
            this.executedEventIndices.add(i);
            this.currentState = ev.state;
            ev.action();
          }
        }

        this.updateContinuousCamera(elapsed);
        this.renderCanvasParticles(this.currentState, elapsed);
        this.animationFrameId = requestAnimationFrame(tick);
      };

      this.animationFrameId = requestAnimationFrame(tick);
    }

    updateContinuousCamera(elapsed) {
      if (!this.cameraEl) return;
      const driftRot = Math.sin(elapsed * 0.0003) * 0.2;
      const driftY = Math.cos(elapsed * 0.00035) * 2.5;

      let baseScale = 1.0;
      if (this.currentState.startsWith('SCENE_4_')) baseScale = 1.02;
      else if (this.currentState.startsWith('SCENE_5_')) baseScale = 1.04;
      else if (this.currentState === 'SCENE_6_2024') baseScale = 1.05;
      else if (this.currentState === 'SCENE_7_2025') baseScale = 1.06;
      else if (this.currentState.startsWith('SCENE_8_')) baseScale = 1.05;

      this.entryEl.style.setProperty('--camera-scale', baseScale.toString());
      this.entryEl.style.setProperty('--camera-rot', `${driftRot.toFixed(2)}deg`);
      this.entryEl.style.setProperty('--camera-y', `${driftY.toFixed(1)}px`);
    }

    setDomState(stateClass) {
      if (!this.entryEl) return;
      const currentClasses = Array.from(this.entryEl.classList).filter(c => c.startsWith('state-'));
      currentClasses.forEach(c => this.entryEl.classList.remove(c));
      this.entryEl.classList.add(stateClass);
    }

    // ------------------------------------------------------------------------
    // CENA 1: O COMEÇO (NASCIMENTO EM 24 DE SETEMBRO DE 2008)
    // ------------------------------------------------------------------------
    scene1Start() {
      this.setDomState('state-scene-1-start');
    }

    scene1Seed() {
      this.setDomState('state-scene-1-seed');
      if (this.seedGroup) {
        this.seedGroup.style.opacity = '1';
        this.seedGroup.classList.add('seed-visible');
      }
    }

    scene1Day() {
      this.setDomState('state-scene-1-day');
      if (this.chronoDay) {
        this.chronoDay.textContent = '24';
        this.chronoDay.classList.add('day-visible');
      }
    }

    scene1Month() {
      this.setDomState('state-scene-1-month');
      if (this.chronoMonth) {
        this.chronoMonth.textContent = 'SETEMBRO';
        this.chronoMonth.classList.add('month-visible');
      }
    }

    scene1Year() {
      this.setDomState('state-scene-1-year');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2008';
        this.chronoYear.classList.add('year-visible', 'year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '0 anos';
        this.chronoAgeBadge.classList.add('age-visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.5);
        this.sys.audioManager.fadeTo(0.28, 2000);
      }
    }

    scene1Roots() {
      this.setDomState('state-scene-1-roots');
      if (this.rootsGroup) {
        this.rootsGroup.classList.add('roots-visible');
        const strands = this.rootsGroup.querySelectorAll('.root-strand');
        strands.forEach(s => { s.style.strokeDashoffset = '0'; });
      }
      if (this.seedGroup) {
        this.seedGroup.classList.add('seed-sprouted');
      }
    }

    scene1Sprout() {
      this.setDomState('state-scene-1-sprout');
      if (this.stem) {
        this.stem.style.strokeDashoffset = '340';
      }
    }

    // ------------------------------------------------------------------------
    // CENA 2: O PRIMEIRO ANO (MESES DE 2008)
    // ------------------------------------------------------------------------
    scene2Month(label, stemOffset) {
      this.setDomState('state-scene-2-month');
      if (this.stem) {
        this.stem.style.strokeDashoffset = stemOffset.toString();
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = label;
        this.chronoFlowBadge.classList.add('flow-visible');
      }
    }

    // ------------------------------------------------------------------------
    // CENA 3: 2009 (1 ANO) - PRIMEIRA FOLHA
    // ------------------------------------------------------------------------
    scene3Year2009() {
      this.setDomState('state-scene-3-2009');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2009';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '1 ano';
      }
      if (this.stem) {
        this.stem.style.strokeDashoffset = '288';
      }
      if (this.leaves && this.leaves[2009]) {
        this.leaves[2009].classList.add('leaf-visible');
        this.leaves[2009].style.opacity = '1';
        this.leaves[2009].style.transform = 'scale(1)';
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = '2009';
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.35, 1800);
      }
    }

    // ------------------------------------------------------------------------
    // CENA 4: A INFÂNCIA (2010 A 2016, 2 A 8 ANOS)
    // ------------------------------------------------------------------------
    scene4Year(year, age, stemOffset, leafKey) {
      this.setDomState(`state-scene-4-${year}`);
      if (this.chronoYear) {
        this.chronoYear.textContent = year.toString();
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = `${age} anos`;
      }
      if (this.stem) {
        this.stem.style.strokeDashoffset = stemOffset.toString();
      }
      if (this.leaves && this.leaves[leafKey]) {
        this.leaves[leafKey].classList.add('leaf-visible');
        this.leaves[leafKey].style.opacity = '1';
        this.leaves[leafKey].style.transform = 'scale(1)';
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = `${year}`;
      }
      if (this.sys && this.sys.audioManager) {
        const vol = 0.35 + ((age - 2) * 0.035);
        this.sys.audioManager.fadeTo(Math.min(0.60, vol), 1200);
      }
    }

    // ------------------------------------------------------------------------
    // CENA 5: A TRANSFORMAÇÃO (2017 A 2023)
    // ------------------------------------------------------------------------
    scene5BudForms() {
      this.setDomState('state-scene-5-2017');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2017';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '9 anos';
      }
      if (this.stem) {
        this.stem.style.strokeDashoffset = '0';
      }
      if (this.budGroup) {
        this.budGroup.style.opacity = '1';
        this.budGroup.classList.add('bud-visible');
        this.budGroup.style.transform = 'scale(1)';
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = '2017';
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.7);
        this.sys.audioManager.fadeTo(0.62, 1600);
      }
    }

    scene5Year(year, age) {
      this.setDomState(`state-scene-5-${year}`);
      if (this.chronoYear) {
        this.chronoYear.textContent = year.toString();
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = `${age} anos`;
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = year.toString();
      }
    }

    scene5BudSwells() {
      this.setDomState('state-scene-5-2023');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2023';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '15 anos';
      }
      if (this.budGroup) {
        this.budGroup.classList.add('bud-swelling');
        this.budGroup.style.transform = 'scale(1.35)';
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.textContent = '2023';
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.66, 1400);
      }
    }

    // ------------------------------------------------------------------------
    // CENA 6: APROXIMAÇÃO (2024 E 2025)
    // ------------------------------------------------------------------------
    scene6Year2024() {
      this.setDomState('state-scene-6-2024');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2024';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '16 anos';
      }
      if (this.chronoFlowBadge) {
        this.chronoFlowBadge.classList.remove('flow-visible');
      }
      if (this.chronoDetailBadge) {
        this.chronoDetailBadge.textContent = '24 de setembro';
        this.chronoDetailBadge.classList.add('detail-visible');
      }
      // Primeiras pétalas começam a abrir
      if (this.flowerGroup) {
        this.flowerGroup.style.opacity = '1';
        this.flowerGroup.classList.add('flower-visible');
        this.flowerGroup.style.transform = 'scale(0.65)';
      }
      if (this.budGroup) {
        this.budGroup.style.opacity = '0';
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.85);
        this.sys.audioManager.fadeTo(0.70, 1600);
      }
    }

    scene7Year2025() {
      this.setDomState('state-scene-7-2025');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2025';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '17 anos';
      }
      if (this.flowerGroup) {
        this.flowerGroup.classList.add('flower-opening');
        this.flowerGroup.style.transform = 'scale(0.9)';
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.74, 2000);
      }
    }

    // ------------------------------------------------------------------------
    // CENA 7: O DESABROCHAR (2026: 18 ANOS)
    // ------------------------------------------------------------------------
    scene8Start2026() {
      this.setDomState('state-scene-8-2026');
      if (this.chronoYear) {
        this.chronoYear.textContent = '2026';
        this.chronoYear.classList.remove('year-tick-bump');
        void this.chronoYear.offsetWidth;
        this.chronoYear.classList.add('year-tick-bump');
      }
      if (this.chronoAgeBadge) {
        this.chronoAgeBadge.textContent = '18 ANOS';
      }
      if (this.chronoDetailBadge) {
        this.chronoDetailBadge.classList.remove('detail-visible');
      }
    }

    scene8MonthTick(monthName) {
      if (this.chronoMonth) {
        this.chronoMonth.textContent = monthName;
        this.chronoMonth.classList.remove('month-visible');
        void this.chronoMonth.offsetWidth;
        this.chronoMonth.classList.add('month-visible');
      }
    }

    scene8DayTick(dayStr) {
      if (this.chronoDay) {
        this.chronoDay.textContent = dayStr;
        this.chronoDay.classList.remove('day-visible');
        void this.chronoDay.offsetWidth;
        this.chronoDay.classList.add('day-visible');
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ①: 24 DE SETEMBRO DE 2026 — FLOR TERMINA DE ABRIR E FICA SOZINHA
    // Sem textos, sem interferências, a flor respira no gramado e céu aberto por ~1.8s
    // ------------------------------------------------------------------------
    sceneFlowerAlone() {
      this.setDomState('state-scene-flower-alone');
      if (this.chronoDay) this.chronoDay.textContent = '24';
      if (this.chronoMonth) this.chronoMonth.textContent = 'SETEMBRO';
      if (this.chronoYear) this.chronoYear.textContent = '2026';

      // Remove o card da data para deixar o cenário limpo e a flor em evidência absoluta
      if (this.chronoDateCard) {
        this.chronoDateCard.classList.add('card-faded');
      }

      // Flor termina de desabrochar completamente no centro do gramado
      if (this.flowerGroup) {
        this.flowerGroup.style.opacity = '1';
        this.flowerGroup.classList.remove('flower-opening');
        this.flowerGroup.classList.add('flower-full-bloom', 'flower-celebrating');
      }

      // Chuva sutil e delicada de pétalas/confetes botânicos
      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.58 },
          colors: ['#ff4081', '#f50057', '#ffd54f', '#ffffff', '#81c784']
        });
      }

      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.95);
        this.sys.audioManager.fadeTo(0.78, 2000);
      }
    }

    // ------------------------------------------------------------------------
    // ✨ ETAPA ②: FRASE NO CÉU (ACIMA DA FLOR)
    // "E depois de todos esses anos..." surge no alto, fica 1.5s e depois some
    // ------------------------------------------------------------------------
    sceneSkyLeadIn() {
      this.setDomState('state-scene-sky-lead-in');
      if (this.skyLeadText) {
        this.skyLeadText.classList.remove('lead-fade-out');
        this.skyLeadText.classList.add('lead-visible');
      }
    }

    sceneSkyLeadOut() {
      this.setDomState('state-scene-sky-lead-out');
      if (this.skyLeadText) {
        this.skyLeadText.classList.remove('lead-visible');
        this.skyLeadText.classList.add('lead-fade-out');
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ③: 18 ANOS (ABAIXO DA FLOR)
    // A câmera se eleva suavemente, flor continua respirando no topo e "18 ANOS" surge abaixo
    // ------------------------------------------------------------------------
    scene18Num() {
      this.setDomState('state-scene-18-num');
      // Elevação suave da câmera para revelar a parte inferior com amplitude
      if (this.cameraEl) {
        this.cameraEl.classList.add('camera-elevate');
      }
      if (this.revelationBelow) {
        this.revelationBelow.classList.add('revelation-visible');
      }
      if (this.milestone18Num) {
        this.milestone18Num.classList.add('visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.75);
      }
    }

    scene18Anos() {
      this.setDomState('state-scene-18-anos');
      if (this.milestone18Label) {
        this.milestone18Label.classList.add('visible');
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ④: ISSAMARA (ABAIXO DE 18 ANOS)
    // ------------------------------------------------------------------------
    sceneNameIssamara() {
      this.setDomState('state-scene-name-issamara');
      if (this.heroNameWrap) {
        this.heroNameWrap.classList.add('name-visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.9);
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ⑤: 24 DE SETEMBRO DE 2026 (ABAIXO DO NOME)
    // ------------------------------------------------------------------------
    sceneDateBelow() {
      this.setDomState('state-scene-date-below');
      if (this.heroDateWrap) {
        this.heroDateWrap.classList.add('date-visible');
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ⑥: 18 anos de uma história. (SUB-TEXTO POÉTICO EM ITÁLICO)
    // ------------------------------------------------------------------------
    sceneSubStory() {
      this.setDomState('state-scene-sub-story');
      if (this.heroSubWrap) {
        this.heroSubWrap.classList.add('sub-visible');
      }
      // Botão discreto para toque consciente
      if (this.startPromptBtn) {
        this.startPromptBtn.classList.add('prompt-visible');
      }
    }

    // ------------------------------------------------------------------------
    // 🌸 ETAPA ⑦: CÂMERA COMEÇA A SE AFASTAR MOSTRANDO O CENÁRIO AMPLO
    // ------------------------------------------------------------------------
    sceneCameraRetreat() {
      this.setDomState('state-scene-camera-retreat');
      if (this.cameraEl) {
        this.cameraEl.classList.remove('camera-elevate');
        this.cameraEl.classList.add('camera-retreat');
      }
    }

    // ------------------------------------------------------------------------
    // TRANSIÇÃO CINEMATOGRÁFICA PARA O LIVRO (PÉTALA CAINDO)
    // ------------------------------------------------------------------------
    transitionToBook(isInstant = false) {
      if (this.isTransitioning || this.isCompleted) return;
      this.isTransitioning = true;

      if (isInstant) {
        this.finishCinematicSequence(true);
        return;
      }

      // Animação da pétala se desprendendo e caindo em direção à tela/câmera
      if (this.fallingPetal) {
        this.fallingPetal.classList.add('petal-falling');
      }

      // Som autêntico da virada de página / abertura do livro
      if (this.sys && this.sys.soundEffects) {
        try {
          this.sys.soundEffects.playPageTurn();
        } catch (e) {}
      }

      // Após a pétala cobrir a câmera, revela o livro no Capítulo 1
      setTimeout(() => {
        this.finishCinematicSequence(false);
      }, 1900);
    }

    finishCinematicSequence(isInstant = false) {
      if (this.isCompleted) return;
      this.isCompleted = true;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.50, 800);
      }

      const navBar = document.getElementById('top-nav-bar');
      if (navBar) {
        navBar.classList.add('nav-reveal-active');
      }

      const stage = document.getElementById('stage-wrapper');
      if (stage) {
        stage.classList.add('stage-reveal-active');
      }

      if (this.entryEl) {
        this.entryEl.classList.add('fade-out-complete');
        const delay = isInstant ? 200 : 1000;
        setTimeout(() => {
          if (this.entryEl) {
            this.entryEl.style.display = 'none';
          }
        }, delay);
      }
    }
  }


  // ==========================================
  // 4.5. VISUAL INTEGRITY GUARD
  // Monitora layout, duplicatas e alinhamento de cena via requestAnimationFrame
  // ==========================================
  class VisualIntegrityGuard {
    constructor() {
      this.rafId = null;
      this.lastCheckTime = 0;
      this.throttleMs = 150;
      this.isChecking = false;
      this.mutationObserver = null;
    }

    start() {
      // 1. Escuta redimensionamentos e mudanças de orientação
      window.addEventListener('resize', () => this.requestCheck(), { passive: true });
      window.addEventListener('orientationchange', () => this.requestCheck(), { passive: true });

      // 2. MutationObserver para monitorar injeções de elementos e prevenir duplicatas
      if (typeof MutationObserver !== 'undefined') {
        this.mutationObserver = new MutationObserver((mutations) => {
          let shouldCheck = false;
          for (let i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes && mutations[i].addedNodes.length > 0) {
              shouldCheck = true;
              break;
            }
          }
          if (shouldCheck) {
            this.requestCheck();
          }
        });

        const target = document.getElementById('stage-wrapper') || document.body;
        if (target) {
          this.mutationObserver.observe(target, { childList: true, subtree: true });
        }
      }

      // Verificação inicial rápida
      this.requestCheck();
    }

    requestCheck() {
      if (this.rafId) return;

      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const now = performance.now();
        if (now - this.lastCheckTime >= this.throttleMs) {
          this.lastCheckTime = now;
          this.performCheck();
        }
      });
    }

    performCheck() {
      if (this.isChecking) return;
      this.isChecking = true;

      try {
        // A. Prevenção de vazamento de scroll horizontal da página
        if (document.documentElement.scrollWidth > window.innerWidth) {
          document.documentElement.style.overflowX = 'hidden';
          document.body.style.overflowX = 'hidden';
        }

        // B. Verificação e remoção de créditos duplicados caso surjam
        const oldDuplicateCards = document.querySelectorAll('.kotak:has(#btn-credits-back), .kotak:has(#easter-egg-name)');
        if (oldDuplicateCards.length > 0) {
          oldDuplicateCards.forEach((el) => {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
        }

        // C. Alinhamento da cena final e preservação de bordas/fundos
        const activeStage = document.querySelector('.eagora-stage');
        if (activeStage && document.body.classList.contains('eagora-fullscreen-active')) {
          if (document.body.style.margin && document.body.style.margin !== '0px') {
            document.body.style.margin = '0';
          }
        }

        // D. Verificação estrutural e correção de bordas na abertura (cinematic-scene / camera)
        const cinematicEntry = document.getElementById('cinematic-entry');
        if (cinematicEntry && !cinematicEntry.classList.contains('fade-out-complete')) {
          const cScene = document.querySelector('.cinematic-scene');
          const cCamera = document.querySelector('.cinematic-camera');
          if (cScene && cScene.style.margin && cScene.style.margin !== '0px auto' && cScene.style.margin !== '0px') {
            cScene.style.margin = '0 auto';
          }
          if (cCamera && cCamera.style.margin && cCamera.style.margin !== '0px auto' && cCamera.style.margin !== '0px') {
            cCamera.style.margin = '0 auto';
          }
        }
      } catch (e) {
        // Operação não obstrutiva
      } finally {
        this.isChecking = false;
      }
    }

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }
    }
  }

  // ==========================================
  // 5. CORE SYSTEM CONTROLLER
  // ==========================================
  class ExperienceSystem {
    constructor() {
      this.currentChapterIndex = 0;
      this.timer = new TimerManager();
      this.audioManager = new AudioManager();
      this.soundEffects = new SoundEffects();
      this.progressManager = new ProgressManager();
      this.viewportPetals = new ViewportPetalsSystem();
      this.activeBookController = null;
      this.activeAnimController = null;
      this.activeFinaleController = null;
      this.isTransitioningChapter = false;
      this.isPaused = false;
      this.completedChapters = [1];
      this.stage = document.getElementById('stage-wrapper');
      this.tapBar = null;

      this.init();
      // Inicializa o orquestrador da abertura cinematográfica
      this.cinematicIntro = new CinematicEntryController(this);
    }

    init() {
      const saved = this.progressManager.load();
      this.completedChapters = saved.completedChapters || [1];

      const letterEl = document.getElementById('pdf-letter-content');
      if (letterEl) {
        this.fullLetterRawText = letterEl.innerText.trim();
      }

      this.bindGlobalEvents();
      this.renderChapterListModal();
      this.goToChapter(1, false);

      // Passo 31: Verificação de conclusão prévia no dispositivo
      if (localStorage.getItem('issamara_exp_concluded') === 'true') {
        setTimeout(() => {
          this.showReconnectionModal();
        }, 400);
      }
    }

    showReconnectionModal() {
      const existing = document.getElementById('eagora-reconnection-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'eagora-reconnection-modal';
      modal.className = 'eagora-concluded-screen';
      modal.style.zIndex = '9999';
      modal.innerHTML = `
        <div class="eagora-concluded-card">
          <div class="eagora-concluded-icon">🌸✨</div>
          <h3>Essa experiência já foi concluída.</h3>
          <p>
            As memórias dos 18 anos de Issamara estão guardadas com carinho.
          </p>
          <div class="eagora-concluded-actions">
            <button class="eagora-btn btn-restart" id="btn-reconnect-restart">
              <i class="fa-solid fa-rotate-left"></i> Recomeçar experiência
            </button>
            <button class="eagora-btn btn-save" id="btn-reconnect-finale">
              <i class="fa-solid fa-sparkles"></i> Ver encerramento
            </button>
            <button class="eagora-btn btn-pdf" id="btn-reconnect-pdf">
              <i class="fa-solid fa-file-pdf"></i> Baixar os textos em PDF
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const btnRestart = modal.querySelector('#btn-reconnect-restart');
      const btnFinale = modal.querySelector('#btn-reconnect-finale');
      const btnPdf = modal.querySelector('#btn-reconnect-pdf');

      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          localStorage.removeItem('issamara_exp_concluded');
          modal.remove();
          this.restartExperience();
        });
      }

      if (btnFinale) {
        btnFinale.addEventListener('click', () => {
          modal.remove();
          if (this.cinematicIntro && typeof this.cinematicIntro.completeCinematic === 'function') {
            this.cinematicIntro.completeCinematic();
          }
          this.goToChapter(20, false);
        });
      }

      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          if (this.activeFinaleController && typeof this.activeFinaleController.downloadAllTextsPdf === 'function') {
            this.activeFinaleController.downloadAllTextsPdf();
          } else {
            const controller = new EAgoraFinaleController(null, this);
            controller.downloadAllTextsPdf();
          }
        });
      }
    }

    bindGlobalEvents() {
      // Avanço tátil em qualquer ponto do palco (exceto botões, links e inputs)
      if (this.stage) {
        this.stage.addEventListener('click', (e) => {
          if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.book-stage')) {
            return;
          }
          this.handleTapAdvance();
        });
      }

      // Navegação universal por teclado (Seta Direita / Espaço para avançar, Seta Esquerda para voltar)
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'ArrowRight' || e.key === ' ') {
          this.nextChapter();
        } else if (e.key === 'ArrowLeft') {
          this.prevChapter();
        }
      });

      // Chapter Modal close (se acionado internamente)
      const btnCloseChapters = document.getElementById('btn-close-chapters-modal');
      const btnCloseChaptersFooter = document.getElementById('btn-close-modal-footer');
      if (btnCloseChapters) btnCloseChapters.addEventListener('click', () => this.closeChaptersModal());
      if (btnCloseChaptersFooter) btnCloseChaptersFooter.addEventListener('click', () => this.closeChaptersModal());

      // Restart Modal elements
      const btnCloseRestart = document.getElementById('btn-close-restart-modal');
      const btnCancelRestart = document.getElementById('btn-cancel-restart');
      const btnConfirmRestart = document.getElementById('btn-confirm-restart');
      if (btnCloseRestart) btnCloseRestart.addEventListener('click', () => this.closeRestartModal());
      if (btnCancelRestart) btnCancelRestart.addEventListener('click', () => this.closeRestartModal());
      if (btnConfirmRestart) {
        btnConfirmRestart.addEventListener('click', () => {
          this.closeRestartModal();
          this.restartExperience();
        });
      }

      // PDF Modal elements
      const btnClosePdf = document.getElementById('btn-close-pdf-modal');
      const btnClosePdfFooter = document.getElementById('btn-close-pdf-footer');
      const btnPrintLetter = document.getElementById('btn-print-letter');
      const btnDownloadPdf = document.getElementById('btn-download-pdf');

      if (btnClosePdf) btnClosePdf.addEventListener('click', () => this.closePdfModal());
      if (btnClosePdfFooter) btnClosePdfFooter.addEventListener('click', () => this.closePdfModal());
      if (btnPrintLetter) btnPrintLetter.addEventListener('click', () => this.printLetter());
      if (btnDownloadPdf) btnDownloadPdf.addEventListener('click', () => this.downloadPdf());
    }

    goToChapter(chapterNumber, autoPlayAudio = true) {
      const idx = chapterNumber - 1;
      if (idx < 0 || idx >= CHAPTERS.length) return;
      if (this.isTransitioningChapter) return;

      const currentContainer = this.stage ? this.stage.querySelector('.chapter-container') : null;

      const executeChapterEnter = () => {
        // Clean up previous chapter completely
        this.timer.clearAll();
        this.hideTapPrompt();
        if (this.activeBookController) {
          this.activeBookController.destroy();
          this.activeBookController = null;
        }
        if (this.activeFinaleController) {
          this.activeFinaleController.destroy();
          this.activeFinaleController = null;
        }
        if (this.activeAnimController) {
          this.activeAnimController.destroy();
          this.activeAnimController = null;
        }
        if (this.stage) this.stage.innerHTML = '';

        this.currentChapterIndex = idx;
        const chapter = CHAPTERS[idx];

        // Mark chapter as unlocked
        if (!this.completedChapters.includes(chapter.id)) {
          this.completedChapters.push(chapter.id);
        }

        // Persist progress
        const isFinished = chapter.id === 20;
        this.progressManager.save(chapter.id, this.completedChapters, true, isFinished);

        // Audio fade / level & continuity (sem reiniciar, respeitando restrição de background)
        if (autoPlayAudio && this.audioManager && this.audioManager.audio && this.audioManager.audio.paused && !this.audioManager.isMuted && !document.hidden && !this.audioManager.pausedByBackground) {
          const p = this.audioManager.audio.play();
          if (p !== undefined) {
            p.then(() => {
              this.audioManager.isPlaying = true;
              this.audioManager.updateUI();
            }).catch(() => {});
          }
        }
        if (chapter.audioLevel !== undefined) {
          this.audioManager.fadeTo(chapter.audioLevel, 1000);
        }

        // Update Navigation Bar
        this.updateNavbar();

        // Create new container with Animate.css entrance animation
        const newContainer = document.createElement('div');
        newContainer.className = 'chapter-container animate__animated animate__fadeIn';
        this.stage.appendChild(newContainer);

        // Render chapter contents into the container
        chapter.render(newContainer, this);

        // Clean up entrance animation classes once completed
        const onEntranceEnd = () => {
          newContainer.classList.remove('animate__animated', 'animate__fadeIn');
          newContainer.removeEventListener('animationend', onEntranceEnd);
          this.isTransitioningChapter = false;
        };
        newContainer.addEventListener('animationend', onEntranceEnd, { once: true });
        setTimeout(() => {
          if (this.isTransitioningChapter) {
            newContainer.classList.remove('animate__animated', 'animate__fadeIn');
            this.isTransitioningChapter = false;
          }
        }, 450);

        // Render chapter list modal state
        this.renderChapterListModal();
      };

      if (currentContainer && this.stage.children.length > 0) {
        this.isTransitioningChapter = true;
        currentContainer.classList.add('chapter-exit');
        const onExitEnd = () => {
          currentContainer.removeEventListener('animationend', onExitEnd);
          executeChapterEnter();
        };
        currentContainer.addEventListener('animationend', onExitEnd, { once: true });
        setTimeout(() => {
          if (this.isTransitioningChapter) {
            executeChapterEnter();
          }
        }, 300);
      } else {
        this.isTransitioningChapter = true;
        executeChapterEnter();
      }
    }

    nextChapter() {
      if (this.currentChapterIndex < CHAPTERS.length - 1) {
        this.goToChapter(this.currentChapterIndex + 2);
      } else {
        if (this.activeFinaleController && typeof this.activeFinaleController.triggerCreditsNow === 'function') {
          this.activeFinaleController.triggerCreditsNow();
        }
      }
    }

    prevChapter() {
      if (this.currentChapterIndex > 0) {
        this.goToChapter(this.currentChapterIndex);
      }
    }

    handleTapAdvance() {
      // In normal mode, tap advances to next chapter
      this.nextChapter();
    }

    showTapPrompt() {
      if (this.tapBar) {
        this.tapBar.style.display = 'block';
        this.tapBar.classList.remove('d-none');
      }
    }

    hideTapPrompt() {
      if (this.tapBar) {
        this.tapBar.style.display = 'none';
        this.tapBar.classList.add('d-none');
      }
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      const icon = document.getElementById('icon-pause');
      const btn = document.getElementById('btn-pause');

      if (this.isPaused) {
        this.timer.pauseAll();
        this.audioManager.pause();
        if (this.viewportPetals) this.viewportPetals.pause();
        if (icon) icon.className = 'fas fa-play text-success';
        if (btn) btn.classList.add('active');
      } else {
        this.timer.resumeAll();
        this.audioManager.play();
        if (this.viewportPetals) this.viewportPetals.resume();
        if (icon) icon.className = 'fas fa-pause';
        if (btn) btn.classList.remove('active');
      }
    }

    updateNavbar() {
      // Interface cinematográfica sem barra de topo fixa
    }

    restartExperience() {
      this.progressManager.reset();
      this.completedChapters = [1];
      this.goToChapter(1);
    }

    // ==========================================
    // CREDITS VIEW - UNIFIED WITH FINALE (Capítulo 20)
    // ==========================================
    renderCredits() {
      // Se não estiver no Capítulo 20 (Grande Encerramento), navega diretamente para ele
      if (this.currentChapterIndex !== 19) {
        this.goToChapter(20);
        return;
      }
      // Se já estiver no Capítulo 20, aciona a exibição imediata dos créditos aprovados
      if (this.activeFinaleController && typeof this.activeFinaleController.triggerCreditsNow === 'function') {
        this.activeFinaleController.triggerCreditsNow();
      }
    }

    // ==========================================
    // MODALS
    // ==========================================
    renderChapterListModal() {
      const listContainer = document.getElementById('chapters-list-container');
      if (!listContainer) return;
      listContainer.innerHTML = '';

      CHAPTERS.forEach((ch) => {
        const isCurrent = (ch.id === (this.currentChapterIndex + 1));
        const item = document.createElement('div');
        item.className = `chapter-list-item ${isCurrent ? 'active' : ''}`;
        item.innerHTML = `
          <div>
            <strong>Capítulo ${ch.id}:</strong> ${ch.title}
          </div>
          <div>
            ${isCurrent ? '<span class="badge badge-light">Atual</span>' : '<i class="fas fa-chevron-right text-muted"></i>'}
          </div>
        `;
        item.addEventListener('click', () => {
          this.closeChaptersModal();
          this.goToChapter(ch.id);
        });
        listContainer.appendChild(item);
      });
    }

    openChaptersModal() {
      this.renderChapterListModal();
      const m = document.getElementById('modal-chapters');
      if (m) m.classList.remove('d-none');
    }

    closeChaptersModal() {
      const m = document.getElementById('modal-chapters');
      if (m) m.classList.add('d-none');
    }

    openAudioModal() {
      // Interface cinematográfica sem modal de áudio separado
    }

    closeAudioModal() {
      // Interface cinematográfica sem modal de áudio separado
    }

    openRestartModal() {
      const m = document.getElementById('modal-restart-confirm');
      if (m) m.classList.remove('d-none');
    }

    closeRestartModal() {
      const m = document.getElementById('modal-restart-confirm');
      if (m) m.classList.add('d-none');
    }

    openPdfModal() {
      const m = document.getElementById('modal-pdf');
      if (m) {
        m.classList.remove('d-none');
        this.startLetterTypingEffect();
      }
    }

    closePdfModal() {
      this.stopLetterTypingEffect();
      const m = document.getElementById('modal-pdf');
      if (m) m.classList.add('d-none');
    }

    startLetterTypingEffect() {
      const container = document.getElementById('pdf-letter-content');
      if (!container) return;

      this.stopLetterTypingEffect();

      if (!this.fullLetterRawText) {
        this.fullLetterRawText = container.innerText.trim();
      }
      const fullText = this.fullLetterRawText;

      // Container dos controles de digitação acima da carta
      let controlsBar = document.getElementById('letter-typing-controls');
      if (!controlsBar) {
        controlsBar = document.createElement('div');
        controlsBar.id = 'letter-typing-controls';
        controlsBar.className = 'letter-typing-controls';
        container.parentNode.insertBefore(controlsBar, container);
      }
      controlsBar.innerHTML = `
        <div class="typing-status-pill">
          <span class="typing-pen-icon">✍️</span>
          <span class="typing-status-text">Escrevendo carta em tempo real...</span>
        </div>
        <button type="button" class="btn-skip-typing" id="btn-skip-typing-effect" title="Exibir toda a carta imediatamente">
          <i class="fas fa-forward mr-1"></i> Pular digitação
        </button>
      `;

      const btnSkip = document.getElementById('btn-skip-typing-effect');
      if (btnSkip) {
        btnSkip.addEventListener('click', (e) => {
          e.stopPropagation();
          this.completeLetterTypingImmediately();
        });
      }

      // Prepara o container da carta
      container.innerHTML = '';
      container.style.whiteSpace = 'pre-wrap';

      const cursor = document.createElement('span');
      cursor.className = 'letter-typing-cursor';
      cursor.id = 'letter-typing-cursor';
      container.appendChild(cursor);

      let charIndex = 0;
      this.isTypingLetter = true;

      const modalBody = container.closest('.custom-modal-body');

      const typeNext = () => {
        if (!this.isTypingLetter) return;

        if (charIndex < fullText.length) {
          const char = fullText[charIndex];
          const textNode = document.createTextNode(char);
          container.insertBefore(textNode, cursor);
          charIndex++;

          // Rola suavemente para acompanhar a linha escrita
          if (modalBody && (char === '\n' || charIndex % 20 === 0)) {
            modalBody.scrollTop = modalBody.scrollHeight;
          }

          // Ritmo realista de escrita humana
          let delay = 15;
          if (char === '.' || char === '!' || char === '?') {
            delay = 140;
          } else if (char === ',') {
            delay = 75;
          } else if (char === '\n') {
            delay = 95;
          }

          this.typingLetterTimeoutId = setTimeout(typeNext, delay);
        } else {
          this.finishLetterTyping(cursor, controlsBar);
        }
      };

      typeNext();
    }

    completeLetterTypingImmediately() {
      this.stopLetterTypingEffect();
      const container = document.getElementById('pdf-letter-content');
      if (container && this.fullLetterRawText) {
        container.innerHTML = '';
        container.style.whiteSpace = 'pre-wrap';
        container.textContent = this.fullLetterRawText;
      }
      const controlsBar = document.getElementById('letter-typing-controls');
      if (controlsBar) {
        controlsBar.innerHTML = `
          <div class="typing-status-pill finished">
            <span class="typing-pen-icon">💌</span>
            <span class="typing-status-text">Carta concluída</span>
          </div>
          <button type="button" class="btn-skip-typing" id="btn-replay-typing-effect">
            <i class="fas fa-redo mr-1"></i> Digitar novamente
          </button>
        `;
        const btnReplay = document.getElementById('btn-replay-typing-effect');
        if (btnReplay) {
          btnReplay.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startLetterTypingEffect();
          });
        }
      }
    }

    stopLetterTypingEffect() {
      this.isTypingLetter = false;
      if (this.typingLetterTimeoutId) {
        clearTimeout(this.typingLetterTimeoutId);
        this.typingLetterTimeoutId = null;
      }
      const cursor = document.getElementById('letter-typing-cursor');
      if (cursor) cursor.remove();
    }

    finishLetterTyping(cursor, controlsBar) {
      this.isTypingLetter = false;
      if (cursor && cursor.parentNode) cursor.remove();
      if (controlsBar) {
        controlsBar.innerHTML = `
          <div class="typing-status-pill finished">
            <span class="typing-pen-icon">💌</span>
            <span class="typing-status-text">Carta concluída</span>
          </div>
          <button type="button" class="btn-skip-typing" id="btn-replay-typing-effect">
            <i class="fas fa-redo mr-1"></i> Digitar novamente
          </button>
        `;
        const btnReplay = document.getElementById('btn-replay-typing-effect');
        if (btnReplay) {
          btnReplay.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startLetterTypingEffect();
          });
        }
      }
    }

    // ==========================================
    // PDF GENERATION & PRINTING
    // ==========================================
    printLetter() {
      this.completeLetterTypingImmediately();
      const content = document.getElementById('pdf-template');
      if (!content) return;
      window.print();
    }

    downloadPdf() {
      this.completeLetterTypingImmediately();
      const element = document.getElementById('pdf-template');
      if (!element) return;

      const btnDownload = document.getElementById('btn-download-pdf');
      const originalText = btnDownload ? btnDownload.innerHTML : '';
      if (btnDownload) {
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Gerando PDF...';
      }

      if (window.html2pdf) {
        const opt = {
          margin: 10,
          filename: 'Carta_Aniversario_Issamara_18_Anos.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        window.html2pdf().set(opt).from(element).save().then(() => {
          if (btnDownload) {
            btnDownload.disabled = false;
            btnDownload.innerHTML = originalText;
          }
        }).catch(() => {
          if (btnDownload) {
            btnDownload.disabled = false;
            btnDownload.innerHTML = originalText;
          }
          window.print();
        });
      } else {
        if (btnDownload) {
          btnDownload.disabled = false;
          btnDownload.innerHTML = originalText;
        }
        window.print();
      }
    }

    // ==========================================
    // GRAND FINALE SHOW & MULTILINGUAL CELEBRATION
    // ==========================================
    fireSalvoConfetti() {
      if (!window.confetti) return;
      const defaults = { origin: { y: 0.68 } };
      window.confetti(Object.assign({}, defaults, {
        particleCount: 45,
        spread: 75,
        origin: { x: 0.2, y: 0.65 },
        colors: ['#ffe699', '#ff6b8b', '#ffffff', '#ffd166', '#a29bfe']
      }));
      window.confetti(Object.assign({}, defaults, {
        particleCount: 45,
        spread: 75,
        origin: { x: 0.8, y: 0.65 },
        colors: ['#ffe699', '#ff6b8b', '#ffffff', '#ffd166', '#a29bfe']
      }));
    }

    renderGrandFinaleShow(stage) {
      if (!stage) return;
      stage.innerHTML = '';

      if (this.audioManager) {
        this.audioManager.fadeTo(0.85, 1200);
        this.audioManager.playSparkleSound(1.0);
      }

      // Salva inicial de confetes comemorativos
      this.fireSalvoConfetti();
      setTimeout(() => this.fireSalvoConfetti(), 900);

      const languages = [
        {
          id: 'pt',
          flag: '🇧🇷',
          name: 'Português',
          short: 'PT',
          headline: 'Feliz Aniversário de 18 Anos, Issamara!',
          msg: 'Que este novo ciclo traga horizontes infinitos, conquistas grandiosas, alegrias sinceras e muita luz para a sua vida!'
        },
        {
          id: 'en',
          flag: '🇺🇸',
          name: 'English',
          short: 'EN',
          headline: 'Happy 18th Birthday, Issamara!',
          msg: 'May this milestone year bring boundless happiness, unforgettable adventures, and every dream coming true!'
        },
        {
          id: 'fr',
          flag: '🇫🇷',
          name: 'Français',
          short: 'FR',
          headline: 'Joyeux 18ème Anniversaire, Issamara !',
          msg: 'Que cette nouvelle étape de vie soit lumineuse, pleine de succès, de doux rires et de merveilleux bonheurs !'
        },
        {
          id: 'it',
          flag: '🇮🇹',
          name: 'Italiano',
          short: 'IT',
          headline: 'Buon 18° Compleanno, Issamara!',
          msg: 'Ti auguro un cammino radioso, ricco di emozioni straordinarie, serenità e tanta felicità nel cuore!'
        },
        {
          id: 'es',
          flag: '🇪🇸',
          name: 'Español',
          short: 'ES',
          headline: '¡Felices 18 Años, Issamara!',
          msg: '¡Que cada día de esta hermosa etapa esté lleno de sonrisas sinceras, grandes metas cumplidas y bendiciones!'
        },
        {
          id: 'de',
          flag: '🇩🇪',
          name: 'Deutsch',
          short: 'DE',
          headline: 'Alles Gute zum 18. Geburtstag, Issamara!',
          msg: 'Möge dein Weg von Glück, Gesundheit, Freude und unvergesslichen Momenten begleitet sein. Feiere diesen Tag!'
        },
        {
          id: 'ja',
          flag: '🇯🇵',
          name: '日本語',
          short: 'JA',
          headline: '18歳のお誕生日おめでとう、イサマラ！',
          msg: '輝かしい未来とたくさんの幸福があなたを包み込みますように。素敵な18歳の一年になりますように！'
        },
        {
          id: 'ko',
          flag: '🇰🇷',
          name: '한국어',
          short: 'KO',
          headline: '18번째 생일을 진심으로 축하해, 이사마라!',
          msg: '네 앞길에 언제나 따뜻한 빛과 눈부신 행복이 가득하길 바라. 특별한 오늘, 최고의 하루가 되길!'
        }
      ];

      let currentLangIndex = 0;
      let cycleTimer = null;

      const grandShow = document.createElement('div');
      grandShow.className = 'finale-grand-show animate__animated animate__zoomIn';
      grandShow.innerHTML = `
        <div class="finale-aurora-glow" aria-hidden="true"></div>

        <!-- Partículas Festivas Flutuantes -->
        <div class="finale-floating-particles" aria-hidden="true">
          <span class="fp fp-1">✨</span>
          <span class="fp fp-2">💖</span>
          <span class="fp fp-3">🌸</span>
          <span class="fp fp-4">⭐</span>
          <span class="fp fp-5">🎉</span>
          <span class="fp fp-6">✨</span>
          <span class="fp fp-7">💕</span>
          <span class="fp fp-8">🌟</span>
          <span class="fp fp-9">🎂</span>
          <span class="fp fp-10">💫</span>
        </div>

        <!-- Medalhão 3D dos 18 Anos com Órbitas Estelares -->
        <div class="finale-crown-3d">
          <div class="finale-orbit-ring">
            <span class="orbit-star">✦</span>
          </div>
          <div class="finale-orbit-ring ring-2">
            <span class="orbit-star">✦</span>
          </div>
          <div class="finale-medallion-core">
            <div class="finale-badge-num">18</div>
            <div class="finale-badge-sub">ANOS</div>
          </div>
        </div>

        <!-- Cabeçalho -->
        <div class="finale-header">
          <div class="finale-stars-row">✦ &nbsp; ★ &nbsp; ✦</div>
          <h1 class="finale-name-title">ISSAMARA</h1>
          <div class="finale-date-badge">24 de Setembro de 2026 • 18 Anos</div>
        </div>

        <!-- Vitrine Multilíngue (Troca de Língua) -->
        <div class="finale-multilingual-box">
          <div class="finale-lang-card" id="finale-lang-card">
            <div class="finale-lang-top">
              <span class="finale-lang-flag" id="finale-lang-flag">🇧🇷</span>
              <span class="finale-lang-name" id="finale-lang-name">PORTUGUÊS</span>
              <span class="finale-lang-counter" id="finale-lang-counter">1 / 8</span>
            </div>
            <h2 class="finale-lang-headline" id="finale-lang-headline">Feliz Aniversário de 18 Anos, Issamara!</h2>
            <p class="finale-lang-msg" id="finale-lang-msg">
              Que este novo ciclo traga horizontes infinitos, conquistas grandiosas, alegrias sinceras e muita luz para a sua vida!
            </p>
          </div>

          <!-- Pílulas Interativas de Seleção de Língua -->
          <div class="finale-lang-pills" id="finale-lang-pills"></div>
        </div>

        <!-- Botão Interativo de Fogos e Efeitos -->
        <div class="finale-interactive-bar">
          <button id="btn-finale-fireworks" class="btn-finale-spark">
            <i class="fas fa-magic mr-2"></i> Soltar Mais Fogos & Confetes 🎉
          </button>
        </div>

        <!-- Barra de Ações -->
        <div class="finale-actions-row">
          <button id="btn-show-credits" class="btn btn-outline-info">
            <i class="fas fa-info-circle mr-1"></i> Ver Créditos
          </button>
          <button id="btn-reopen-book" class="btn btn-outline-secondary">
            <i class="fas fa-book-open mr-1"></i> Reabrir Livro (Cap. 19)
          </button>
          <button id="btn-open-pdf-20" class="btn btn-primary">
            <i class="fas fa-file-pdf mr-1"></i> Baixar Carta em PDF
          </button>
          <button id="btn-restart-20" class="btn btn-outline-danger">
            <i class="fas fa-redo mr-1"></i> Recomeçar
          </button>
        </div>
      `;

      stage.appendChild(grandShow);

      // Elementos do Card Multilíngue
      const cardEl = grandShow.querySelector('#finale-lang-card');
      const flagEl = grandShow.querySelector('#finale-lang-flag');
      const nameEl = grandShow.querySelector('#finale-lang-name');
      const counterEl = grandShow.querySelector('#finale-lang-counter');
      const headlineEl = grandShow.querySelector('#finale-lang-headline');
      const msgEl = grandShow.querySelector('#finale-lang-msg');
      const pillsContainer = grandShow.querySelector('#finale-lang-pills');

      // Criação das pílulas de idioma
      languages.forEach((lang, idx) => {
        const pill = document.createElement('button');
        pill.className = `lang-pill-btn ${idx === 0 ? 'active-lang' : ''}`;
        pill.innerHTML = `${lang.flag} ${lang.short}`;
        pill.setAttribute('data-lang-idx', idx);
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          setLanguage(idx);
          restartAutoCycle();
        });
        pillsContainer.appendChild(pill);
      });

      const setLanguage = (index) => {
        currentLangIndex = index;
        const target = languages[index];
        if (!target || !cardEl) return;

        // Animação 3D de virada do card
        cardEl.classList.remove('card-flipping');
        void cardEl.offsetWidth; // Trigger reflow
        cardEl.classList.add('card-flipping');

        setTimeout(() => {
          if (flagEl) flagEl.textContent = target.flag;
          if (nameEl) nameEl.textContent = target.name;
          if (counterEl) counterEl.textContent = `${index + 1} / ${languages.length}`;
          if (headlineEl) headlineEl.textContent = target.headline;
          if (msgEl) msgEl.textContent = target.msg;
        }, 220);

        // Atualiza estilo das pílulas
        const pills = pillsContainer.querySelectorAll('.lang-pill-btn');
        pills.forEach((p, idx) => {
          if (idx === index) {
            p.classList.add('active-lang');
          } else {
            p.classList.remove('active-lang');
          }
        });

        if (this.audioManager) {
          this.audioManager.playSparkleSound(0.7);
        }
      };

      const restartAutoCycle = () => {
        if (cycleTimer) clearInterval(cycleTimer);
        cycleTimer = setInterval(() => {
          const nextIdx = (currentLangIndex + 1) % languages.length;
          setLanguage(nextIdx);
        }, 3800);
      };

      restartAutoCycle();

      // Botão de Fogos Interativo
      const btnFireworks = grandShow.querySelector('#btn-finale-fireworks');
      if (btnFireworks) {
        btnFireworks.addEventListener('click', () => {
          this.fireSalvoConfetti();
          if (this.audioManager) {
            this.audioManager.playSparkleSound(1.0);
          }
        });
      }

      // Toolbar Actions
      const btnCredits = grandShow.querySelector('#btn-show-credits');
      if (btnCredits) {
        btnCredits.addEventListener('click', () => {
          if (cycleTimer) clearInterval(cycleTimer);
          this.renderCredits();
        });
      }

      const btnBook = grandShow.querySelector('#btn-reopen-book');
      if (btnBook) {
        btnBook.addEventListener('click', () => {
          if (cycleTimer) clearInterval(cycleTimer);
          this.goToChapter(19);
        });
      }

      const btnPdf = grandShow.querySelector('#btn-open-pdf-20');
      if (btnPdf) {
        btnPdf.addEventListener('click', () => {
          this.openPdfModal();
        });
      }

      const btnRestart = grandShow.querySelector('#btn-restart-20');
      if (btnRestart) {
        btnRestart.addEventListener('click', () => {
          if (cycleTimer) clearInterval(cycleTimer);
          this.openRestartModal();
        });
      }
    }
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  window.addEventListener('DOMContentLoaded', () => {
    // Inicializa o guardião de integridade visual com rAF
    window.visualIntegrityGuard = new VisualIntegrityGuard();
    window.visualIntegrityGuard.start();

    window.appExperience = new ExperienceSystem();

    // Ouvinte garantido no SVG botânico (#botanical-svg) para crescer/ampliar temporariamente ao toque
    const plantSvg = document.getElementById('botanical-svg');
    if (plantSvg && !plantSvg._hasPlantClickListener) {
      plantSvg._hasPlantClickListener = true;
      plantSvg.addEventListener('click', (e) => {
        e.stopPropagation();
        plantSvg.classList.remove('plant-grow-active');
        void plantSvg.offsetWidth;
        plantSvg.classList.add('plant-grow-active');

        if (window.appExperience && window.appExperience.soundEffects && typeof window.appExperience.soundEffects.playChimeChord === 'function') {
          window.appExperience.soundEffects.playChimeChord();
        }

        setTimeout(() => {
          plantSvg.classList.remove('plant-grow-active');
        }, 1200);
      });
    }
  });

})();
