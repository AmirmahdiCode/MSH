(function(){
  'use strict';

  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  document.addEventListener('dragstart', function(e){ e.preventDefault(); });
  document.addEventListener('copy', function(e){ e.preventDefault(); });
  document.addEventListener('cut', function(e){ e.preventDefault(); });

  var body = document.body;

  function taghirIcon(el, kelas){
    el.className = kelas;
  }

  function gereftanTheme(){
    return localStorage.getItem('shohada-theme') || 'light';
  }

  function zakhireTheme(v){
    localStorage.setItem('shohada-theme', v);
  }

  var subBar = document.getElementById('subBar');
  var btnTheme = document.getElementById('btnTheme');
  var themeIcon = btnTheme ? btnTheme.querySelector('i') : null;
  var themeMsg = btnTheme ? btnTheme.querySelector('.msg') : null;
  var btnMusic = document.getElementById('btnMusic');
  var musicIcon = btnMusic ? btnMusic.querySelector('i') : null;
  var musicMsg = btnMusic ? btnMusic.querySelector('.msg') : null;
  var btnNotif = document.getElementById('btnNotif');

  var expandedTimer = null;
  var musicRooshan = false;

  function aemalTheme(t){
    body.setAttribute('data-theme', t);
    if(t === 'dark'){
      if(themeIcon) taghirIcon(themeIcon, 'fa-solid fa-sun fa-spin');
      if(themeMsg) themeMsg.textContent = 'تم به حالت تاریک تغییر کرد';
    } else {
      if(themeIcon) taghirIcon(themeIcon, 'fa-solid fa-moon fa-flip-360');
      if(themeMsg) themeMsg.textContent = 'تم به حالت روشن تغییر کرد';
    }
  }

  function bazKardan(btn, moddat){
    if(!btn || !subBar) return;
    if(expandedTimer) clearTimeout(expandedTimer);
    subBar.classList.remove('expanded');
    btn.classList.remove('expanded-btn');
    void btn.offsetWidth;
    subBar.classList.add('expanded');
    btn.classList.add('expanded-btn');
    expandedTimer = setTimeout(function(){
      subBar.classList.remove('expanded');
      btn.classList.remove('expanded-btn');
    }, moddat);
  }

  aemalTheme(gereftanTheme());

  if(btnTheme){
    btnTheme.addEventListener('click', function(){
      var jadid = gereftanTheme() === 'dark' ? 'light' : 'dark';
      zakhireTheme(jadid);
      aemalTheme(jadid);
      bazKardan(btnTheme, 3000);
    });
  }

  if(btnMusic){
    btnMusic.addEventListener('click', function(){
      musicRooshan = !musicRooshan;
      if(musicRooshan){
        btnMusic.classList.add('active');
        if(musicMsg) musicMsg.textContent = 'موسیقی فعال شد';
      } else {
        btnMusic.classList.remove('active');
        if(musicMsg) musicMsg.textContent = 'موسیقی غیرفعال شد';
      }
      bazKardan(btnMusic, 3000);
    });
  }

  if(btnNotif){
    btnNotif.addEventListener('click', function(){
      var href = btnNotif.getAttribute('data-href');
      if(href) window.location.href = href;
    });
  }

  var profileBtn = document.getElementById('profileBtn');
  if(profileBtn){
    profileBtn.addEventListener('click', function(){
      var href = profileBtn.getAttribute('data-href');
      if(href) window.location.href = href;
    });
  }

  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item){
    item.addEventListener('click', function(){
      var href = item.getAttribute('data-href');
      if(href){
        window.location.href = href;
        return;
      }
      navItems.forEach(function(n){ n.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  var fasl = localStorage.getItem('shohada-season') || 'normal';
  body.setAttribute('data-season', fasl);

})();
