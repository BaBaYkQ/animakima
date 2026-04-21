(function () {
    'use strict';

    const SITE = 'https://animakima.ru';

    function request(url, callback, error) {
        Lampa.Reguest.http({
            url: url,
            timeout: 15000,
            success: callback,
            error: error || function(){}
        });
    }

    function parseSearch(html) {
        let results = [];
        let doc = new DOMParser().parseFromString(html, 'text/html');

        doc.querySelectorAll('.shortstory').forEach(card => {
            let link = card.querySelector('.shortstoryHead h2 a');
            let img = card.querySelector('img');

            if (!link) return;

            results.push({
                id: link.href,
                title: link.textContent.trim(),
                original_title: link.textContent.trim(),
                poster_path: img ? img.src : '',
                overview: '',
                source: 'animakima'
            });
        });

        return results;
    }

    function search(params, oncomplite) {
        let url = SITE + '/index.php?do=search&subaction=search&story=' + encodeURIComponent(params.query);

        request(url, function (html) {
            oncomplite({
                results: parseSearch(html)
            });
        }, function () {
            oncomplite({
                results: []
            });
        });
    }

    function full(params, oncomplite) {
        oncomplite(params);
    }

    function play(params, oncomplite) {
        request(params.id, function (html) {
            let match = html.match(/file:"([^"]+)"/);

            if (match && match[1]) {
                oncomplite({
                    url: match[1]
                });
            } else {
                oncomplite(false);
            }
        }, function () {
            oncomplite(false);
        });
    }

    function startPlugin() {
        Lampa.Api.addSource({
            title: 'Animakima',
            search: search,
            full: full,
            play: play
        });

        console.log('Animakima source added');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
