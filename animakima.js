(function () {
    'use strict';

    function startPlugin() {
        console.log('=== API DEBUG START ===');

        console.log('Lampa.Api keys:', Object.keys(Lampa.Api || {}));

        if (Lampa.Params) {
            console.log('Lampa.Params keys:', Object.keys(Lampa.Params || {}));
        }

        if (Lampa.Component) {
            console.log('Lampa.Component keys:', Object.keys(Lampa.Component || {}));
        }

        console.log('=== API DEBUG END ===');
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function(e){
            if(e.type === 'ready') startPlugin();
        });
    }
})();
