const NOTIF_API = 'https://script.google.com/macros/s/AKfycbz0wWRJtCYo-7lyr0zXJm_NyvjA9a7ScXOUDOKJfXMGTatGc3Cze0CBXwoen-VrLqK5/exec';
const NOTIF_KEY = 'heyat_last_notif_id';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../sw.js').then(() => {
    setTimeout(requestPermission, 1500);
  }).catch(() => {});
}

async function checkNewNotifications() {
  try {
    const res = await fetch(NOTIF_API + '?action=getActiveAnnouncements');
    const data = await res.json();
    
    if (!data.success || !data.data.length) return;
    
    const lastId = localStorage.getItem(NOTIF_KEY);
    const latest = data.data[data.data.length - 1]; // آخرین اطلاعیه
    
    if (latest.id !== lastId) {
      if (Notification.permission === 'granted') {
        new Notification('اطلاعیه جدید', {
          body: latest.title,
          icon: 'https://cdn.imgurl.ir/uploads/f57721_InShot_20260714_014548498.png',
          tag: latest.id,
          requireInteraction: true
        });
        
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

setInterval(checkNewNotifications, 60000);
