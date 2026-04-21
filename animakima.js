(function() {
    'use strict';

    if (window.animakima_loaded) return;
    window.animakima_loaded = true;

    const BASE_URL = 'https://animakima.ru';

    // Універсальний запит
    function fetchHtml(url, callback) {
        if (Lampa.Api && Lampa.Api.fetch) {
            Lampa.Api.fetch(url, callback, () => callback(null));
        } else if (Lampa.Utils && Lampa.Utils.ajax) {
            Lampa.Utils.ajax(url, callback, () => callback(null));
        } else {
            fetch(url).then(r => r.text()).then(callback).catch(() => callback(null));
        }
    }

    // Пошук
    function search(query, callback) {
        if (!query) return callback([]);
        const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
        fetchHtml(url, (html) => {
            if (!html) return callback([]);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const items = doc.querySelectorAll('.shortStory, .movie-item, .anime-item, .search-result');
            const results = [];
            items.forEach(el => {
                const a = el.querySelector('a');
                if (!a) return;
                const href = a.getAttribute('href');
                let title = a.textContent.trim();
                if (href && title) {
                    let id = href.split('/').filter(Boolean).pop();
                    results.push({ id, title, poster: null, description: '', source: 'animakima' });
                }
            });
            callback(results);
        });
    }

    // Деталі (список серій)
    function full(item, callback) {
        if (!item.id) return callback(item);
        const url = `${BASE_URL}/anime/${item.id}`;
        fetchHtml(url, (html) => {
            if (!html) return callback(item);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const desc = doc.querySelector('.description, .full-story')?.textContent.trim() || '';
            item.description = desc;
            const episodes = [];
            doc.querySelectorAll('.episodes-list a, .series a, .episode a').forEach(link => {
                let epUrl = link.getAttribute('href');
                if (epUrl && !epUrl.startsWith('http')) epUrl = BASE_URL + epUrl;
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

    // Отримання відео
    function play(item, callback) {
        if (!item.url) return callback(null);
        fetchHtml(item.url, (html) => {
            if (!html) return callback(null);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            let video = doc.querySelector('video source')?.getAttribute('src');
            if (!video) video = doc.querySelector('iframe')?.getAttribute('src');
            callback(video || null);
        });
    }

    // Реєстрація джерела
    if (Lampa.Source && Lampa.Source.add) {
        Lampa.Source.add('animakima', { title: 'Animakima', search, full, play });
        console.log('✅ Animakima: джерело зареєстровано через Lampa.Source');
    } else if (Lampa.Api && Lampa.Api.addSource) {
        Lampa.Api.addSource({ title: 'Animakima', value: 'animakima', search, full, play });
        console.log('✅ Animakima: джерело зареєстровано через Lampa.Api');
    } else {
        console.error('❌ Animakima: не вдалося зареєструвати джерело');
    }
})();
