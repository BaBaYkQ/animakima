(function () {
    'use strict';

    const PLUGIN_NAME = 'animakima';
    const SITE = 'https://animakima.ru';

    function request(url, params = {}) {
        return new Promise((resolve, reject) => {
            Lampa.Reguest.http(Object.assign({
                url: url,
                method: 'GET',
                timeout: 15000,
                success: resolve,
                error: reject
            }, params));
        });
    }

    function parseSearch(html) {
        let items = [];
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        doc.querySelectorAll('.shortstory').forEach(card => {
            let titleEl = card.querySelector('.shortstoryHead h2 a');
            let imgEl = card.querySelector('img');

            if (!titleEl) return;

            items.push({
                id: titleEl.href,
                title: titleEl.textContent.trim(),
                poster_path: imgEl ? imgEl.src : '',
                overview: '',
                source: PLUGIN_NAME
            });
        });

        return items;
    }

    function parseEpisodes(html) {
        let episodes = [];
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');

        doc.querySelectorAll('.playlists-videos .playlists-items li').forEach((ep, index) => {
            episodes.push({
                episode_number: index + 1,
                name: ep.textContent.trim()
            });
        });

        return episodes;
    }

    let source = {
        title: 'Animakima',

        search: function (query, page, call) {
            let url = `${SITE}/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`;

            request(url).then(html => {
                let results = parseSearch(html);

                call({
                    results: results,
                    page: page,
                    total_pages: 1
                });
            }).catch(() => {
                call({
                    results: [],
                    page: page,
                    total_pages: 1
                });
            });
        },

        full: function (item, call) {
            request(item.id).then(html => {
                let episodes = parseEpisodes(html);

                item.episodes = episodes;

                call(item);
            }).catch(() => {
                call(item);
            });
        },

        play: function (item, episode, call) {
            request(item.id).then(html => {
                let match = html.match(/file:"([^"]+)"/);

                if (match && match[1]) {
                    call({
                        url: match[1]
                    });
                } else {
                    call(false);
                }
            }).catch(() => call(false));
        }
    };

    function startPlugin() {
        if (!Lampa.Api.sources) Lampa.Api.sources = {};
        Lampa.Api.sources[PLUGIN_NAME] = source;

        Lampa.SettingsApi.addComponent({
            component: PLUGIN_NAME,
            name: 'Animakima',
            icon: '<svg height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h16v16H4z"/></svg>'
        });

        console.log('Animakima source plugin loaded');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
