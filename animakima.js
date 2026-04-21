(function () {
    'use strict';

    if (window.animakima_plugin_loaded) return;
    window.animakima_plugin_loaded = true;

    // --- 1. Реєстрація джерела ---
    function registerSource() {
        if (typeof Lampa.Source !== 'undefined' && typeof Lampa.Source.add === 'function') {
            Lampa.Source.add('animakima', {
                title: 'Animakima',
                search: searchFunction,
                full: fullFunction,
                play: playFunction
            });
            console.log('[Animakima] Source registered successfully.');
        } else {
            console.error('[Animakima] Failed to register source: Lampa.Source not available.');
        }
    }

    // --- 2. Основна логіка плагіна ---
    const BASE_URL = 'https://animakima.ru';

    // Функція для виконання HTTP-запитів
    function fetchPage(url) {
        return new Promise((resolve, reject) => {
            if (typeof Lampa.Api !== 'undefined' && typeof Lampa.Api.fetch === 'function') {
                Lampa.Api.fetch(url, (data) => resolve(data), reject);
            } else if (typeof Lampa.Utils !== 'undefined' && typeof Lampa.Utils.ajax === 'function') {
                Lampa.Utils.ajax(url, resolve, reject);
            } else {
                reject(new Error('No suitable fetch method available'));
            }
        });
    }

    // Функція пошуку
    async function searchFunction(query, callback) {
        if (!query || query.trim() === '') {
            callback([]);
            return;
        }

        try {
            const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
            const html = await fetchPage(searchUrl);
            const results = [];

            // Парсимо результати пошуку
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Аналіз структури сторінки: результати пошуку знаходяться в блоці .shortStory
            const items = doc.querySelectorAll('.shortStory');
            items.forEach(item => {
                const titleElem = item.querySelector('h2 a');
                const title = titleElem ? titleElem.textContent.trim() : '';
                const url = titleElem ? titleElem.getAttribute('href') : '';
                
                if (title && url) {
                    const id = url.split('/').filter(Boolean).pop();
                    results.push({
                        id: id,
                        title: title,
                        poster: null, // Можна додати парсинг постера
                        description: '',
                        source: 'animakima'
                    });
                }
            });

            callback(results);
        } catch (error) {
            console.error('[Animakima] Search error:', error);
            callback([]);
        }
    }

    // Функція отримання детальної інформації
    async function fullFunction(params, callback) {
        if (!params || !params.id) {
            callback(params);
            return;
        }

        try {
            const pageUrl = `${BASE_URL}/pages/${params.id}`;
            const html = await fetchPage(pageUrl);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Отримуємо опис
            let description = '';
            const descElem = doc.querySelector('.fullStory .description');
            if (descElem) {
                description = descElem.textContent.trim();
            }

            // Отримуємо список серій
            const episodes = [];
            const episodeLinks = doc.querySelectorAll('.episodes a');
            episodeLinks.forEach(link => {
                const episodeUrl = link.getAttribute('href');
                if (episodeUrl && episodeUrl.includes('/episodes/')) {
                    episodes.push({
                        id: episodeUrl.split('/').filter(Boolean).pop(),
                        title: link.textContent.trim(),
                        url: `${BASE_URL}${episodeUrl}`
                    });
                }
            });

            // Оновлюємо параметри
            params.description = description;
            params.episodes = episodes;
            callback(params);
        } catch (error) {
            console.error('[Animakima] Full info error:', error);
            callback(params);
        }
    }

    // Функція отримання посилання на відео
    async function playFunction(params, callback) {
        if (!params || !params.url) {
            callback(null);
            return;
        }

        try {
            const html = await fetchPage(params.url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Шукаємо відео-плеєр
            const videoElem = doc.querySelector('video source');
            if (videoElem) {
                const videoUrl = videoElem.getAttribute('src');
                if (videoUrl) {
                    callback(videoUrl);
                    return;
                }
            }

            // Альтернативний пошук iframe
            const iframe = doc.querySelector('iframe');
            if (iframe) {
                const iframeSrc = iframe.getAttribute('src');
                if (iframeSrc) {
                    callback(iframeSrc);
                    return;
                }
            }

            callback(null);
        } catch (error) {
            console.error('[Animakima] Play error:', error);
            callback(null);
        }
    }

    // --- 3. Запуск плагіна ---
    if (window.appready) {
        registerSource();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') registerSource();
        });
    }
})();
