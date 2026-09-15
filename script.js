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
  // 2. AUDIO MANAGER
  // ==========================================
  class AudioManager {
    constructor() {
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
    }

    /**
     * Gatilho oficial da experiência: inicia a música global 'music/monokrom.mp3'
     * e garante desbloqueio de contexto de áudio sem nunca recriar nem reiniciar.
     */
    startExperienceAudio() {
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

    /**
     * Sintetizador melódico alegre e divertido do Axolote e Pato cantando 'Happy Birthday to you'
     * fielmente sincronizado com o vídeo comemorativo.
     */
    playAxolotlHappyBirthdayTune(onEventCallback) {
      if (this.isMuted) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      try {
        const t0 = ctx.currentTime + 0.05;
        const masterVol = Math.max(0.01, Math.min(1.0, this.currentVolume));
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.24 * masterVol, t0);
        masterGain.connect(ctx.destination);

        // Notas da melodia: Sol, Sol, Lá, Sol, Dó, Si ...
        const notes = [
          // 1. "hap-py"
          { freq: 392.00, start: 0.00, dur: 0.22, text: 'happy', mouth: 'happy', duck: true },
          { freq: 392.00, start: 0.26, dur: 0.22, text: 'happy', mouth: 'happy', duck: false },
          // "birth-day"
          { freq: 440.00, start: 0.58, dur: 0.38, text: 'birthday', mouth: 'birthday', duck: true },
          { freq: 392.00, start: 1.02, dur: 0.38, text: 'birthday', mouth: 'birthday', duck: false },
          // "to youuuuu"
          { freq: 523.25, start: 1.48, dur: 0.40, text: 'to youuuuu', mouth: 'toyou', duck: true, vibrato: true },
          { freq: 493.88, start: 1.92, dur: 0.85, text: 'to youuuuu', mouth: 'toyou', duck: false, vibrato: true, bendTo: 512 },

          // 2. "hap-py"
          { freq: 392.00, start: 2.88, dur: 0.22, text: 'happy', mouth: 'happy', duck: true },
          { freq: 392.00, start: 3.14, dur: 0.22, text: 'happy', mouth: 'happy', duck: false },
          // "birth-day"
          { freq: 440.00, start: 3.46, dur: 0.38, text: 'birthday', mouth: 'birthday', duck: true },
          { freq: 392.00, start: 3.90, dur: 0.38, text: 'birthday', mouth: 'birthday', duck: false },
          // "to youuuuu"
          { freq: 587.33, start: 4.36, dur: 0.40, text: 'to youuuuu', mouth: 'toyou', duck: true, vibrato: true },
          { freq: 523.25, start: 4.80, dur: 0.85, text: 'to youuuuu', mouth: 'toyou', duck: false, vibrato: true, bendTo: 540 },

          // 3. "hap-py"
          { freq: 392.00, start: 5.78, dur: 0.22, text: 'happy', mouth: 'happy', duck: true },
          { freq: 392.00, start: 6.04, dur: 0.22, text: 'happy', mouth: 'happy', duck: false },
          // "birth-day"
          { freq: 783.99, start: 6.36, dur: 0.45, text: 'birthday', mouth: 'birthday', duck: true },
          { freq: 659.25, start: 6.86, dur: 0.45, text: 'birthday', mouth: 'birthday', duck: false },
          // "to youuuu" / "Issamara"
          { freq: 523.25, start: 7.36, dur: 0.32, text: 'to youuuuu', mouth: 'toyou', duck: true },
          { freq: 493.88, start: 7.72, dur: 0.32, text: 'to youuuuu', mouth: 'toyou', duck: false },
          { freq: 440.00, start: 8.08, dur: 0.45, text: 'to youuuuu', mouth: 'toyou', duck: true },

          // 4. Clímax com Zoom: "BIRTHDAYYYYYYYYYYY!"
          { freq: 698.46, start: 8.66, dur: 0.30, text: 'BIRTHDAYYYYYYYYYYY', mouth: 'scream', duck: true, zoom: true, shake: true },
          { freq: 698.46, start: 9.00, dur: 0.30, text: 'BIRTHDAYYYYYYYYYYY', mouth: 'scream', duck: true, zoom: true, shake: true },
          { freq: 659.25, start: 9.34, dur: 0.35, text: 'BIRTHDAYYYYYYYYYYY', mouth: 'scream', duck: true, zoom: true, shake: true },
          { freq: 523.25, start: 9.72, dur: 0.40, text: 'BIRTHDAYYYYYYYYYYY', mouth: 'scream', duck: true, zoom: true, shake: true },
          { freq: 587.33, start: 10.16, dur: 0.40, text: 'BIRTHDAYYYYYYYYYYY', mouth: 'scream', duck: true, zoom: true, shake: true },
          { freq: 523.25, start: 10.60, dur: 1.50, text: 'ISSAMARA! 🎉🎂', mouth: 'scream', duck: true, zoom: true, shake: true, vibrato: true, finale: true }
        ];

        notes.forEach(n => {
          const startTime = t0 + n.start;
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'triangle';
          osc2.type = 'sine';

          osc.frequency.setValueAtTime(n.freq, startTime);
          osc2.frequency.setValueAtTime(n.freq * 2, startTime);

          if (n.bendTo) {
            osc.frequency.exponentialRampToValueAtTime(n.bendTo, startTime + n.dur);
          }

          if (n.vibrato) {
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.setValueAtTime(6.2, startTime);
            lfoGain.gain.setValueAtTime(n.freq * 0.035, startTime);
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(startTime + 0.08);
            lfo.stop(startTime + n.dur);
          }

          noteGain.gain.setValueAtTime(0.001, startTime);
          noteGain.gain.linearRampToValueAtTime(0.72, startTime + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

          osc.connect(noteGain);
          osc2.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(startTime);
          osc2.start(startTime);
          osc.stop(startTime + n.dur + 0.05);
          osc2.stop(startTime + n.dur + 0.05);

          if (onEventCallback) {
            setTimeout(() => {
              onEventCallback(n);
            }, n.start * 1000);
          }
        });

        if (onEventCallback) {
          setTimeout(() => {
            onEventCallback({ type: 'completed' });
          }, 12400);
        }
      } catch (e) {
        console.warn('Erro ao reproduzir canção do axolote:', e);
      }
    }

    play() {
      if (!this.audio) return;
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
      const soundBtnIcon = document.getElementById('icon-sound');
      const soundBtn = document.getElementById('btn-sound');
      const volSlider = document.getElementById('audio-volume-slider');
      const volLabel = document.getElementById('volume-label');
      const toggleMuteBtn = document.getElementById('btn-toggle-mute');

      if (soundBtnIcon) {
        if (this.isMuted || this.currentVolume === 0) {
          soundBtnIcon.className = 'fas fa-volume-mute text-danger';
        } else if (this.currentVolume < 0.4) {
          soundBtnIcon.className = 'fas fa-volume-down text-info';
        } else {
          soundBtnIcon.className = 'fas fa-volume-up text-primary';
        }
      }

      if (volSlider) {
        volSlider.value = Math.round(this.baseVolume * 100);
      }
      if (volLabel) {
        volLabel.innerText = Math.round(this.baseVolume * 100) + '%';
      }
      if (toggleMuteBtn) {
        toggleMuteBtn.innerHTML = this.isMuted
          ? '<i class="fas fa-volume-up mr-1"></i> Ativar Som'
          : '<i class="fas fa-volume-mute mr-1"></i> Mutar Som';
      }
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
  }

  // ==========================================
  // DIGITAL BOOK DATA (6 Complete Story Sections)
  // Preservação integral do conteúdo original
  // ==========================================
  const STORY_SECTIONS = [
    {
      id: 1,
      number: 1,
      title: "Era uma vez...",
      paragraphs: [
        "Era uma vez uma pessoa que estava prestes a completar 18 anos.",
        "E, como qualquer aniversário importante, aquele dia merecia alguma coisa diferente.",
        "Não precisava ser um presente enorme.",
        "Nem precisava ser alguma coisa complicada.",
        "Só precisava ser algo feito de coração e pensado especialmente para aquela pessoa.",
        "Essa pessoa era você, Issamara. 🎂"
      ],
      closing: "E foi aí que começou essa pequena história."
    },
    {
      id: 2,
      number: 2,
      title: "Um novo capítulo",
      paragraphs: [
        "Dezoito anos.",
        "Parece só um número quando a gente olha rapidamente.",
        "Mas, quando para para pensar, é o começo de uma fase completamente nova.",
        "Novas escolhas, novos caminhos, novos planos e muitas coisas que ainda nem aconteceram.",
        "Talvez você ainda não saiba exatamente onde tudo isso vai levar.",
        "E tudo bem.",
        "Nem toda história precisa ter o final escrito antes de começar.",
        "O importante é continuar escrevendo."
      ],
      closing: "E esse é só o começo do seu próximo capítulo. ✨"
    },
    {
      id: 3,
      number: 3,
      title: "Algumas lembranças ficam",
      paragraphs: [
        "No meio de tantos dias que passam rapidamente, algumas pequenas lembranças acabam ficando.",
        "Conversas.",
        "Risadas.",
        "Momentos simples.",
        "Até aquelas vezes em que um caminho para a escola acabava acompanhado de mini pastéis. 😂",
        "São coisas pequenas.",
        "Mas talvez sejam justamente essas coisas pequenas que fazem algumas pessoas ocuparem um lugar especial na nossa memória."
      ],
      closing: "Algumas lembranças não precisam ser enormes para serem importantes."
    },
    {
      id: 4,
      number: 4,
      title: "O tempo muda as coisas",
      paragraphs: [
        "Com o tempo, a vida vai mudando.",
        "As pessoas crescem.",
        "Os caminhos mudam.",
        "Algumas conversas ficam mais raras.",
        "E, às vezes, pessoas que antes estavam sempre por perto acabam ficando um pouco mais distantes.",
        "Mas isso não apaga aquilo que foi importante.",
        "E também não impede que coisas boas ainda possam acontecer no futuro.",
        "Talvez algumas histórias simplesmente precisem de uma pausa antes de continuar."
      ],
      closing: "E eu ainda espero que essa história tenha outros encontros pelo caminho."
    },
    {
      id: 5,
      number: 5,
      title: "O que importa agora",
      paragraphs: [
        "Mas hoje não é dia de ficar olhando para trás.",
        "Hoje é dia de olhar para você.",
        "Para os seus 18 anos.",
        "Para tudo aquilo que ainda pode acontecer.",
        "Para os sonhos que você ainda vai realizar.",
        "Para as pessoas que ainda vai conhecer.",
        "Para os lugares que ainda vai visitar.",
        "Para todas as histórias que ainda vai viver.",
        "Então, por enquanto, esquece o resto.",
        "Aproveita o seu dia.",
        "Ri bastante.",
        "Comemora.",
        "E aproveita muito essa nova fase."
      ],
      closing: "Porque hoje a protagonista dessa história é você. 🎉"
    },
    {
      id: 6,
      number: 6,
      title: "E então...",
      paragraphs: [
        "A história poderia terminar aqui.",
        "Mas, na verdade, ela não termina.",
        "Porque 18 anos não são um final.",
        "São o começo de um capítulo completamente novo.",
        "Então eu espero que esse novo capítulo seja cheio de momentos bons, pessoas incríveis, conquistas, paz e muitos motivos para sorrir.",
        "Espero que você continue sendo essa pessoa inteligente, tranquila e especial do seu jeito.",
        "E, mesmo que a vida continue levando cada um para um caminho diferente, espero que ainda existam oportunidades para a gente se encontrar novamente.",
        "Afinal...",
        "algumas histórias não precisam ser perfeitas.",
        "Só precisam continuar existindo de alguma forma."
      ],
      closing: "Feliz aniversário, Issamara. 🎂❤️\nQue seus 18 anos sejam apenas o começo de muitas coisas boas."
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
      title: "Cena Final Definitiva",
      audioLevel: 0.70,
      render: (stage, sys) => {
        if (sys.audioManager) {
          sys.audioManager.fadeTo(0.70, 1500);
        }
        sys.hideTapPrompt();

        // Inicializa a Cena Final Definitiva
        sys.activeFinaleController = new DefinitiveFinaleController(stage, sys);
      }
    }
  ];

  // ==========================================================================
  // 4.3. BIRTHDAY VIDEO ANIMATION CONTROLLER (VELA & AXOLOTE CANTOR)
  // Animação comemorativa completa inspirada no vídeo dos personagens
  // 1. Contagem regressiva e bolo interativo (blow the candle in 4, 3, 2, 1)
  // 2. Sopro de ar, vela apagada e blecaute com efeito de suspense
  // 3. Pato & Axolote cantando alegremente 'Happy Birthday to you' sincronizado
  // 4. Clímax com zoom de câmera, letras cômicas animadas e chuva de confetes
  // ==========================================================================
  class BirthdayVideoAnimController {
    constructor(container, sys) {
      this.container = container;
      this.sys = sys;
      this.isDestroyed = false;
      this.countdownTimer = null;
      this.currentCount = 4;
      this.isBlown = false;
      this.isSinging = false;
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

          <!-- 2. CORTINA DE BLECAUTE / SUSPENSE -->
          <div class="blackout-curtain" id="blackout-curtain">
            <div class="blackout-text">
              ✨ Pedido feito... ✨<br>
              <span style="font-size: 16px; color: #ffffff; font-family: 'Quicksand', sans-serif; display: inline-block; margin-top: 8px;">
                Guarde no coração! Prepare-se para a surpresa...
              </span>
            </div>
          </div>

          <!-- 3. CENA DOS PERSONAGENS CANTORES (PATO E AXOLOTE) -->
          <div class="singing-scene-container scene-hidden" id="singing-scene-container">
            <div class="singing-lyric-box">
              <span class="singing-lyric-text" id="singing-lyric-text">...</span>
            </div>

            <div class="singing-camera-wrap" id="singing-camera-wrap">
              ${this.getCharactersSvg()}
            </div>

            <div class="singing-action-bar" id="singing-action-bar">
              <button class="btn-singing-replay" id="btn-singing-replay">
                <i class="fas fa-redo"></i> Assoprar novamente
              </button>
              <button class="btn-singing-photo" id="btn-singing-photo">
                <i class="fas fa-image"></i> Ver Foto de Happy Day
              </button>
              <button class="btn-singing-continue" id="btn-singing-continue">
                Continuar a Celebração <i class="fas fa-arrow-right ml-1"></i>
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
      const btnReplay = this.container.querySelector('#btn-singing-replay');
      const btnPhoto = this.container.querySelector('#btn-singing-photo');
      const btnContinue = this.container.querySelector('#btn-singing-continue');

      if (btnBlow) {
        btnBlow.addEventListener('click', () => this.blowCandle());
      }
      if (cakeWrapper) {
        cakeWrapper.addEventListener('click', () => this.blowCandle());
      }
      if (btnReplay) {
        btnReplay.addEventListener('click', () => this.replayAll());
      }
      if (btnPhoto) {
        btnPhoto.addEventListener('click', () => {
          if (this.sys && typeof this.sys.goToChapter === 'function') {
            this.sys.goToChapter(17);
          }
        });
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
      const blackoutEl = this.container.querySelector('#blackout-curtain');
      const cakeScene = this.container.querySelector('#cake-scene-container');
      const singingScene = this.container.querySelector('#singing-scene-container');
      const btnBlow = this.container.querySelector('#btn-blow-candle');

      if (btnBlow) btnBlow.disabled = true;

      // 1. Som de sopro de ar
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playCandleBlowSound(1.0);
      }

      // 2. Animação de vento e extinção da chama
      if (windEl) windEl.classList.add('wind-active');
      if (flameEl) flameEl.classList.add('flame-blown');
      if (smokeEl) smokeEl.classList.add('smoke-active');

      // Pequeno puff de confete suave ao apagar
      if (window.confetti) {
        window.confetti({
          particleCount: 16,
          spread: 45,
          origin: { y: 0.55 },
          colors: ['#ffe082', '#ffb74d', '#ffffff']
        });
      }

      // 3. Blecaute / Suspense (0.7s após o sopro)
      this.addTimeout(() => {
        if (blackoutEl) blackoutEl.classList.add('blackout-active');
      }, 700);

      // 4. Revelação dos Personagens Cantores (após 1.8s)
      this.addTimeout(() => {
        if (cakeScene) cakeScene.classList.add('scene-hidden');
        if (singingScene) singingScene.classList.remove('scene-hidden');
        if (blackoutEl) blackoutEl.classList.remove('blackout-active');

        this.startSingingPerformance();
      }, 1800);
    }

    startSingingPerformance() {
      if (this.isDestroyed) return;
      this.isSinging = true;

      // Suaviza a música de fundo para destacar o canto alegre do Axolote
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.12, 600);
        this.sys.audioManager.playAxolotlHappyBirthdayTune((evt) => {
          if (!this.isDestroyed) this.handleSongEvent(evt);
        });
      }
    }

    handleSongEvent(evt) {
      if (!evt || this.isDestroyed) return;

      const lyricText = this.container.querySelector('#singing-lyric-text');
      const mouthPath = this.container.querySelector('#axolotl-mouth-path');
      const duckGroup = this.container.querySelector('#duck-group');
      const axolotlGroup = this.container.querySelector('#axolotl-group');
      const cameraWrap = this.container.querySelector('#singing-camera-wrap');
      const actionBar = this.container.querySelector('#singing-action-bar');

      if (evt.type === 'completed') {
        this.isSinging = false;
        // Restaura a música de fundo
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.fadeTo(0.85, 1200);
        }
        if (cameraWrap) {
          cameraWrap.classList.remove('camera-zoomed', 'camera-shaking');
        }
        if (axolotlGroup) {
          axolotlGroup.classList.remove('axolotl-singing-up', 'axolotl-shaking');
        }
        if (mouthPath) {
          mouthPath.setAttribute('d', 'M 132 162 Q 140 168 148 162');
          mouthPath.setAttribute('fill', 'none');
        }
        if (actionBar) {
          actionBar.classList.add('bar-visible');
        }
        if (this.sys && typeof this.sys.showTapPrompt === 'function') {
          this.sys.showTapPrompt();
        }
        return;
      }

      // Atualiza texto da letra
      if (evt.text && lyricText) {
        lyricText.textContent = evt.text;
        lyricText.className = 'singing-lyric-text' + (evt.finale ? ' lyric-finale' : '');
        lyricText.style.animation = 'none';
        lyricText.offsetHeight;
        lyricText.style.animation = '';
      }

      // Atualiza boca e postura do Axolote
      if (mouthPath && evt.mouth) {
        if (evt.mouth === 'happy') {
          mouthPath.setAttribute('d', 'M 130 158 Q 140 156 150 158 Q 154 172 140 174 Q 126 172 130 158 Z');
          mouthPath.setAttribute('fill', '#7a0c2e');
          if (axolotlGroup) axolotlGroup.classList.remove('axolotl-singing-up', 'axolotl-shaking');
        } else if (evt.mouth === 'birthday') {
          mouthPath.setAttribute('d', 'M 126 156 Q 140 153 154 156 Q 158 178 140 180 Q 122 178 126 156 Z');
          mouthPath.setAttribute('fill', '#7a0c2e');
          if (axolotlGroup) axolotlGroup.classList.remove('axolotl-singing-up', 'axolotl-shaking');
        } else if (evt.mouth === 'toyou') {
          mouthPath.setAttribute('d', 'M 122 152 Q 140 148 158 152 Q 166 195 140 198 Q 114 195 122 152 Z');
          mouthPath.setAttribute('fill', '#7a0c2e');
          if (axolotlGroup) {
            axolotlGroup.classList.add('axolotl-singing-up');
            axolotlGroup.classList.remove('axolotl-shaking');
          }
        } else if (evt.mouth === 'scream') {
          mouthPath.setAttribute('d', 'M 118 150 Q 140 144 162 150 Q 170 202 140 205 Q 110 202 118 150 Z');
          mouthPath.setAttribute('fill', '#880e4f');
          if (axolotlGroup) {
            axolotlGroup.classList.add('axolotl-singing-up', 'axolotl-shaking');
          }
        }
      }

      // Aperto ritmado do Pato
      if (evt.duck && duckGroup) {
        duckGroup.classList.remove('duck-squeezing');
        duckGroup.offsetHeight;
        duckGroup.classList.add('duck-squeezing');
      }

      // Efeito de Câmera (Zoom e Vibração)
      if (cameraWrap) {
        if (evt.zoom) cameraWrap.classList.add('camera-zoomed');
        if (evt.shake) cameraWrap.classList.add('camera-shaking');
      }

      // Clímax final com confetes
      if (evt.finale && window.confetti) {
        window.confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#ff4081', '#ffd54f', '#00e676', '#00b0ff', '#e040fb']
        });
      }
    }

    replayAll() {
      this.destroy();
      this.isDestroyed = false;
      this.isBlown = false;
      this.isSinging = false;
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

    getCharactersSvg() {
      return `
        <svg viewBox="0 0 280 320" class="characters-svg" id="characters-svg">
          <defs>
            <linearGradient id="duckBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#6ec8d4"/>
              <stop offset="100%" stop-color="#4ea2ae"/>
            </linearGradient>
            <linearGradient id="duckBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#a2e4ed"/>
              <stop offset="100%" stop-color="#7dd1dc"/>
            </linearGradient>
            <linearGradient id="axolotlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffb8cc"/>
              <stop offset="100%" stop-color="#ff9ab5"/>
            </linearGradient>
            <linearGradient id="axolotlGillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ff4081"/>
              <stop offset="100%" stop-color="#d81b60"/>
            </linearGradient>
          </defs>

          <!-- 1. GRUPO DO PATO (Azul/Ciano) -->
          <g id="duck-group" class="duck-group">
            <!-- Pés do Pato -->
            <ellipse cx="98" cy="292" rx="20" ry="10" fill="#30526e" stroke="#1c3345" stroke-width="3"/>
            <ellipse cx="182" cy="292" rx="20" ry="10" fill="#30526e" stroke="#1c3345" stroke-width="3"/>

            <!-- Corpo do Pato -->
            <ellipse cx="140" cy="180" rx="90" ry="105" fill="url(#duckBodyGrad)" stroke="#224057" stroke-width="4"/>
            <!-- Barriguinha mais clara -->
            <ellipse cx="140" cy="205" rx="68" ry="75" fill="url(#duckBellyGrad)" opacity="0.6"/>

            <!-- Bico / Boné Escuro do Pato (topo da cabeça) -->
            <path d="M 108 85 Q 140 65 172 85 Q 155 112 140 114 Q 125 112 108 85 Z" fill="#2d4f6c" stroke="#1c3345" stroke-width="3.5"/>

            <!-- Olhinhos serenos e fechados do pato -->
            <path d="M 85 125 Q 98 135 110 125" fill="none" stroke="#1e3649" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M 170 125 Q 182 135 195 125" fill="none" stroke="#1e3649" stroke-width="3.5" stroke-linecap="round"/>

            <!-- Bochechas rosadas do pato -->
            <circle cx="80" cy="138" r="10" fill="#ff70a0" opacity="0.35"/>
            <circle cx="200" cy="138" r="10" fill="#ff70a0" opacity="0.35"/>

            <!-- Asinhas / Mãos do Pato segurando carinhosamente o Axolote -->
            <path d="M 72 175 Q 70 215 105 218 Q 115 218 116 200 Q 88 190 72 175 Z" fill="#4697a3" stroke="#224057" stroke-width="3.5"/>
            <path d="M 208 175 Q 210 215 175 218 Q 165 218 164 200 Q 192 190 208 175 Z" fill="#4697a3" stroke="#224057" stroke-width="3.5"/>
          </g>

          <!-- 2. GRUPO DO AXOLOTE (Rosa Cantor) -->
          <g id="axolotl-group" class="axolotl-group">
            <!-- Guelras esquerdas (3 pétalas rosadas vibrantes) -->
            <g class="gill-left" id="gill-left">
              <path d="M 102 142 Q 62 130 68 148 Q 78 155 100 152 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
              <path d="M 100 154 Q 55 152 64 170 Q 76 174 98 165 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
              <path d="M 102 166 Q 66 178 76 192 Q 88 192 104 176 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
            </g>

            <!-- Guelras direitas (3 pétalas rosadas vibrantes) -->
            <g class="gill-right" id="gill-right">
              <path d="M 178 142 Q 218 130 212 148 Q 202 155 180 152 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
              <path d="M 180 154 Q 225 152 216 170 Q 204 174 182 165 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
              <path d="M 178 166 Q 214 178 204 192 Q 192 192 176 176 Z" fill="url(#axolotlGillGrad)" stroke="#a01548" stroke-width="2.5"/>
            </g>

            <!-- Corpinho fofo do axolote -->
            <ellipse cx="140" cy="198" rx="34" ry="38" fill="url(#axolotlGrad)" stroke="#2b455b" stroke-width="3"/>
            <!-- Coraçãozinho na barriga -->
            <path d="M 140 198 Q 134 190 128 196 Q 124 204 140 215 Q 156 204 152 196 Q 146 190 140 198 Z" fill="#ffe3ed" opacity="0.85"/>

            <!-- Patinhas do Axolote -->
            <ellipse cx="120" cy="224" rx="8" ry="6" fill="#ffaec6" stroke="#2b455b" stroke-width="2.5"/>
            <ellipse cx="160" cy="224" rx="8" ry="6" fill="#ffaec6" stroke="#2b455b" stroke-width="2.5"/>

            <!-- Cabeça arredondada do axolote -->
            <ellipse cx="140" cy="154" rx="46" ry="34" fill="url(#axolotlGrad)" stroke="#2b455b" stroke-width="3.5"/>

            <!-- Bochechas rosadas do axolote -->
            <circle cx="112" cy="162" r="7" fill="#ff4081" opacity="0.4"/>
            <circle cx="168" cy="162" r="7" fill="#ff4081" opacity="0.4"/>

            <!-- Olhinhos felizes (arcos fofos) -->
            <path d="M 118 146 Q 124 140 130 146" fill="none" stroke="#2b455b" stroke-width="3" stroke-linecap="round"/>
            <path d="M 150 146 Q 156 140 162 146" fill="none" stroke="#2b455b" stroke-width="3" stroke-linecap="round"/>

            <!-- BOCA DINÂMICA DO AXOLOTE -->
            <path id="axolotl-mouth-path" class="axolotl-mouth-path" d="M 132 162 Q 140 168 148 162" fill="none" stroke="#2b455b" stroke-width="3" stroke-linecap="round"/>
          </g>
        </svg>
      `;
    }
  }

  // ==========================================================================
  // 4.4. DEFINITIVE FINALE CONTROLLER (30 SEGUNDOS CONTÍNUOS DE ESPETÁCULO)
  // Linha do Tempo:
  // 0s-4s: Fechamento do Livro 3D
  // 4s-7s: A Primeira Luz e Pulsos
  // 7s-11s: O Jardim de Luz (Flores Botânicas em SVG)
  // 11s-15s: Flores em Expansão & Órbitas
  // 15s-18s: Convergência Central e Halos
  // 18s-21s: Tensão e Respiração
  // 21s-24s: O Grande Clímax (Onda, Anel, Flares H/V, Flash)
  // 24s-26s: FELIZ ANIVERSÁRIO ISSAMARA 18 ANOS
  // 26s-28s: Calma e Serenidade
  // 28s-30s: Último Momento
  // 30s+: Créditos Finais e Encerramento com Fade-Out de Áudio
  // ==========================================================================
  class DefinitiveFinaleController {
    constructor(container, experienceSystem) {
      this.container = container;
      this.sys = experienceSystem;
      this.isDestroyed = false;
      this.startTime = null;
      this.animFrameId = null;
      this.timeouts = [];
      this.flowers = [];
      this.canvasParticles = [];
      this.canvasCtx = null;
      this.canvasWidth = 0;
      this.canvasHeight = 0;

      this.init();
    }

    init() {
      if (!this.container) return;
      this.container.innerHTML = '';

      this.viewport = document.createElement('div');
      this.viewport.className = 'df-finale-viewport';
      this.viewport.innerHTML = `
        <div class="df-ambient-wash" id="df-ambient-wash"></div>
        <canvas class="df-particles-canvas" id="df-particles-canvas"></canvas>

        <!-- 0s - 4s: O Livro Termina (Fechamento 3D Suave) -->
        <div class="df-book-stage" id="df-book-stage">
          <div class="df-book-wrap" id="df-book-wrap">
            <div class="df-book-base">
              <div class="df-book-base-text">
                "Que cada novo passo seja guiado por luz, coragem e infinita felicidade."
              </div>
            </div>
            <div class="df-book-cover" id="df-book-cover">
              <div class="df-cover-emblem">
                <span class="df-cover-year">18</span>
              </div>
              <div class="df-cover-name">ISSAMARA</div>
            </div>
          </div>
        </div>

        <!-- 4s - 7s: A Primeira Luz (Ponto Central & 3 Pulsos) -->
        <div class="df-light-core-wrap" id="df-light-core-wrap">
          <div class="df-first-light-dot" id="df-first-light-dot"></div>
          <div class="df-light-ripple" id="df-light-ripple"></div>
        </div>

        <!-- 7s - 15s: O Jardim de Luz (Flores Botânicas SVG Nativas) -->
        <div class="df-flowers-container" id="df-flowers-container"></div>

        <!-- 15s - 18s: Halos de Energia e Anel Giratório -->
        <div class="df-halos-group" id="df-halos-group">
          <div class="df-halo-3"></div>
          <div class="df-halo-2"></div>
          <div class="df-halo-1"></div>
          <div class="df-energy-ring"></div>
        </div>

        <!-- 18s - 21s: Tensão e Respiração Central -->
        <div class="df-tension-layer" id="df-tension-layer"></div>

        <!-- 21s - 24s: O Grande Clímax (Onda, Anel, Flares H/V, Flash) -->
        <div class="df-climax-stage" id="df-climax-stage">
          <div class="df-climax-shockwave" id="df-climax-shockwave"></div>
          <div class="df-climax-ring" id="df-climax-ring"></div>
          <div class="df-climax-flare-h" id="df-climax-flare-h"></div>
          <div class="df-climax-flare-v" id="df-climax-flare-v"></div>
          <div class="df-climax-flash" id="df-climax-flash"></div>
        </div>

        <!-- 24s - 26s: Revelação FELIZ ANIVERSÁRIO ISSAMARA 18 ANOS -->
        <div class="df-hbd-reveal-wrap" id="df-hbd-reveal-wrap">
          <p class="df-hbd-tagline">Feliz Aniversário</p>
          <h1 class="df-hbd-name">ISSAMARA</h1>
          <div class="df-hbd-sub-badge">
            <span class="df-hbd-sub-text">18 ANOS DE LUZ</span>
          </div>
        </div>

        <!-- 28s - 30s+: Créditos Finais & Encerramento Absoluto -->
        <div class="df-credits-screen" id="df-credits-screen">
          <div class="df-credits-card">
            <p class="df-credits-line-1">"Uma pequena experiência feita especialmente para Issamara."</p>
            <p class="df-credits-author">Por Luis Fernando Santos</p>
            <p class="df-credits-date">24 de setembro de 2026</p>
            <div class="df-final-actions">
              <button class="df-action-pill pill-book" id="df-btn-reopen-book">
                <i class="fas fa-book-open"></i> Rever Livro
              </button>
              <button class="df-action-pill pill-letter" id="df-btn-open-pdf">
                <i class="fas fa-file-pdf"></i> Baixar Carta em PDF
              </button>
              <button class="df-action-pill pill-restart" id="df-btn-restart">
                <i class="fas fa-redo"></i> Recomeçar
              </button>
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(this.viewport);

      // Referências internas aos nós
      this.bookStage = this.viewport.querySelector('#df-book-stage');
      this.bookCover = this.viewport.querySelector('#df-book-cover');
      this.lightDot = this.viewport.querySelector('#df-first-light-dot');
      this.lightRipple = this.viewport.querySelector('#df-light-ripple');
      this.flowersContainer = this.viewport.querySelector('#df-flowers-container');
      this.halosGroup = this.viewport.querySelector('#df-halos-group');
      this.tensionLayer = this.viewport.querySelector('#df-tension-layer');
      this.climaxShockwave = this.viewport.querySelector('#df-climax-shockwave');
      this.climaxRing = this.viewport.querySelector('#df-climax-ring');
      this.climaxFlareH = this.viewport.querySelector('#df-climax-flare-h');
      this.climaxFlareV = this.viewport.querySelector('#df-climax-flare-v');
      this.climaxFlash = this.viewport.querySelector('#df-climax-flash');
      this.hbdWrap = this.viewport.querySelector('#df-hbd-reveal-wrap');
      this.creditsScreen = this.viewport.querySelector('#df-credits-screen');

      // Botões dos Créditos
      const btnReopen = this.viewport.querySelector('#df-btn-reopen-book');
      const btnPdf = this.viewport.querySelector('#df-btn-open-pdf');
      const btnRestart = this.viewport.querySelector('#df-btn-restart');

      if (btnReopen) btnReopen.addEventListener('click', () => this.sys.goToChapter(19));
      if (btnPdf) btnPdf.addEventListener('click', () => this.sys.openPdfModal());
      if (btnRestart) btnRestart.addEventListener('click', () => this.sys.openRestartModal());

      // Prepara o sistema de partículas do canvas
      this.initCanvas();

      // Constrói o jardim de flores botânicas em SVG
      this.buildBotanicalFlowers();

      // Dispara a linha do tempo contínua de 30 segundos
      this.startTimeline();
    }

    initCanvas() {
      const canvas = this.viewport.querySelector('#df-particles-canvas');
      if (!canvas) return;
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');

      const updateSize = () => {
        if (!this.viewport || !this.canvas) return;
        this.canvasWidth = this.viewport.clientWidth || 700;
        this.canvasHeight = this.viewport.clientHeight || 550;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
      };
      updateSize();

      // 40 partículas sutis em tons rosados e brancos
      this.canvasParticles = [];
      for (let i = 0; i < 40; i++) {
        this.canvasParticles.push({
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight,
          radius: Math.random() * 2 + 1,
          baseRadius: Math.random() * 2 + 1,
          alpha: Math.random() * 0.7 + 0.2,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          color: Math.random() > 0.3 ? '255, 174, 192' : '255, 255, 255'
        });
      }
    }

    buildBotanicalFlowers() {
      if (!this.flowersContainer) return;
      this.flowersContainer.innerHTML = '';
      this.flowers = [];

      // 28 flores distribuídas em 3 camadas de profundidade
      const flowerCount = 28;
      const depths = ['depth-far', 'depth-mid', 'depth-near'];

      for (let i = 0; i < flowerCount; i++) {
        const depth = depths[i % 3];
        const angleDeg = (i / flowerCount) * 360 + (Math.random() * 25 - 12);
        const distance = depth === 'depth-near' ? (150 + Math.random() * 140) : (depth === 'depth-mid' ? (110 + Math.random() * 120) : (70 + Math.random() * 90));
        const size = depth === 'depth-near' ? 76 : (depth === 'depth-mid' ? 56 : 38);

        const el = document.createElement('div');
        el.className = `df-flower ${depth}`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;

        // SVG puro nativo com 8 pétalas orgânicas curvas e centro brilhante
        const id = `flw-${i}`;
        el.innerHTML = `
          <svg viewBox="-50 -50 100 100" width="100%" height="100%">
            <defs>
              <radialGradient id="${id}-grad" cx="0%" cy="0%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                <stop offset="45%" stop-color="#ffaec0" stop-opacity="0.85" />
                <stop offset="90%" stop-color="#ff6b8b" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#ff6b8b" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="flower-petals-group">
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(0)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(45)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(90)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(135)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(180)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(225)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(270)" />
              <path d="M0 0 C -12 -20, -14 -40, 0 -48 C 14 -40, 12 -20, 0 0" fill="url(#${id}-grad)" transform="rotate(315)" />
            </g>
            <circle cx="0" cy="0" r="7.5" fill="#ffffff" filter="drop-shadow(0 0 5px #ff6b8b)" />
          </svg>
        `;

        this.flowersContainer.appendChild(el);

        this.flowers.push({
          el,
          angleDeg,
          orbitSpeed: (depth === 'depth-near' ? 0.08 : (depth === 'depth-mid' ? -0.06 : 0.04)) * (Math.random() > 0.5 ? 1 : -1),
          distance,
          currentDist: 0,
          scale: 0,
          targetScale: depth === 'depth-near' ? 1.05 : (depth === 'depth-mid' ? 0.85 : 0.6),
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 0.18,
          depth
        });
      }
    }

    startTimeline() {
      this.startTime = performance.now();

      // Dispara fechamento do livro logo nos primeiros 400ms (0s - 4s)
      this.addTimeout(() => {
        if (this.bookCover) {
          this.bookCover.classList.add('is-closed');
        }
      }, 400);

      // 4s: Livro se dissolve suavemente
      this.addTimeout(() => {
        if (this.bookStage) {
          this.bookStage.classList.add('book-dissolve');
        }
      }, 4000);

      // 4.2s: Pulso 1 da Primeira Luz (pequeno halo rosado)
      this.addTimeout(() => {
        if (this.lightDot) {
          this.lightDot.classList.add('pulse-1');
        }
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.playSparkleSound(0.5);
        }
      }, 4200);

      // 5.2s: Pulso 2 (halo maior iluminando a tela)
      this.addTimeout(() => {
        if (this.lightDot) {
          this.lightDot.classList.remove('pulse-1');
          this.lightDot.classList.add('pulse-2');
        }
      }, 5200);

      // 6.2s: Pulso 3 (onda circular que se expande)
      this.addTimeout(() => {
        if (this.lightRipple) {
          this.lightRipple.classList.add('ripple-active');
        }
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.playSparkleSound(0.7);
        }
      }, 6200);

      // 7s: Flores começam a brotar e expandir radialmente
      this.addTimeout(() => {
        this.flowers.forEach((f) => {
          f.el.classList.add('bloomed');
        });
      }, 7000);

      // 15s: O Centro começa a brilhar intensamente (Halos 1, 2, 3 e Anel)
      this.addTimeout(() => {
        if (this.halosGroup) {
          this.halosGroup.classList.add('halos-visible');
        }
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.playSparkleSound(0.9);
        }
      }, 15000);

      // 18s: Momento de Tensão (desaceleração quase parada e lavagem rosada)
      this.addTimeout(() => {
        if (this.tensionLayer) {
          this.tensionLayer.classList.add('tension-active');
        }
      }, 18000);

      // 21s: O GRANDE CLÍMAX
      this.addTimeout(() => {
        if (this.climaxShockwave) this.climaxShockwave.classList.add('fire-climax');
        if (this.climaxRing) this.climaxRing.classList.add('fire-climax');
        if (this.climaxFlareH) this.climaxFlareH.classList.add('fire-climax');
        if (this.climaxFlareV) this.climaxFlareV.classList.add('fire-climax');
        if (this.climaxFlash) this.climaxFlash.classList.add('fire-climax');

        // Confetes delicados na paleta do projeto (rosa, dourado suave, branco)
        if (window.confetti) {
          window.confetti({
            particleCount: 50,
            spread: 80,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ff6b8b', '#ffaec0', '#ffffff', '#ffe6ee', '#ffd1a4']
          });
        }

        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.playSparkleSound(1.2);
        }
      }, 21000);

      // 24s: Revelação com tipografia nobre: FELIZ ANIVERSÁRIO ISSAMARA 18 ANOS
      this.addTimeout(() => {
        if (this.hbdWrap) {
          this.hbdWrap.classList.add('reveal-active');
        }
      }, 24000);

      // 26s: A festa se transforma em calma e paz serena
      this.addTimeout(() => {
        if (this.hbdWrap) {
          this.hbdWrap.classList.add('reveal-fade-calm');
        }
      }, 26500);

      // 27.5s - 29.5s: Transição Serena para os Créditos - flores somem suavemente uma a uma
      this.addTimeout(() => {
        if (this.halosGroup) {
          this.halosGroup.classList.remove('halos-visible');
        }
        if (this.tensionLayer) {
          this.tensionLayer.classList.remove('tension-active');
        }
        if (this.flowers && this.flowers.length) {
          this.flowers.forEach((f, idx) => {
            this.addTimeout(() => {
              if (f.el) f.el.classList.add('flower-fade-out');
            }, idx * 45);
          });
        }
      }, 27500);

      // 30s+: Créditos Finais elegantes e encerramento com fade-out suave do áudio
      this.addTimeout(() => {
        if (this.creditsScreen) {
          this.creditsScreen.classList.add('credits-visible');
        }
        // Encerramento suave do áudio com fade-out gradual e sereno
        if (this.sys && this.sys.audioManager) {
          this.sys.audioManager.fadeTo(0.15, 6000);
        }
      }, 30000);

      // Inicia loop contínuo a 60 FPS
      const loop = (now) => {
        if (this.isDestroyed) return;
        const elapsed = now - this.startTime;

        this.updateFlowers(elapsed);
        this.renderCanvas(elapsed);

        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }

    updateFlowers(elapsed) {
      if (!this.flowers || !this.flowers.length) return;

      // 0s-7s: escondidas
      if (elapsed < 7000) return;

      const centerX = (this.viewport ? this.viewport.clientWidth : 700) / 2;
      const centerY = (this.viewport ? this.viewport.clientHeight : 550) / 2;

      // Fases da dinâmica
      let expansionProgress = 1;
      let speedFactor = 1;

      if (elapsed >= 7000 && elapsed < 11000) {
        // 7s-11s: expansão radial partindo do centro
        expansionProgress = Math.min(1, (elapsed - 7000) / 4000);
      } else if (elapsed >= 18000 && elapsed < 21000) {
        // 18s-21s: desaceleração profunda de tensão
        speedFactor = 0.15;
      } else if (elapsed >= 21000 && elapsed < 23000) {
        // Clímax: impulso radial temporário
        speedFactor = 2.4;
      } else if (elapsed >= 26000) {
        // Calma serena
        speedFactor = 0.25;
      }

      this.flowers.forEach((f) => {
        f.angleDeg += f.orbitSpeed * speedFactor;
        f.rotation += f.rotSpeed * speedFactor;

        // Suave alcance da distância radial
        const targetDist = f.distance * expansionProgress;
        f.currentDist += (targetDist - f.currentDist) * 0.05;

        // Escala
        const curScale = f.targetScale * expansionProgress;

        const rad = (f.angleDeg * Math.PI) / 180;
        const posX = centerX + Math.cos(rad) * f.currentDist - f.el.clientWidth / 2;
        const posY = centerY + Math.sin(rad) * f.currentDist - f.el.clientHeight / 2;

        f.el.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0) scale(${curScale.toFixed(2)}) rotate(${f.rotation.toFixed(1)}deg)`;
      });
    }

    renderCanvas(elapsed) {
      if (!this.canvasCtx || !this.canvas) return;
      const ctx = this.canvasCtx;
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      let speedMod = 1;
      if (elapsed >= 18000 && elapsed < 21000) speedMod = 0.2; // Tensão
      else if (elapsed >= 21000 && elapsed < 24000) speedMod = 2.0; // Clímax
      else if (elapsed >= 26000) speedMod = 0.35; // Calma

      for (let i = 0; i < this.canvasParticles.length; i++) {
        const p = this.canvasParticles[i];
        p.x += p.speedX * speedMod;
        p.y += p.speedY * speedMod;

        // Wrap around
        if (p.x < -10) p.x = this.canvasWidth + 10;
        if (p.x > this.canvasWidth + 10) p.x = -10;
        if (p.y < -10) p.y = this.canvasHeight + 10;
        if (p.y > this.canvasHeight + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.fill();
      }
    }

    addTimeout(fn, delayMs) {
      const id = setTimeout(() => {
        if (!this.isDestroyed) fn();
      }, delayMs);
      this.timeouts.push(id);
      return id;
    }

    destroy() {
      this.isDestroyed = true;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.timeouts.forEach((id) => clearTimeout(id));
      this.timeouts = [];
      if (this.viewport && this.viewport.parentNode) {
        this.viewport.parentNode.removeChild(this.viewport);
      }
    }
  }

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
      this.skipBtn = document.getElementById('btn-cinematic-skip') || document.getElementById('btn-skip-cinematic');
      this.startPromptBtn = document.getElementById('cinematic-start-prompt');
      this.fallingPetal = document.getElementById('cinematic-falling-petal');

      // Elementos do Palco Botânico (SVG)
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
      // Botão discreto de áudio / música no topo
      const audioBtn = document.getElementById('btn-cinematic-audio');
      if (audioBtn) {
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.sys && this.sys.audioManager) {
            if (!this.sys.audioManager.isPlaying) {
              this.sys.audioManager.startExperienceAudio();
            } else {
              this.sys.audioManager.toggleMute();
            }
            this.updateAudioBtnUI();
          }
        });
      }

      // Botão discreto de pular introdução
      const skipButton = document.getElementById('btn-cinematic-skip') || document.getElementById('btn-skip-cinematic');
      if (skipButton) {
        skipButton.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.sys && this.sys.audioManager) {
            this.sys.audioManager.startExperienceAudio();
          }
          this.transitionToBook(true);
        });
      }

      // Botão "Toque para começar a jornada" (após a revelação final de 18 anos)
      if (this.startPromptBtn) {
        this.startPromptBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.transitionToBook(false);
        });
      }

      // Toque em qualquer ponto da tela
      if (this.entryEl) {
        this.entryEl.addEventListener('click', (e) => {
          if (e.target.closest('#cinematic-header-controls')) return;

          // Se áudio estiver bloqueado pelo navegador até o primeiro gesto, desbloqueia suavemente
          if (this.sys && this.sys.audioManager && !this.sys.audioManager.isPlaying) {
            this.sys.audioManager.startExperienceAudio();
            this.updateAudioBtnUI();
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

      window.addEventListener('resize', () => this.resizeCanvas());
    }

    updateAudioBtnUI() {
      const audioIcon = document.getElementById('cinematic-audio-icon');
      const audioLabel = document.getElementById('cinematic-audio-label');
      if (!this.sys || !this.sys.audioManager) return;
      const isMuted = this.sys.audioManager.isMuted || !this.sys.audioManager.isPlaying;
      if (audioIcon) {
        audioIcon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      }
      if (audioLabel) {
        audioLabel.textContent = isMuted ? 'Ativar som' : 'Música';
      }
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
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;
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
  // 5. CORE SYSTEM CONTROLLER
  // ==========================================
  class ExperienceSystem {
    constructor() {
      this.currentChapterIndex = 0;
      this.timer = new TimerManager();
      this.audioManager = new AudioManager();
      this.soundEffects = new SoundEffects();
      this.progressManager = new ProgressManager();
      this.activeBookController = null;
      this.activeAnimController = null;
      this.activeFinaleController = null;
      this.isTransitioningChapter = false;
      this.isPaused = false;
      this.completedChapters = [1];
      this.stage = document.getElementById('stage-wrapper');
      this.tapBar = document.getElementById('bottom-tap-bar');

      this.init();
      // Inicializa o orquestrador da abertura cinematográfica
      this.cinematicIntro = new CinematicEntryController(this);
    }

    init() {
      const saved = this.progressManager.load();
      this.completedChapters = saved.completedChapters || [1];

      this.bindGlobalEvents();
      this.renderChapterListModal();
      this.goToChapter(1, false);
    }

    bindGlobalEvents() {
      // Top Navigation buttons
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      const btnPause = document.getElementById('btn-pause');
      const btnSound = document.getElementById('btn-sound');
      const btnMenu = document.getElementById('btn-menu');
      const chapterBadge = document.getElementById('chapter-badge');

      if (btnPrev) btnPrev.addEventListener('click', () => this.prevChapter());
      if (btnNext) btnNext.addEventListener('click', () => this.nextChapter());
      if (btnPause) btnPause.addEventListener('click', () => this.togglePause());
      if (btnSound) btnSound.addEventListener('click', () => this.openAudioModal());
      if (btnMenu) btnMenu.addEventListener('click', () => this.openChaptersModal());
      if (chapterBadge) chapterBadge.addEventListener('click', () => this.openChaptersModal());

      // Tap prompt on bottom & stage tap
      if (this.tapBar) {
        this.tapBar.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleTapAdvance();
        });
      }

      // Stage click for easy mobile advance
      if (this.stage) {
        this.stage.addEventListener('click', (e) => {
          if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.book-stage')) {
            return;
          }
          this.handleTapAdvance();
        });
      }

      // Audio Modal elements
      const btnCloseAudio = document.getElementById('btn-close-audio-modal');
      const btnConfirmAudio = document.getElementById('btn-confirm-audio-modal');
      const volSlider = document.getElementById('audio-volume-slider');
      const btnToggleMute = document.getElementById('btn-toggle-mute');

      if (btnCloseAudio) btnCloseAudio.addEventListener('click', () => this.closeAudioModal());
      if (btnConfirmAudio) btnConfirmAudio.addEventListener('click', () => this.closeAudioModal());
      if (volSlider) {
        volSlider.addEventListener('input', (e) => {
          this.audioManager.setVolume(parseFloat(e.target.value) / 100);
        });
      }
      if (btnToggleMute) {
        btnToggleMute.addEventListener('click', () => this.audioManager.toggleMute());
      }

      // Chapter Modal close
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

        // Audio fade / level & continuity (sem reiniciar)
        if (autoPlayAudio && this.audioManager && this.audioManager.audio && this.audioManager.audio.paused && !this.audioManager.isMuted) {
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
        this.renderCredits();
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
        if (icon) icon.className = 'fas fa-play text-success';
        if (btn) btn.classList.add('active');
      } else {
        this.timer.resumeAll();
        this.audioManager.play();
        if (icon) icon.className = 'fas fa-pause';
        if (btn) btn.classList.remove('active');
      }
    }

    updateNavbar() {
      const chapter = CHAPTERS[this.currentChapterIndex];
      const badge = document.getElementById('chapter-badge');
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');

      if (badge && chapter) {
        badge.innerText = `Cap. ${chapter.id}/20: ${chapter.title}`;
      }

      if (btnPrev) {
        btnPrev.disabled = this.currentChapterIndex === 0;
      }

      if (btnNext) {
        btnNext.disabled = false;
      }
    }

    restartExperience() {
      this.progressManager.reset();
      this.completedChapters = [1];
      this.goToChapter(1);
    }

    // ==========================================
    // CREDITS VIEW
    // ==========================================
    renderCredits() {
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
      this.isTransitioningChapter = false;

      const badge = document.getElementById('chapter-badge');
      if (badge) badge.innerText = 'Créditos da Experiência';

      const container = document.createElement('div');
      container.className = 'kotak animate__animated animate__fadeIn';
      container.innerHTML = `
        <div class="py-2">
          <div class="mb-3">
            <i class="fas fa-heart text-danger fa-2x animate__animated animate__pulse animate__infinite"></i>
          </div>
          <p class="lead-text font-weight-bold animate__animated animate__fadeIn">
            Uma pequena experiência feita especialmente para Issamara.
          </p>
          <p class="text-muted sub-text animate__animated animate__fadeIn">
            Com carinho e amizade.
          </p>

          <hr class="my-3">

          <small class="text-muted text-uppercase d-block mb-1">Criado por</small>
          <div class="my-2">
            <h3 id="author-name" class="font-weight-bold text-primary animate__animated animate__fadeIn">
              Luis Fernando Santos
            </h3>
          </div>
          <small class="text-muted d-block mb-3">08/09/2026</small>

          <p class="sub-text font-italic text-secondary mt-3">
            «Dando meu melhor para uma pessoa que merece tudo de bom que esse mundo tem.»
          </p>

          <!-- Playful Easter Egg Name Swap from user requirements -->
          <div class="p-2 border rounded bg-light my-3">
            <span class="small text-muted">Assinatura: </span>
            <span id="easter-egg-name" class="font-weight-bold text-danger">LUIS</span>
          </div>

          <div class="mt-4 d-flex justify-content-center gap-2">
            <button id="btn-credits-back" class="btn btn-outline-primary btn-sm mr-2">
              <i class="fas fa-list-ul mr-1"></i> Lista de Capítulos
            </button>
            <button id="btn-credits-pdf" class="btn btn-danger btn-sm">
              <i class="fas fa-file-pdf mr-1"></i> Baixar Carta em PDF
            </button>
          </div>
        </div>
      `;
      this.stage.appendChild(container);

      // Playful Easter egg swap: LUIS -> CRIATURA -> LUIS
      const eeName = document.getElementById('easter-egg-name');
      if (eeName) {
        this.timer.setTimeout(() => {
          eeName.className = 'animate__animated animate__fadeOut font-weight-bold text-warning';
          setTimeout(() => {
            eeName.innerText = 'CRIATURA';
            eeName.className = 'animate__animated animate__fadeIn font-weight-bold text-warning';
          }, 300);
        }, 2200);

        this.timer.setTimeout(() => {
          eeName.className = 'animate__animated animate__fadeOut font-weight-bold text-danger';
          setTimeout(() => {
            eeName.innerText = 'LUIS';
            eeName.className = 'animate__animated animate__fadeIn font-weight-bold text-danger';
          }, 300);
        }, 4400);
      }

      document.getElementById('btn-credits-back').addEventListener('click', () => {
        this.openChaptersModal();
      });
      document.getElementById('btn-credits-pdf').addEventListener('click', () => {
        this.openPdfModal();
      });
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
      this.audioManager.updateUI();
      const m = document.getElementById('modal-audio');
      if (m) m.classList.remove('d-none');
    }

    closeAudioModal() {
      const m = document.getElementById('modal-audio');
      if (m) m.classList.add('d-none');
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
      if (m) m.classList.remove('d-none');
    }

    closePdfModal() {
      const m = document.getElementById('modal-pdf');
      if (m) m.classList.add('d-none');
    }

    // ==========================================
    // PDF GENERATION & PRINTING
    // ==========================================
    printLetter() {
      const content = document.getElementById('pdf-template');
      if (!content) return;
      window.print();
    }

    downloadPdf() {
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
          msg: 'Que este novo ciclo traga horizontes infinitos, conquistas grandiosas, amor sincero e muita luz para a sua vida!'
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
              Que este novo ciclo traga horizontes infinitos, conquistas grandiosas, amor sincero e muita luz para a sua vida!
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
    window.appExperience = new ExperienceSystem();
  });

})();
