(function () {
    'use strict';

    if (window.animakima_plugin_loaded) return;
    window.animakima_plugin_loaded = true;

    function registerSource() {
        // --- 1. Реєстрація джерела ---
        if (typeof Lampa.Api !== 'undefined' && typeof Lampa.Api.addSource === 'function') {
            Lampa.Api.addSource({ title: 'Animakima', value: 'animakima' });
        } else if (typeof Lampa.Source !== 'undefined' && typeof Lampa.Source.add === 'function') {
            Lampa.Source.add('animakima', { title: 'Animakima' });
        } else if (Lampa.Params && Lampa.Params.values) {
            if (!Lampa.Params.values['source']) Lampa.Params.values['source'] = [];
            Lampa.Params.values['source'].push({ title: 'Animakima', value: 'animakima' });
        } else {
            console.error('Animakima: Не вдалося знайти метод реєстрації джерела.');
            return;
        }
        console.log('Animakima: Джерело успішно зареєстровано.');

        // --- 2. Логіка пошуку ---
        Lampa.Api.associate('animakima', {
            search: function (query, callback) {
                if (!query) {
                    callback([]);
                    return;
                }
                var searchUrl = 'https://animakima.ru/search?q=' + encodeURIComponent(query);
                Lampa.Utils.ajax(searchUrl, function (html) {
                    var results = [];
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');
                    var items = doc.querySelectorAll('.search-result-item, .movie-item, .film-item, .anime-item');
                    items.forEach(function (item) {
                        var titleElem = item.querySelector('.title, .name, a');
                        var title = titleElem ? titleElem.textContent.trim() : '';
                        var linkElem = item.querySelector('a');
                        var url = linkElem ? linkElem.getAttribute('href') : '';
                        if (title && url) {
                            var id = url.split('/').filter(Boolean).pop();
                            results.push({
                                id: id,
                                title: title,
                                poster: null,
                                description: '',
                                source: 'animakima'
                            });
                        }
                    });
                    callback(results);
                }, function (error) {
                    console.error('Animakima search error:', error);
                    callback([]);
                });
            },
            full: function (params, callback) {
                // TODO: Отримання детальної інформації (опис, рік, жанри)
                callback(params);
            },
            play: function (params, callback) {
                // TODO: Отримання прямого посилання на відео зі сторінки серії
                callback(null);
            }
        });
        console.log('Animakima: Методи пошуку додано.');
    }

    if (window.appready) {
        registerSource();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') registerSource();
        });
    }
})();
