(function () {
    'use strict';

    function startPlugin() {
        console.log('=== LAMPA DEBUG START ===');
        console.log('Lampa keys:', Object.keys(Lampa));

        if (Lampa.Params) {
            console.log('Lampa.Params:', Lampa.Params);
            console.log('Lampa.Params.values:', Lampa.Params.values);
        }

        if (Lampa.Api) {
            console.log('Lampa.Api:', Lampa.Api);
            console.log('Lampa.Api.sources:', Lampa.Api.sources);
        }

        if (Lampa.Storage) {
            console.log('Lampa.Storage:', Lampa.Storage);
        }

        console.log('=== LAMPA DEBUG END ===');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
