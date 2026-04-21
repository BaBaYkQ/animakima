(function () {
    'use strict';

    function startPlugin() {
        if (!Lampa.Params.values['source']) {
            Lampa.Params.values['source'] = [];
        }

        Lampa.Params.values['source'].push({
            title: 'Animakima',
            value: 'animakima'
        });

        console.log('Animakima source registered');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
