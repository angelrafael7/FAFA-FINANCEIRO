const CACHE_NAME = 'fafa-finance-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.log('[SW] Erro ao criar cache:', err);
            })
    );
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Estratégia de cache: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorar requisições para APIs externas que não queremos cachear
    if (event.request.url.includes('ui-avatars.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta for válida, cachear
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se falhar, tentar buscar do cache
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    // Se não tiver no cache e for uma navegação, retornar página offline
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Aqui você pode implementar sincronização de dados quando voltar online
    console.log('[SW] Sincronizando dados...');
}

// Notificações Push
self.addEventListener('push', (event) => {
    console.log('[SW] Push recebido:', event);
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Nova notificação do FAFA Finance',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data || {},
        actions: [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/icons/action-open.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/icons/action-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'FAFA Finance', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificação clicada:', event.action);
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Mensagens do app
self.addEventListener('message', (event) => {
    console.log('[SW] Mensagem recebida:', event.data);
    
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});

console.log('[SW] Service Worker carregado');