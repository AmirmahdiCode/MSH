const MUSIC_API = 'https://script.google.com/macros/s/AKfycbypWWml5JQ0CIjurUfrOVRkI5O33d2u3GT-51hzEliYa1JZ8_3oA9Mfh8gNeCDhIvRS/exec';
const MUSIC_KEY = 'heyat_music_state';

class MusicPlayer {
  constructor() {
    this.audio = null;
    this.state = this.loadState();
    this.btn = null;
    this.playlist = [];
    this.currentIndex = -1;
    this.settings = this.getSettings();
    
    this.init();
  }
  
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('shohada-settings')) || {
        musicEnabled: true,
        musicVolume: 50,
        musicList: []
      };
    } catch(e) {
      return { musicEnabled: true, musicVolume: 50, musicList: [] };
    }
  }
  
  async init() {
    await this.loadPlaylist();
    this.createButton();
    
    this.applySettings();
    
    if (this.settings.musicEnabled && this.state.playing) {
      this.resumePlayback();
    }
  }
  
  applySettings() {
    if (this.audio) {
      this.audio.volume = (this.settings.musicVolume || 50) / 100;
      
      if (this.settings.musicEnabled) {
        if (this.audio.paused) {
          this.audio.play().catch(() => {});
        }
      } else {
        this.audio.pause();
      }
    }
    
    this.updateButton();
  }
  
  async loadPlaylist() {
    try {
      const res = await fetch(`${MUSIC_API}?action=getMusic`);
      const raw = await res.json();
      
      let data = [];
      if (Array.isArray(raw)) data = raw;
      else if (raw.success && Array.isArray(raw.data)) data = raw.data;
      else if (raw.data && Array.isArray(raw.data)) data = raw.data;
      
      if (data.length > 0) {
        const selectedList = this.settings.musicList || [];
        
        if (selectedList.length > 0) {
          this.playlist = data
            .map(item => typeof item === 'string' ? item : item.src)
            .filter(src => selectedList.includes(src));
        } else {
          this.playlist = data.map(item => typeof item === 'string' ? item : item.src);
        }
      }
    } catch(e) {}
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
    if (!this.state.src) {
      this.playRandom();
      return;
    }
    
    this.audio = new Audio(this.state.src);
    this.audio.volume = (this.settings.musicVolume || 50) / 100;
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
    
    if (!this.settings.musicEnabled) return;
    
    this.audio = new Audio(src);
    this.audio.volume = (this.settings.musicVolume || 50) / 100;
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
    this.settings = this.getSettings();
    
    if (this.playlist.length === 0) {
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
