self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalado');
    self.skipWaiting();
  });
  
  self.addEventListener('fetch', (event) => {
    // Mantém o app rodando
  });