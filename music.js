// Music Player - Shared across all pages
const MUSIC_API = 'https://script.google.com/macros/s/AKfycbyW1IvZYTXVsD9-D_j2O9J_jU0qdUPcVcvQrjpqyQinXRF31VvWDkOhHiwrPME1Hs6G/exec';
const MUSIC_KEY = 'heyat_music_state';

class MusicPlayer {
  constructor() {
    this.audio = null;
    this.state = this.loadState();
    this.btn = null;
    this.playlist = [];
    this.currentIndex = -1;
    
    this.init();
  }
  
  async init() {
    await this.loadPlaylist();
    this.createButton();
    
    if (this.state.playing) {
      this.resumePlayback();
    }
  }
  
  async loadPlaylist() {
    try {
      const res = await fetch(`${MUSIC_API}?action=getMusicList`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        this.playlist = data.data.map(item => item.src);
      }
    } catch(e) {
      console.log('خطا در دریافت لیست مداحی');
    }
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem(MUSIC_KEY);
      return saved ? JSON.parse(saved) : { playing: false, src: '', time: 0 };
    } catch(e) {
      return { playing: false, src: '', time: 0 };
    }
  }
  
  saveState() {
    localStorage.setItem(MUSIC_KEY, JSON.stringify({
      playing: !this.audio?.paused,
      src: this.audio?.src || this.state.src,
      time: this.audio?.currentTime || 0
    }));
  }
  
  resumePlayback() {
    if (!this.state.src) return;
    
    this.audio = new Audio(this.state.src);
    this.audio.volume = 0.5;
    this.audio.currentTime = this.state.time || 0;
    
    this.audio.play().catch(() => {
      this.state.playing = false;
      this.saveState();
      this.updateButton();
    });
    
    this.updateButton();
    
    this.audio.addEventListener('timeupdate', () => this.saveState());
    this.audio.addEventListener('ended', () => this.playNext());
  }
  
  play(src) {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    this.audio = new Audio(src);
    this.audio.volume = 0.5;
    this.state.src = src;
    this.state.playing = true;
    
    this.audio.play().catch(() => {});
    this.updateButton();
    this.saveState();
    
    this.audio.addEventListener('timeupdate', () => this.saveState());
    this.audio.addEventListener('ended', () => this.playNext());
  }
  
  playRandom() {
    if (this.playlist.length === 0) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.playlist.length);
    } while (randomIndex === this.currentIndex && this.playlist.length > 1);
    
    this.currentIndex = randomIndex;
    this.play(this.playlist[randomIndex]);
  }
  
  playNext() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.play(this.playlist[this.currentIndex]);
  }
  
  toggle() {
    if (this.playlist.length === 0) {
      // لود مجدد لیست
      this.loadPlaylist().then(() => {
        if (this.playlist.length > 0) this.playRandom();
      });
      return;
    }
    
    if (!this.audio || this.audio.paused) {
      if (this.state.src) {
        this.resumePlayback();
        this.state.playing = true;
        this.saveState();
      } else {
        this.playRandom();
      }
    } else {
      this.audio.pause();
      this.state.playing = false;
      this.saveState();
      this.updateButton();
    }
  }
  
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.state.playing = false;
    this.saveState();
    this.updateButton();
  }
  
  createButton() {
    if (document.getElementById('musicToggle')) return;
    
    const headerBtns = document.querySelector('.header-btns');
    if (!headerBtns) return;
    
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'musicToggle';
    btn.title = 'پخش مداحی';
    btn.innerHTML = '<i class="fa-solid fa-music"></i>';
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });
    
    headerBtns.insertBefore(btn, headerBtns.firstChild);
    this.btn = btn;
    this.updateButton();
  }
  
  updateButton() {
    if (!this.btn) return;
    
    const isPlaying = this.audio && !this.audio.paused;
    if (isPlaying) {
      this.btn.style.background = 'var(--primary)';
      this.btn.style.color = '#fff';
    } else {
      this.btn.style.background = 'var(--bg2)';
      this.btn.style.color = 'var(--text)';
    }
  }
}

const musicPlayer = new MusicPlayer();
