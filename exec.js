/**
 * Cancellable Javascript Code Runner
 * @version 1.1.2
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

        // cleanup in idle time
        idleCallback(function() {

            // remove listener
            try {
                delete window[id];
            } catch (e) {}

            // add new container to pool
            if (pool.length < poolSize) {
                container(documentElement);
            }
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

    // default poolSize (max idle containers)
    var poolSize = 10;

    // constructor
    var exec = function(code, callback, poolSize) {

        // create container pool
        if (!(this instanceof exec)) {
            poolSize = code;
            var n = code - pool.length;
            if (n > 0) {
                var fragment = document.createDocumentFragment();
                for (var x = 0; x < n; x++) {
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
                i.contentWindow['p' + id].apply(this, arguments);
            }

            // execute code in container
            this.exec = function(code) {
                i.contentWindow[id](code);
            }

            // process data posted from container
            window[id] = callback || function() {};

            // execute code
            d.open();
            d.write('<script>(function() {var ' + o + ';var ' + p + '=parent["' + id + '"];window["p' + id + '"]=' + o + ';window["' + id + '"]=function(f){if (typeof f==="string"){f = new Function("' + p + '", f); } f(' + p + ');if (' + o + '){window["p' + id + '"]=' + o + ';};}})();</scr' + 'ipt>');
            d.close();

            // exec
            this.exec(code);
        }
    };

    // public exec API
    window['exec'] = exec;

})(window);