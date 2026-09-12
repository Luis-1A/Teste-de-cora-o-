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

    // Cap 11 - Maracujá
    {
      id: 11,
      title: "Maracujá",
      audioLevel: 0.7,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <div id="maracuja-interactive" class="maracuja-box animate__animated animate__bounce" title="Toque no maracujá!">
              <!-- Custom clean vector maracuja -->
              <svg class="maracuja-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Leaf & Stem -->
                <path d="M 50 16 C 55 8, 68 8, 72 14 C 65 20, 56 18, 50 16 Z" fill="#48bb78" />
                <path d="M 50 20 Q 52 10 50 8" stroke="#38a169" stroke-width="4" fill="none" stroke-linecap="round" />
                <!-- Fruit Body -->
                <ellipse cx="50" cy="56" rx="36" ry="34" fill="#ECC94B" stroke="#D69E2E" stroke-width="3" />
                <!-- Highlights & texture spots -->
                <circle cx="38" cy="48" r="3" fill="#D69E2E" opacity="0.6"/>
                <circle cx="58" cy="52" r="3" fill="#D69E2E" opacity="0.6"/>
                <circle cx="48" cy="66" r="3.5" fill="#D69E2E" opacity="0.6"/>
                <circle cx="62" cy="68" r="2.5" fill="#D69E2E" opacity="0.6"/>
                <circle cx="35" cy="62" r="2.5" fill="#D69E2E" opacity="0.6"/>
                <!-- Cut pulp glimpse / cheerful expression -->
                <ellipse cx="50" cy="56" rx="20" ry="18" fill="#F6E05E" stroke="#DD6B20" stroke-dasharray="3 2" />
                <circle cx="45" cy="53" r="2" fill="#2D3748" />
                <circle cx="55" cy="53" r="2" fill="#2D3748" />
                <circle cx="50" cy="60" r="2.5" fill="#2D3748" />
                <path d="M 44 60 Q 50 64 56 60" stroke="#DD6B20" stroke-width="2" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="small text-muted font-italic mb-2">(Toque no maracujá!)</p>
            <p id="p11_1" class="lead-text font-weight-bold animate__animated animate__fadeIn">Sim.</p>
            <p id="p11_2" class="sub-text d-none animate__animated animate__fadeIn">Eu coloquei um maracujá aqui.</p>
            <p id="p11_3" class="lead-text text-primary d-none animate__animated animate__fadeIn">Você sabe exatamente o motivo.</p>
            <p id="p11_4" class="font-italic text-danger d-none animate__animated animate__fadeIn mt-2">E não vou explicar. 😂</p>
          </div>
        `;
        stage.appendChild(container);

        const maracuja = document.getElementById('maracuja-interactive');
        if (maracuja) {
          maracuja.addEventListener('click', () => {
            maracuja.classList.remove('animate__bounce');
            void maracuja.offsetWidth; // trigger reflow
            maracuja.classList.add('animate__rubberBand');
            if (window.confetti) {
              window.confetti({
                particleCount: 25,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#ECC94B', '#F6E05E', '#48BB78', '#DD6B20']
              });
            }
          });
        }

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_2');
          if (el) el.classList.remove('d-none');
        }, 1400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_3');
          if (el) el.classList.remove('d-none');
        }, 2800);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p11_4');
          if (el) el.classList.remove('d-none');
          sys.showTapPrompt();
        }, 4200);
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

    // Cap 17
    {
      id: 17,
      title: "A festa começa",
      audioLevel: 0.9,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-3">
            <div class="mb-3">
              <span style="font-size: 50px;">🎈 🎊 🎈</span>
            </div>
            <h3 class="bday-title animate__animated animate__fadeIn">
              Porque aniversário sem festa não tem a mesma graça. 🎉
            </h3>
            <p class="text-muted mt-3">Segura que agora começou!</p>
          </div>
        `;
        stage.appendChild(container);

        // Music continues high
        sys.audioManager.fadeTo(0.9, 1500);

        // Initial celebration confetti burst
        if (window.confetti) {
          window.confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.6 }
          });
        }

        sys.timer.setTimeout(() => {
          sys.showTapPrompt();
        }, 2200);
      }
    },

    // Cap 18 - Grand Climax: FELIZ ANIVERSÁRIO
    {
      id: 18,
      title: "Feliz Aniversário!",
      audioLevel: 1.0,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'chapter-stage animate__animated animate__fadeIn text-center w-100';
        container.innerHTML = `
          <div id="c18_step1" class="kotak animate__animated animate__zoomIn">
            <div class="display-18">18</div>
          </div>
          <div id="c18_step2" class="kotak d-none animate__animated animate__bounceIn">
            <h2 class="display-4 font-weight-bold text-danger">18 ANOS</h2>
          </div>
          <div id="c18_step3" class="kotak d-none animate__animated animate__zoomIn">
            <h1 class="bday-title text-primary" style="font-size: 42px;">FELIZ ANIVERSÁRIO</h1>
          </div>
          <div id="c18_step4" class="kotak d-none animate__animated animate__tada">
            <img src="./img/hbd1.png" class="img mb-2" alt="Parabéns">
            <div class="bday-name display-4" style="font-size: 44px;">ISSAMARA 🎉</div>
            <p class="lead-text mt-3 text-dark">Que seu dia e seus 18 anos sejam incríveis!</p>
          </div>
        `;
        stage.appendChild(container);

        sys.audioManager.fadeTo(1.0, 1000);

        // Sequence of reveals
        sys.timer.setTimeout(() => {
          const s1 = document.getElementById('c18_step1');
          const s2 = document.getElementById('c18_step2');
          if (s1) s1.classList.add('d-none');
          if (s2) s2.classList.remove('d-none');
          if (window.confetti) {
            window.confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
          }
        }, 1400);

        sys.timer.setTimeout(() => {
          const s2 = document.getElementById('c18_step2');
          const s3 = document.getElementById('c18_step3');
          if (s2) s2.classList.add('d-none');
          if (s3) s3.classList.remove('d-none');
          if (window.confetti) {
            window.confetti({ particleCount: 70, spread: 90, origin: { y: 0.5 } });
          }
        }, 2800);

        sys.timer.setTimeout(() => {
          const s3 = document.getElementById('c18_step3');
          const s4 = document.getElementById('c18_step4');
          if (s3) s3.classList.add('d-none');
          if (s4) s4.classList.remove('d-none');

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
  // 4.5. CINEMATIC ENTRY CONTROLLER (45s State-Based Orchestrator)
  // ==========================================================================
  class CinematicEntryController {
    constructor(experienceSystem) {
      this.sys = experienceSystem;

      // Elementos do DOM
      this.entryEl = document.getElementById('cinematic-entry');
      this.cameraEl = document.getElementById('cinematic-camera');
      this.bgEl = document.getElementById('cinematic-bg');
      this.starsFarEl = document.getElementById('cinematic-stars-far');
      this.particlesMidEl = document.getElementById('cinematic-particles-mid');
      this.petalsNearEl = document.getElementById('cinematic-petals-near');
      this.canvasEl = document.getElementById('cinematic-canvas');
      this.centralLightEl = document.getElementById('cinematic-central-light');
      this.focalElementEl = document.getElementById('cinematic-focal-element');
      this.narrativeLayerEl = document.getElementById('cinematic-narrative-layer');
      this.phrase1El = document.getElementById('cinematic-phrase-1');
      this.phrase2El = document.getElementById('cinematic-phrase-2');
      this.nameWrapEl = document.getElementById('cinematic-name-wrap');
      this.climaxContainerEl = document.getElementById('climax-light-container');
      this.startPromptBtn = document.getElementById('cinematic-start-prompt') || document.getElementById('btn-cinematic-start-reading');

      // Estado e Motor de Timeline
      this.isCompleted = false;
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

      // Definição da Linha do Tempo Poética de 45 Segundos (Sem o livro na abertura - o livro brilha no Cap. 19)
      // Progressão: Escuridão → Descoberta → Curiosidade → Mensagem → Expectativa → Clímax → Resplendor → Toque
      this.timelineEvents = [
        { time: 0, state: 'INTRO', action: () => this.enterIntro() },
        { time: 3000, state: 'FIRST_LIGHT', action: () => this.enterFirstLight() },
        { time: 7000, state: 'ATMOSPHERE', action: () => this.enterAtmosphere() },
        { time: 12000, state: 'CENTRAL_REVEAL', action: () => this.enterCentralReveal() },
        { time: 16000, state: 'CENTRAL_DETAIL', action: () => this.enterCentralDetail() },
        { time: 19500, state: 'TEXT_ONE', action: () => this.enterTextOne() },
        { time: 23500, state: 'PAUSE_ONE', action: () => this.enterPauseOne() },
        { time: 24800, state: 'TEXT_TWO', action: () => this.enterTextTwo() },
        { time: 28000, state: 'NAME_REVEAL', action: () => this.enterNameReveal() },
        { time: 31500, state: 'BUILDUP', action: () => this.enterBuildup() },
        { time: 34500, state: 'ENERGY_CONCENTRATE', action: () => this.enterEnergyConcentrate() },
        { time: 36000, state: 'CLIMAX', action: () => this.enterClimax() },
        { time: 38500, state: 'LIGHT_TRANSITION', action: () => this.enterLightTransition() },
        { time: 40500, state: 'CELEBRATION_GLOW', action: () => this.enterCelebrationGlow() },
        { time: 43000, state: 'PROMPT_READY', action: () => this.enterPromptReady() }
      ];

      this.init();
    }

    init() {
      if (!this.entryEl) return;

      // Suporte a Preferência de Movimento Reduzido (Acessibilidade)
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        this.finishCinematicSequence(true);
        return;
      }

      // 1. Gera camadas estelares estáticas e pétalas CSS
      this.spawnDepthParticles();

      // 2. Inicializa canvas interativo de partículas
      this.initCanvasParticleSystem();

      // 3. Vincula eventos de interação e botão de pular
      this.bindControls();

      // 4. Inicia pré-carregamento suave e motor de timeline contínuo
      this.startSequence();
    }

    bindControls() {
      // Botão "Toque para começar"
      if (this.startPromptBtn) {
        this.startPromptBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finishCinematicSequence(false);
        });
      }

      // Toque em qualquer lugar da tela após o clímax/brilho
      if (this.entryEl) {
        this.entryEl.addEventListener('click', () => {
          if (this.currentState === 'CELEBRATION_GLOW' || this.currentState === 'PROMPT_READY') {
            this.finishCinematicSequence(false);
          }
        });
      }

      // Redimensionamento responsivo do Canvas
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    spawnDepthParticles() {
      const isMobile = window.innerWidth <= 768;

      // Camada Distante: estrelas suaves e poeira cósmica
      if (this.starsFarEl) {
        const countFar = isMobile ? 12 : 24;
        for (let i = 0; i < countFar; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-far';
          p.style.top = `${Math.random() * 96}%`;
          p.style.left = `${Math.random() * 98}%`;
          p.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
          p.style.animationDuration = `${(8 + Math.random() * 6).toFixed(2)}s`;
          this.starsFarEl.appendChild(p);
        }
      }

      // Camada Média: orbes dourados tênues
      if (this.particlesMidEl) {
        const countMid = isMobile ? 6 : 14;
        for (let i = 0; i < countMid; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-mid';
          p.style.top = `${Math.random() * 92}%`;
          p.style.left = `${Math.random() * 96}%`;
          p.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
          p.style.animationDuration = `${(6 + Math.random() * 4).toFixed(2)}s`;
          this.particlesMidEl.appendChild(p);
        }
      }

      // Camada Próxima: pétalas rosé flutuando delicadamente
      if (this.petalsNearEl) {
        const countPetals = isMobile ? 4 : 8;
        for (let i = 0; i < countPetals; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-petal';
          p.style.left = `${(Math.random() * 90 + 5).toFixed(1)}%`;
          p.style.animationDelay = `${(Math.random() * 7).toFixed(2)}s`;
          p.style.animationDuration = `${(8 + Math.random() * 4).toFixed(2)}s`;
          this.petalsNearEl.appendChild(p);
        }
      }
    }

    initCanvasParticleSystem() {
      if (!this.canvasEl) return;
      this.canvasCtx = this.canvasEl.getContext('2d');
      this.resizeCanvas();

      const particleCount = window.innerWidth <= 768 ? 22 : 45;
      this.canvasParticles = [];
      for (let i = 0; i < particleCount; i++) {
        this.canvasParticles.push({
          x: Math.random() * this.canvasWidth,
          y: Math.random() * this.canvasHeight,
          radius: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.6 + 0.2,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.35,
          angle: Math.random() * Math.PI * 2,
          angularSpeed: (Math.random() - 0.5) * 0.015,
          color: Math.random() > 0.4 ? '255, 215, 140' : '255, 180, 205'
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

      // Modificadores de dinâmica por fase
      let attraction = 0;
      let burst = 0;
      if (state === 'BUILDUP' || state === 'ENERGY_CONCENTRATE') {
        attraction = state === 'ENERGY_CONCENTRATE' ? 0.025 : 0.008;
      } else if (state === 'CLIMAX') {
        burst = 1.6;
      }

      for (let i = 0; i < this.canvasParticles.length; i++) {
        const p = this.canvasParticles[i];

        if (burst > 0) {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          p.x += (dx / dist) * (burst * (p.radius + 1.2));
          p.y += (dy / dist) * (burst * (p.radius + 1.2));
        } else if (attraction > 0) {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          p.x += dx * attraction;
          p.y += dy * attraction;
          // Órbita espiral
          p.angle += p.angularSpeed * 2.5;
          p.x += Math.cos(p.angle) * 0.6;
          p.y += Math.sin(p.angle) * 0.6;
        } else {
          p.x += p.speedX;
          p.y += p.speedY;
        }

        // Reposicionamento cíclico nas bordas
        if (p.x < -10) p.x = this.canvasWidth + 10;
        if (p.x > this.canvasWidth + 10) p.x = -10;
        if (p.y < -10) p.y = this.canvasHeight + 10;
        if (p.y > this.canvasHeight + 10) p.y = -10;

        // Pulsação suave de brilho
        const pulse = Math.sin((elapsedMs * 0.002) + i) * 0.2;
        const currentAlpha = Math.max(0.08, Math.min(0.9, p.alpha + pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
    }

    startSequence() {
      this.startTime = performance.now();

      // Inicia reprodução sutil de áudio
      if (this.sys && this.sys.audioManager) {
        try {
          this.sys.audioManager.currentVolume = 0.05;
          this.sys.audioManager.play();
        } catch (e) {}
      }

      // Loop contínuo com requestAnimationFrame
      const tick = (now) => {
        if (this.isCompleted) return;

        const elapsed = now - this.startTime;

        // Dispara eventos da timeline no momento exato
        for (let i = 0; i < this.timelineEvents.length; i++) {
          const ev = this.timelineEvents[i];
          if (elapsed >= ev.time && !this.executedEventIndices.has(i)) {
            this.executedEventIndices.add(i);
            this.currentState = ev.state;
            ev.action();
          }
        }

        // Câmera contínua: respiração sutil e rotação suave
        this.updateContinuousCamera(elapsed);

        // Renderização contínua das partículas do Canvas
        this.renderCanvasParticles(this.currentState, elapsed);

        // Continua o loop até ser completado ou após 45s
        this.animationFrameId = requestAnimationFrame(tick);
      };

      this.animationFrameId = requestAnimationFrame(tick);
    }

    updateContinuousCamera(elapsed) {
      if (!this.cameraEl) return;

      // Leve oscilação de rotação (0.3 graus) e translação para vida contínua
      const driftRot = Math.sin(elapsed * 0.00035) * 0.25;
      const driftY = Math.cos(elapsed * 0.0004) * 3;

      let baseScale = 1.0;
      if (this.currentState === 'ATMOSPHERE') baseScale = 1.02;
      else if (this.currentState === 'CENTRAL_REVEAL' || this.currentState === 'CENTRAL_DETAIL') baseScale = 1.04;
      else if (this.currentState === 'TEXT_ONE' || this.currentState === 'TEXT_TWO') baseScale = 1.05;
      else if (this.currentState === 'NAME_REVEAL') baseScale = 1.06;
      else if (this.currentState === 'BUILDUP') baseScale = 1.08;
      else if (this.currentState === 'ENERGY_CONCENTRATE') baseScale = 1.12;
      else if (this.currentState === 'CLIMAX') baseScale = 1.15;
      else if (this.currentState === 'BOOK_APPROACH' || this.currentState === 'BOOK_OPEN' || this.currentState === 'FIRST_PAGE') baseScale = 1.05;

      this.entryEl.style.setProperty('--camera-scale', baseScale.toString());
      this.entryEl.style.setProperty('--camera-rot', `${driftRot.toFixed(2)}deg`);
      this.entryEl.style.setProperty('--camera-y', `${driftY.toFixed(1)}px`);
    }

    setDomState(stateClass) {
      if (!this.entryEl) return;
      // Remove classes de estado anteriores
      const currentClasses = Array.from(this.entryEl.classList).filter(c => c.startsWith('state-'));
      currentClasses.forEach(c => this.entryEl.classList.remove(c));
      this.entryEl.classList.add(stateClass);
    }

    // ------------------------------------------------------------------------
    // MÉTODOS DE CADA FASE DA LINHA DO TEMPO
    // ------------------------------------------------------------------------

    enterIntro() {
      // 0s - 3s: Escuridão profunda e atmosfera estelar sutil
      this.setDomState('state-intro');
      this.entryEl.style.setProperty('--light-intensity', '0.08');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.12, 2800);
      }
    }

    enterFirstLight() {
      // 3s - 7s: Primeiro pulso de luz cálida no centro
      this.setDomState('state-first-light');
      this.entryEl.style.setProperty('--light-intensity', '0.18');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.22, 3500);
      }
    }

    enterAtmosphere() {
      // 7s - 12s: Atmosfera expande, orbes dourados começam a se reunir
      this.setDomState('state-atmosphere');
      this.entryEl.style.setProperty('--light-intensity', '0.28');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.32, 4500);
      }
    }

    enterCentralReveal() {
      // 12s - 16s: O medalhão astral dos 18 anos emerge suavemente da luz
      this.setDomState('state-central-reveal');
      this.entryEl.style.setProperty('--light-intensity', '0.36');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.40, 3500);
        // Efeito sonoro discreto de 'brilho' sincronizado com o surgimento do elemento central
        this.sys.audioManager.playSparkleSound(1.0);
      }
    }

    enterCentralDetail() {
      // 16s - 19.5s: Detalhes dourados cintilam sobre o medalhão
      this.setDomState('state-central-detail');
      this.entryEl.style.setProperty('--light-intensity', '0.42');
      if (this.sys && this.sys.audioManager) {
        // Cintilação suave complementar na passagem do brilho dourado
        this.sys.audioManager.playSparkleSound(0.75);
      }
    }

    enterTextOne() {
      // 19.5s - 23.5s: Primeira frase surge gradualmente em fade-in suave
      this.setDomState('state-text-one');
      this.entryEl.style.setProperty('--light-intensity', '0.38');
      if (this.phrase1El) {
        this.phrase1El.classList.remove('phrase-fading');
        this.phrase1El.classList.add('phrase-visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.45, 3000);
      }
    }

    enterPauseOne() {
      // 23.5s - 24.8s: Pequena pausa poética para absorção da mensagem
      this.setDomState('state-pause-one');
    }

    enterTextTwo() {
      // 24.8s - 28s: Transição gradual - primeira frase desvanece e a segunda surge suavemente
      this.setDomState('state-text-two');
      this.entryEl.style.setProperty('--light-intensity', '0.42');
      if (this.phrase1El) {
        this.phrase1El.classList.remove('phrase-visible');
        this.phrase1El.classList.add('phrase-fading');
      }
      if (this.phrase2El) {
        this.phrase2El.classList.remove('phrase-fading');
        this.phrase2El.classList.add('phrase-visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.50, 3000);
      }
    }

    enterNameReveal() {
      // 28s - 31.5s: Segunda frase desvanece e o nome ISSAMARA surge com halo luminoso
      this.setDomState('state-name-reveal');
      this.entryEl.style.setProperty('--light-intensity', '0.52');
      if (this.phrase2El) {
        this.phrase2El.classList.remove('phrase-visible');
        this.phrase2El.classList.add('phrase-fading');
      }
      const nameWrap = document.querySelector('.cinematic-name-wrap');
      if (nameWrap) {
        nameWrap.classList.add('name-visible');
      }
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.58, 3000);
        this.sys.audioManager.playSparkleSound(1.0);
      }
    }

    enterBuildup() {
      // 31.5s - 34.5s: Aceleração suave e crescente de energia e expectativa
      this.setDomState('state-buildup');
      this.entryEl.style.setProperty('--light-intensity', '0.65');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.68, 2800);
      }
    }

    enterEnergyConcentrate() {
      // 34.5s - 36s: Luz e partículas convergem para o ponto focal
      this.setDomState('state-energy-concentrate');
      this.entryEl.style.setProperty('--light-intensity', '0.80');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.75, 1400);
      }
    }

    enterClimax() {
      // 36s - 38.5s: CLÍMAX! Três camadas de luz radiante e acolhedora
      this.setDomState('state-climax');
      if (this.climaxContainerEl) {
        this.climaxContainerEl.classList.add('climax-active');
      }
      this.entryEl.style.setProperty('--light-intensity', '1.0');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.80, 1500);
      }
    }

    enterLightTransition() {
      // 38.5s - 40.5s: A luz radiante se dissipa em névoa dourada acolhedora
      this.setDomState('state-light-transition');
      this.entryEl.style.setProperty('--light-intensity', '0.65');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.60, 1200);
      }
    }

    enterCelebrationGlow() {
      // 40.5s - 43s: Resplendor comemorativo de 18 anos e tributo à Issamara
      this.setDomState('state-celebration-glow');
      this.entryEl.style.setProperty('--light-intensity', '0.50');
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.playSparkleSound(0.9);
      }
    }

    enterPromptReady() {
      // 43s - 45s+: Botão pulsante acolhedor pronto para tocar e começar a jornada
      this.setDomState('state-prompt-ready');
      if (this.startPromptBtn) {
        this.startPromptBtn.classList.add('prompt-visible');
      }
    }

    // ------------------------------------------------------------------------
    // FINALIZAÇÃO E TRANSIÇÃO SUAVE PARA O LIVRO PRINCIPAL
    // ------------------------------------------------------------------------

    skipIntro() {
      if (this.isCompleted) return;
      this.finishCinematicSequence(true);
    }

    finishCinematicSequence(isInstant = false) {
      if (this.isCompleted) return;
      this.isCompleted = true;

      // Interrompe o loop de animação
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Remove listener de teclado
      if (this.handleKeydown) {
        window.removeEventListener('keydown', this.handleKeydown);
      }

      // Garante volume confortável do áudio para leitura
      if (this.sys && this.sys.audioManager) {
        this.sys.audioManager.fadeTo(0.50, 800);
      }

      // Revela a barra de navegação superior com transição suave
      const navBar = document.getElementById('top-nav-bar');
      if (navBar) {
        navBar.classList.add('nav-reveal-active');
      }

      // Revela o palco principal do livro com escala suave
      const stage = document.getElementById('stage-wrapper');
      if (stage) {
        stage.classList.add('stage-reveal-active');
      }

      // Transição de fade-out do overlay de abertura
      if (this.entryEl) {
        this.entryEl.classList.add('fade-out-complete');
        const cleanupDelay = isInstant ? 300 : 1100;
        setTimeout(() => {
          if (this.entryEl) {
            this.entryEl.style.display = 'none';
          }
        }, cleanupDelay);
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
          if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.maracuja-box') || e.target.closest('.book-stage')) {
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

      // Gatilho oficial da tela inicial de interação ("Toque para começar")
      const startOverlay = document.getElementById('initial-start-overlay');
      const btnInitialStart = document.getElementById('btn-initial-start');

      if (btnInitialStart) {
        const handleStartExperience = (e) => {
          if (e) e.stopPropagation();
          // 1. Inicia áudio global com monokrom.mp3 (instância única contínua)
          this.audioManager.startExperienceAudio();
          // 2. Remove o overlay inicial com transição suave
          if (startOverlay) {
            startOverlay.classList.add('overlay-hidden');
            setTimeout(() => {
              if (startOverlay.parentNode) {
                startOverlay.style.display = 'none';
              }
            }, 900);
          }
          // 3. Garante que o controlador cinematográfico continue em sincronia perfeita
          if (this.cinematicIntro && !this.cinematicIntro.isCompleted) {
            this.cinematicIntro.startSequence();
          }
        };

        btnInitialStart.addEventListener('click', handleStartExperience);
        btnInitialStart.addEventListener('touchstart', handleStartExperience, { passive: true });
        if (startOverlay) {
          startOverlay.addEventListener('click', handleStartExperience);
        }
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
