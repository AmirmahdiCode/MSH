const NOTIF_API = 'https://script.google.com/macros/s/AKfycbz0wWRJtCYo-7lyr0zXJm_NyvjA9a7ScXOUDOKJfXMGTatGc3Cze0CBXwoen-VrLqK5/exec';
const NOTIF_KEY = 'heyat_last_notif_id';

if ('serviceWorker' in navigator) {
  const swCode = `
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientsList => {
          for (const client of clientsList) {
            if (client.url.includes('/Notices/') && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/Notices/');
          }
        })
      );
    });
  `;
  
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  
  navigator.serviceWorker.register(swUrl).then(() => {
    setTimeout(requestPermission, 1500);
  }).catch(() => {});
}

async function checkNewNotifications() {
  try {
    const res = await fetch(NOTIF_API + '?action=getActiveAnnouncements');
    const data = await res.json();
    
    if (!data.success || !data.data.length) return;
    
    const lastId = localStorage.getItem(NOTIF_KEY);
    const latest = data.data[0];
    
    if (latest.id !== lastId) {
      if (Notification.permission === 'granted') {
        new Notification('اطلاعیه جدید', {
          body: latest.title,
          icon: 'https://cdn.imgurl.ir/uploads/f57721_InShot_20260714_014548498.png',
          tag: latest.id,
          requireInteraction: true
        });
        
        if (latest.id) {
          localStorage.setItem(NOTIF_KEY, latest.id);
        }
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
