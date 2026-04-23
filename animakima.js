(function () {
    'use strict';

    function startPlugin() {
        console.log('Animakima plugin started');

        if (!Lampa.Storage.get('animakima_source_added')) {
            Lampa.Storage.set('animakima_source_added', true);
        }
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
