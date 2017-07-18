/**
 * Cancellable Javascript Code Runner
 * @version 1.1.1
 * @link https://github.com/optimalisatie/exec.js
 */
(function(window) {

    // container
    var c, document = window.document,
        documentElement = document.documentElement,
        idleCallback = window.requestIdleCallback || function(fn) {
            fn();
        },
        f = document.createElement('iframe'),
        pool = [];

    // stop code execution
    var stop = function(id, i) {
        try {
            var frm = window.frames[id];

            // IE
            if (typeof frm.stop === 'undefined') {
                frm.document.execCommand('Stop');
            } else {
                frm.stop();
            }
        } catch (e) {}

        // remove container
        try {
            i.parentNode.removeChild(i);
        } catch (e) {}

        // restore pool
        idleCallback(function() {

            // remove listener
            try {
                delete window[id];
            } catch (e) {}

            container(documentElement);
        });
    }

    // event handler
    var e = 'EventListener',
        E = 'Event',
        p = 'postMessage',
        o = 'onmessage';
    e = window['add' + e] ? ['add' + e, 'remove' + e] : ['attach' + E, 'detach' + E];
    E = ((e[0] === 'attach' + E) ? 'on' : '') + 'message';

    // create code execution container
    var container = function(target) {
        var i = f.cloneNode(false);
        i.style.display = 'none';
        target.appendChild(i);
        pool.push(i);
    }

    // constructor
    var exec = function(code, callback, poolSize) {

        // create container pool
        if (!(this instanceof exec)) {
            if (pool.length < code) {
                var fragment = document.createDocumentFragment();
                for (var x = 0; x < code; x++) {
                    container(fragment);
                }
                documentElement.appendChild(fragment);
            }
        } else {

            var runner = this,
                id = "_" + +new Date() + Math.random().toFixed(16).substring(2),
                s, i, stopped;

            // get container from pool
            while (!(i = pool.shift())) {

                // create container
                container(documentElement);
            }

            // initiate code execution container
            i.name = id;
            var d = (i.contentWindow || i.contentDocument);
            if (d.document) {
                d = d.document;
            }

            // stop code execution
            this.stop = function() {

                // stopped
                if (stopped) {
                    return;
                }
                stopped = true;

                // stop
                stop(id, i);
            }

            // post data to container
            this.post = function() {
                i.contentWindow[id].apply(this, arguments);
            }

            // convert to IIFE
            var iife = function(code) {
                return '(' + ((typeof code === 'function') ? code.toString() : 'function(' + p + '){' + code + '}') + ')(' + p + ');';
            }

            // execute code in container
            this.exec = function(code) {
                i.contentWindow['e' + id](iife(code));
            }

            // process data posted from container
            window[id] = callback;

            // execute code
            d.open();
            d.write('<script>(function() {var ' + o + ';var ' + p + '=parent["' + id + '"]||function(){};' + iife(code) + 'window["' + id + '"]=' + o + ';window["e' + id + '"]=function(code){(new Function("' + p + '","' + o + '",code + "if (' + o + ') {window[\'' + id + '\']=' + o + ';}"))(' + p + ',null);}})();</scr' + 'ipt>');
            d.close();
        }
    };

    // public exec API
    window['exec'] = exec;

})(window);