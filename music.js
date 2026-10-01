(function(){
  'use strict';

  var STORAGE_KEY = 'shohada-music';
  var PLAYLIST = [
    '../music/1.mp3',
    '../music/2.mp3',
    '../music/3.mp3',
    '../music/4.mp3',
    '../music/5.mp3'
  ];

  var state = {
    enabled: false,
    track: 0,
    time: 0
  };

  try{
    var saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
      var parsed = JSON.parse(saved);
      if(parsed && typeof parsed === 'object'){
        state.enabled = !!parsed.enabled;
        state.track = typeof parsed.track === 'number' ? parsed.track : 0;
        state.time = typeof parsed.time === 'number' ? parsed.time : 0;
      }
    }
  }catch(e){}

  if(state.track < 0 || state.track >= PLAYLIST.length) state.track = 0;

  var audio = new Audio();
  audio.preload = 'auto';
  audio.src = PLAYLIST[state.track];
  audio.loop = false;

  var ready = false;
  var lastSaveTime = 0;
  var seekingApplied = false;

  function save(force){
    try{
      var now = Date.now();
      if(!force && now - lastSaveTime < 400) return;
      lastSaveTime = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        enabled: state.enabled,
        track: state.track,
        time: audio.currentTime || 0
      }));
    }catch(e){}
  }

  function applySeek(){
    if(seekingApplied) return;
    seekingApplied = true;
    if(state.time > 0 && isFinite(state.time)){
      try{
        audio.currentTime = state.time;
      }catch(e){}
    }
  }

  function play(){
    if(!state.enabled) return;
    var p = audio.play();
    if(p && p.catch) p.catch(function(){});
  }

  function pause(){
    try{ audio.pause(); }catch(e){}
  }

  audio.addEventListener('loadedmetadata', function(){
    ready = true;
    applySeek();
    if(state.enabled) play();
  });

  audio.addEventListener('canplay', function(){
    ready = true;
    applySeek();
    if(state.enabled) play();
  });

  audio.addEventListener('timeupdate', function(){
    if(!state.enabled) return;
    save(false);
  });

  audio.addEventListener('ended', function(){
    state.track = (state.track + 1) % PLAYLIST.length;
    state.time = 0;
    seekingApplied = false;
    audio.src = PLAYLIST[state.track];
    try{ audio.currentTime = 0; }catch(e){}
    save(true);
    if(state.enabled) play();
  });

  audio.addEventListener('pause', function(){
    if(state.enabled) save(true);
  });

  window.addEventListener('beforeunload', function(){
    save(true);
  });

  window.addEventListener('pagehide', function(){
    save(true);
  });

  document.addEventListener('visibilitychange', function(){
    if(document.hidden){
      save(true);
    } else {
      if(state.enabled && audio.paused) play();
    }
  });

  setInterval(function(){
    if(state.enabled) save(true);
  }, 2000);

  window.ShohadaMusic = {
    isEnabled: function(){
      return state.enabled;
    },
    toggle: function(){
      state.enabled = !state.enabled;
      if(state.enabled){
        play();
      } else {
        pause();
      }
      save(true);
      return state.enabled;
    },
    getAudio: function(){
      return audio;
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('btnMusic');
    if(!btn) return;

    if(state.enabled){
      btn.classList.add('active');
      play();
    }

    btn.addEventListener('click', function(){
      var on = window.ShohadaMusic.toggle();
      if(on){
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    var unlock = function(){
      if(state.enabled && audio.paused) play();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('touchstart', unlock, {passive:true});
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
  });

})();
