// Lampa plugin (draft): send TorrServer playlist to Dune HD native player
(function () {
    'use strict';

    var KEY_ON = 'dune_enabled';
    var KEY_IP = 'dune_ip';

    function getHash(url) {
        var m = /[?&]link=([0-9a-fA-F]{40})/.exec(url || '');
        return m ? m[1] : null;
    }

    function sendToDune(url) {
        var ip = Lampa.Storage.get(KEY_IP, '');
        if (!ip) return Lampa.Noty.show('Dune: укажите IP в настройках');

        var origin = /^(https?:\/\/[^\/]+)/.exec(url)[1];
        var hash = getHash(url);
        if (!hash) return false;

        var playlist = origin + '/stream/playlist.m3u?link=' + hash + '&m3u';
        var cmd = 'http://' + ip + '/cgi-bin/do?cmd=launch_media_url&media_url=' +
            encodeURIComponent(playlist);

        fetch(cmd, { mode: 'no-cors' })
            .then(function () { Lampa.Noty.show('Плейлист отправлен в Dune'); })
            .catch(function () { Lampa.Noty.show('Dune: ошибка соединения'); });
        return true;
    }

    var originalPlay = Lampa.Player.play;
    Lampa.Player.play = function (element) {
        if (Lampa.Storage.get(KEY_ON, 'false') === 'true' && element && element.url) {
            if (sendToDune(element.url)) return; // иначе обычный запуск
        }
        originalPlay.call(Lampa.Player, element);
    };

    // Настройки
    Lampa.Lang.add({
        dune_title: { ru: 'Dune HD', en: 'Dune HD' }
    });

    Lampa.SettingsApi.addComponent({
        component: 'dune_hd',
        name: 'Dune HD',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>'
    });

    Lampa.SettingsApi.addParam({
        component: 'dune_hd',
        param: { name: KEY_ON, type: 'trigger', default: false },
        field: { name: 'Отправлять плейлист в Dune' }
    });

    Lampa.SettingsApi.addParam({
        component: 'dune_hd',
        param: { name: KEY_IP, type: 'input', default: '' },
        field: { name: 'IP адрес Dune', description: 'Например 192.168.1.50' }
    });
})();
