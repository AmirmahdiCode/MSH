const NOTIF_API = 'https://script.google.com/macros/s/AKfycbypWWml5JQ0CIjurUfrOVRkI5O33d2u3GT-51hzEliYa1JZ8_3oA9Mfh8gNeCDhIvRS/exec';
const NOTIF_KEY = 'heyat_last_notif_id';

async function checkNewNotifications() {
  try {
    const res = await fetch(NOTIF_API + '?action=getActiveAnnouncements');
    const data = await res.json();
    
    let announcements = [];
    if (Array.isArray(data)) announcements = data;
    else if (data.success && Array.isArray(data.data)) announcements = data.data;
    else if (data.data && Array.isArray(data.data)) announcements = data.data;
    
    if (!announcements.length) return;
    
    const lastId = localStorage.getItem(NOTIF_KEY);
    const latest = announcements[announcements.length - 1];
    
    if (latest.id !== lastId) {
      if (Notification.permission === 'granted') {
        try {
          new Notification('اطلاعیه جدید', {
            body: latest.title,
            icon: 'https://cdn.imgurl.ir/uploads/f57721_InShot_20260714_014548498.png',
            tag: String(latest.id)
          });
        } catch(e) {}
        
        localStorage.setItem(NOTIF_KEY, latest.id);
      }
    }
  } catch(e) {}
}

function requestPermission() {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') checkNewNotifications();
    });
  } else if (Notification.permission === 'granted') {
    checkNewNotifications();
  }
}

if ('serviceWorker' in navigator) {
  fetch('../sw.js', { method: 'HEAD' })
    .then(() => {
      navigator.serviceWorker.register('../sw.js')
        .then(() => {
          setTimeout(requestPermission, 1500);
        })
        .catch(() => {
          setTimeout(requestPermission, 1500);
        });
    })
    .catch(() => {
      setTimeout(requestPermission, 1500);
    });
} else {
  setTimeout(requestPermission, 1500);
}

setInterval(checkNewNotifications, 60000);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(requestPermission, 2000);
});
