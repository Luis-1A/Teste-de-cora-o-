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
      this.isMuted = false;
      this.baseVolume = 0.7;
      this.currentVolume = 0.7;
      this.isPlaying = false;
      this.fadeInterval = null;

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

      this.setupUserUnlock();
    }

    setupUserUnlock() {
      const unlockAudio = () => {
        if (!this.isPlaying && this.audio) {
          const playPromise = this.audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              this.isPlaying = true;
              this.updateUI();
            }).catch(() => {});
          }
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };

      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
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

      // Reproduz som sutil de papel virando
      if (this.soundEffects) {
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

      if (this.soundEffects) {
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

    // Cap 20 - Até qualquer dia
    {
      id: 20,
      title: "Até qualquer dia",
      audioLevel: 0.55,
      render: (stage, sys) => {
        const container = document.createElement('div');
        container.className = 'kotak animate__animated animate__fadeIn';
        container.innerHTML = `
          <div class="py-2">
            <p id="p20_1" class="lead-text animate__animated animate__fadeIn">E é isso.</p>
            <p id="p20_2" class="sub-text d-none animate__animated animate__fadeIn mt-2">
              Espero que você tenha gostado desse pequeno presente.
            </p>
            <p id="p20_3" class="lead-text text-primary d-none animate__animated animate__fadeIn mt-2">
              Aproveita muito seus 18 anos.
            </p>
            <p id="p20_4" class="sub-text d-none animate__animated animate__fadeIn mt-2">
              E espero poder te encontrar novamente algum dia.
            </p>
            <div id="p20_5" class="d-none animate__animated animate__zoomIn my-3">
              <h4 class="text-danger font-weight-bold">Feliz aniversário, Issamara. ❤️</h4>
            </div>
            <p id="p20_6" class="text-muted font-italic d-none animate__animated animate__fadeIn mt-2">
              Até qualquer dia.
            </p>

            <div id="p20_actions" class="d-none animate__animated animate__fadeInUp mt-4">
              <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <button id="btn-show-credits" class="btn btn-outline-info btn-sm mb-2 mb-sm-0 mr-sm-2">
                  <i class="fas fa-info-circle mr-1"></i> Ver Créditos
                </button>
                <button id="btn-reopen-book" class="btn btn-outline-secondary btn-sm mb-2 mb-sm-0 mr-sm-2">
                  <i class="fas fa-book-open mr-1"></i> Ler o Livro
                </button>
                <button id="btn-open-pdf-20" class="btn btn-primary btn-sm mb-2 mb-sm-0 mr-sm-2">
                  <i class="fas fa-file-pdf mr-1"></i> Baixar Carta em PDF
                </button>
                <button id="btn-restart-20" class="btn btn-outline-danger btn-sm">
                  <i class="fas fa-redo mr-1"></i> Recomeçar
                </button>
              </div>
            </div>
          </div>
        `;
        stage.appendChild(container);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_2');
          if (el) el.classList.remove('d-none');
        }, 1200);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_3');
          if (el) el.classList.remove('d-none');
        }, 2400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_4');
          if (el) el.classList.remove('d-none');
        }, 3600);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_5');
          if (el) el.classList.remove('d-none');
        }, 5000);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_6');
          if (el) el.classList.remove('d-none');
        }, 6400);

        sys.timer.setTimeout(() => {
          const el = document.getElementById('p20_actions');
          if (el) el.classList.remove('d-none');

          document.getElementById('btn-show-credits').addEventListener('click', () => {
            sys.renderCredits();
          });
          document.getElementById('btn-reopen-book').addEventListener('click', () => {
            sys.goToChapter(19);
          });
          document.getElementById('btn-open-pdf-20').addEventListener('click', () => {
            sys.openPdfModal();
          });
          document.getElementById('btn-restart-20').addEventListener('click', () => {
            sys.openRestartModal();
          });
        }, 7600);
      }
    }
  ];

  // ==========================================
  // 4.5. CINEMATIC ENTRY CONTROLLER
  // ==========================================
  class CinematicEntryController {
    constructor(experienceSystem) {
      this.sys = experienceSystem;
      this.entryEl = document.getElementById('cinematic-entry');
      this.preloaderEl = document.getElementById('cinematic-preloader');
      this.heroContentEl = document.getElementById('cinematic-hero-content');
      this.focalElementEl = document.getElementById('cinematic-focal-element');
      this.shockwaveEl = document.getElementById('cinematic-shockwave');
      this.flashEl = document.getElementById('cinematic-light-flash');
      this.skipBtn = document.getElementById('btn-skip-intro');

      this.starsFarEl = document.getElementById('cinematic-stars-far');
      this.particlesMidEl = document.getElementById('cinematic-particles-mid');
      this.petalsNearEl = document.getElementById('cinematic-petals-near');

      this.isCompleted = false;
      this.timers = [];

      this.init();
    }

    init() {
      if (!this.entryEl) return;

      // Criação dinâmica de partículas com profundidade em 3 camadas
      this.spawnDepthParticles();

      // Botão discreto para pular introdução
      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.skipIntro();
        });
      }

      // Atalhos de teclado (Esc ou Espaço para pular se desejado)
      window.addEventListener('keydown', (e) => {
        if (!this.isCompleted && (e.key === 'Escape' || e.key === ' ')) {
          this.skipIntro();
        }
      });

      // Executa pré-carregamento elegante de recursos
      this.executePreloadSequence();
    }

    spawnDepthParticles() {
      const isMobile = window.innerWidth <= 768;
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      // Camada distante: estrelas e poeira estelar suave
      if (this.starsFarEl) {
        const countFar = isMobile ? 8 : 20;
        for (let i = 0; i < countFar; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-far';
          p.style.top = `${Math.random() * 95}%`;
          p.style.left = `${Math.random() * 98}%`;
          p.style.animationDelay = `${(Math.random() * 5).toFixed(2)}s`;
          p.style.animationDuration = `${(7 + Math.random() * 6).toFixed(2)}s`;
          this.starsFarEl.appendChild(p);
        }
      }

      // Camada média: orbes dourados translúcidos
      if (this.particlesMidEl) {
        const countMid = isMobile ? 5 : 12;
        for (let i = 0; i < countMid; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-mid';
          p.style.top = `${Math.random() * 90}%`;
          p.style.left = `${Math.random() * 95}%`;
          p.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
          p.style.animationDuration = `${(5 + Math.random() * 4).toFixed(2)}s`;
          this.particlesMidEl.appendChild(p);
        }
      }

      // Camada próxima: pétalas rosé flutuando delicadamente
      if (this.petalsNearEl) {
        const countPetals = isMobile ? 3 : 7;
        for (let i = 0; i < countPetals; i++) {
          const p = document.createElement('div');
          p.className = 'cinematic-particle particle-petal';
          p.style.left = `${(Math.random() * 92 + 4).toFixed(1)}%`;
          p.style.animationDelay = `${(Math.random() * 5).toFixed(2)}s`;
          p.style.animationDuration = `${(7 + Math.random() * 4).toFixed(2)}s`;
          this.petalsNearEl.appendChild(p);
        }
      }
    }

    async executePreloadSequence() {
      const startTime = Date.now();

      // Se usuário prefere movimento reduzido, finaliza rapidamente
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(() => this.finishCinematicSequence(true), 500);
        return;
      }

      const preloadPromises = [];

      // 1. Fontes carregadas
      if (document.fonts && document.fonts.ready) {
        preloadPromises.push(document.fonts.ready);
      }

      // 2. Imagens críticas
      const criticalImages = ['./img/background.jpg', './img/hbd1.png'];
      criticalImages.forEach((src) => {
        preloadPromises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }));
      });

      // 3. Pré-aquecimento do áudio
      if (this.sys && this.sys.audioManager && this.sys.audioManager.audio) {
        try {
          this.sys.audioManager.audio.load();
        } catch (e) {}
      }

      try {
        await Promise.all(preloadPromises);
      } catch (e) {}

      // Mínimo de 380ms para evitar piscadas abruptas
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 380 - elapsed);

      setTimeout(() => {
        if (!this.isCompleted) {
          this.startCinematicTimeline();
        }
      }, remaining);
    }

    startCinematicTimeline() {
      if (this.isCompleted) return;

      // 1. Fade out sutil do indicador de pré-carregamento
      if (this.preloaderEl) {
        this.preloaderEl.classList.add('fade-out');
      }

      // 2. Revela o conteúdo cinematográfico
      const t1 = setTimeout(() => {
        if (this.preloaderEl) this.preloaderEl.style.display = 'none';
        if (this.heroContentEl) this.heroContentEl.classList.remove('d-none');
      }, 350);
      this.timers.push(t1);

      // 3. Aos 2.5s: Momento de impacto ("BOOM" visual elegante)
      // Expansão do medalhão central, ativação da onda de choque suave
      const tBoom = setTimeout(() => {
        if (this.isCompleted) return;
        if (this.focalElementEl) {
          this.focalElementEl.classList.add('element-boom');
        }
        if (this.shockwaveEl) {
          this.shockwaveEl.classList.add('trigger-boom');
        }
        // Fade-in sutil da música se permitido pela política do navegador
        if (this.sys && this.sys.audioManager) {
          try {
            this.sys.audioManager.play();
          } catch (e) {}
        }
      }, 2500);
      this.timers.push(tBoom);

      // 4. Aos 3.0s: Flash de luz suave preenche a tela
      const tFlash = setTimeout(() => {
        if (this.isCompleted) return;
        if (this.flashEl) {
          this.flashEl.classList.add('trigger-flash');
        }
      }, 3000);
      this.timers.push(tFlash);

      // 5. Aos 3.8s: Inicia a dissolução da luz e transição para o livro/palco
      const tTransition = setTimeout(() => {
        if (this.isCompleted) return;
        this.finishCinematicSequence(false);
      }, 3850);
      this.timers.push(tTransition);
    }

    skipIntro() {
      if (this.isCompleted) return;
      this.finishCinematicSequence(true);
    }

    finishCinematicSequence(isInstant = false) {
      if (this.isCompleted) return;
      this.isCompleted = true;

      // Limpa temporizadores pendentes
      this.timers.forEach((t) => clearTimeout(t));
      this.timers = [];

      // Revela a barra de navegação com transição suave
      const navBar = document.getElementById('top-nav-bar');
      if (navBar) {
        navBar.classList.add('nav-reveal-active');
      }

      // Revela o palco principal com escala suave e estabilização de sombra
      const stage = document.getElementById('stage-wrapper');
      if (stage) {
        stage.classList.add('stage-reveal-active');
      }

      // Fade out do overlay de abertura
      if (this.entryEl) {
        this.entryEl.classList.add('fade-out-complete');
        const cleanupDelay = isInstant ? 300 : 1200;
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

        // Audio fade / level
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
  }

  // ==========================================
  // INITIALIZATION ON DOM READY
  // ==========================================
  window.addEventListener('DOMContentLoaded', () => {
    window.appExperience = new ExperienceSystem();
  });

})();
