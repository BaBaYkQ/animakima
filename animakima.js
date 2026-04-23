(function () {
    alert('DEBUG: Animakima plugin starting...');
    alert('DEBUG: Lampa ready? ' + (window.appready ? 'yes' : 'no'));

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e){
            if(e.type === 'ready') startPlugin();
        });
    }

    function startPlugin() {
        alert('DEBUG: StartPlugin function called');
        
        try {
            var apiKeys = Object.keys(Lampa.Api || {});
            alert('DEBUG: Lampa.Api keys: ' + JSON.stringify(apiKeys));
        } catch(e) {
            alert('DEBUG: Error: ' + e.message);
        }
    }
})();
