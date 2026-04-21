(function() {
    'use strict';

    // Запобігаємо подвійному завантаженню
    if (window.AnimakimaLoaded) return;
    window.AnimakimaLoaded = true;

    const BASE_URL = 'https://animakima.ru';

    // --- Допоміжна функція для запитів ---
    function request(url, callback) {
        if (typeof Lampa.Utils !== 'undefined' && Lampa.Utils.ajax) {
            Lampa.Utils.ajax(url, callback, (err) => {
                console.error('[Animakima] Ajax error:', err);
                callback(null);
            });
        } else {
            fetch(url)
                .then(r => r.text())
                .then(callback)
                .catch(e => {
                    console.error('[Animakima] Fetch error:', e);
                    callback(null);
                });
        }
    }

    // --- Пошук ---
    function search(query, callback) {
        if (!query || query.trim() === '') {
            callback([]);
            return;
        }
        const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
        request(url, (html) => {
            if (!html) {
                callback([]);
                return;
            }
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const results = [];
            // Селектори для пошуку (можна розширити)
            const items = doc.querySelectorAll('.shortStory, .movie-item, .anime-item, .search-item, .item');
            items.forEach(el => {
                const link = el.querySelector('a');
                if (!link) return;
                const href = link.getAttribute('href');
                let title = link.textContent.trim();
                if (!title) title = el.querySelector('.title')?.textContent.trim() || '';
                if (href && title) {
                    let id = href.split('/').filter(Boolean).pop();
                    if (id && !isNaN(id)) id = id; // якщо id числовий
                    results.push({
                        id: id,
                        title: title,
                        poster: null,
                        description: '',
                        source: 'animakima'
                    });
                }
            });
            console.log('[Animakima] Search results:', results.length);
            callback(results);
        });
    }

    // --- Отримання деталей (список серій) ---
    function full(item, callback) {
        if (!item.id) {
            callback(item);
            return;
        }
        const url = `${BASE_URL}/anime/${item.id}`;
        request(url, (html) => {
            if (!html) {
                callback(item);
                return;
            }
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Опис
            const descElem = doc.querySelector('.description, .full-story, .story');
            if (descElem) item.description = descElem.textContent.trim();
            // Серії
            const episodes = [];
            const epLinks = doc.querySelectorAll('.episodes-list a, .series-list a, .episode a');
            epLinks.forEach(link => {
                let epUrl = link.getAttribute('href');
                if (!epUrl) return;
                if (!epUrl.startsWith('http')) epUrl = BASE_URL + epUrl;
                episodes.push({
                    id: epUrl.split('/').filter(Boolean).pop(),
                    title: link.textContent.trim(),
                    url: epUrl
                });
            });
            item.episodes = episodes;
            callback(item);
        });
    }

    // --- Отримання відео для відтворення ---
    function play(item, callback) {
        if (!item.url) {
            callback(null);
            return;
        }
        request(item.url, (html) => {
            if (!html) {
                callback(null);
                return;
            }
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Шукаємо video source
            let videoUrl = doc.querySelector('video source')?.getAttribute('src');
            if (!videoUrl) {
                // Шукаємо iframe
                const iframe = doc.querySelector('iframe');
                if (iframe) videoUrl = iframe.getAttribute('src');
            }
            if (!videoUrl) {
                // Можливо, відео завантажується через JavaScript, але для початку достатньо
                console.warn('[Animakima] Video not found on page:', item.url);
            }
            callback(videoUrl || null);
        });
    }

    // --- Реєстрація джерела ---
    if (typeof Lampa !== 'undefined' && Lampa.Source && Lampa.Source.add) {
        Lampa.Source.add('animakima', {
            title: 'Animakima',
            search: search,
            full: full,
            play: play
        });
        console.log('[Animakima] Джерело успішно зареєстровано через Lampa.Source');
    } else {
        console.error('[Animakima] Не вдалося зареєструвати джерело: Lampa.Source.add не знайдено');
    }
})();
