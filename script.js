(function(){
  'use strict';

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

  var btnTheme = document.getElementById('btnTheme');
  var themeIcon = btnTheme.querySelector('i');

  function aemalTheme(t){
    body.setAttribute('data-theme', t);
    if(t === 'dark'){
      taghirIcon(themeIcon, 'fa-solid fa-sun fa-spin');
    } else {
      taghirIcon(themeIcon, 'fa-solid fa-moon fa-flip-360');
    }
  }

  aemalTheme(gereftanTheme());

  btnTheme.addEventListener('click', function(){
    var jadid = gereftanTheme() === 'dark' ? 'light' : 'dark';
    zakhireTheme(jadid);
    aemalTheme(jadid);
  });

  var btnMusic = document.getElementById('btnMusic');
  var musicRooshan = false;

  btnMusic.addEventListener('click', function(){
    musicRooshan = !musicRooshan;
    if(musicRooshan){
      btnMusic.classList.add('active');
    } else {
      btnMusic.classList.remove('active');
    }
  });

  var subProfile = document.getElementById('subProfile');
  if(subProfile){
    subProfile.addEventListener('click', function(){
      var href = subProfile.getAttribute('data-href');
      if(href) window.location.href = href;
    });
  }

  var subNotif = document.getElementById('subNotif');
  if(subNotif){
    subNotif.addEventListener('click', function(){
      var href = subNotif.getAttribute('data-href');
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
