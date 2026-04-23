(function () {
    'use strict';

    function startPlugin() {
        console.log('Animakima source plugin started');

        if (!Lampa.Params) return;

        if (!Lampa.Params.values.source) {
            Lampa.Params.values.source = [];
        }

        let exists = Lampa.Params.values.source.some(function(s){
            return s.value === 'animakima';
        });

        if (!exists) {
            Lampa.Params.values.source.push({
                title: 'Animakima',
                value: 'animakima'
            });
        }

        console.log('Animakima source registered');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
