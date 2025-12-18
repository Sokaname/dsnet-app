self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Nova Mensagem', body: 'Alguém enviou algo no Dsnet!' };
  
    const options = {
      body: data.body,
      icon: '/icon-512.png',
      badge: '/icon-512.png', // Ícone pequeno que aparece na barra de cima
      vibrate: [100, 50, 100],
      data: {
        url: '/' // Para onde o utilizador vai quando clicar
      }
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  // Faz o app abrir quando clicar na notificação
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  });